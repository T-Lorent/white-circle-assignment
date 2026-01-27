"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { PiiRange } from "@/app/api/pii/scan/route";

interface UsePiiScannerOptions {
  debounceMs?: number;
  minChunkSize?: number;
}

interface UsePiiScannerReturn {
  piiRanges: PiiRange[];
  scanText: (text: string) => void;
  isScanning: boolean;
  reset: () => void;
  finalScan: () => void;
}

export function usePiiScanner(
  options: UsePiiScannerOptions = {}
): UsePiiScannerReturn {
  const { debounceMs = 500, minChunkSize = 50 } = options;

  const [piiRanges, setPiiRanges] = useState<PiiRange[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const lastScannedLength = useRef(0);
  const currentText = useRef("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  const performScan = useCallback(async (text: string, offset: number) => {
    // Abort any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setIsScanning(true);

    try {
      const response = await fetch("/api/pii/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, offset }),
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error("PII scan failed");
      }

      const data = await response.json();
      
      if (data.piiRanges && Array.isArray(data.piiRanges)) {
        setPiiRanges((prev) => {
          // Merge new ranges with existing ones, avoiding duplicates
          const newRanges = [...prev];
          for (const range of data.piiRanges) {
            const isDuplicate = newRanges.some(
              (existing) =>
                existing.start === range.start && existing.end === range.end
            );
            if (!isDuplicate) {
              newRanges.push(range);
            }
          }
          // Sort by start position
          return newRanges.sort((a, b) => a.start - b.start);
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Request was aborted, ignore
        return;
      }
      console.error("PII scan error:", error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const scanText = useCallback(
    (text: string) => {
      currentText.current = text;

      // Clear existing debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Calculate new content to scan
      const newContentLength = text.length - lastScannedLength.current;

      // Only scan if we have enough new content
      if (newContentLength < minChunkSize) {
        return;
      }

      // Debounce the scan
      debounceTimer.current = setTimeout(() => {
        const offset = lastScannedLength.current;
        const textToScan = text.slice(offset);

        if (textToScan.trim().length > 0) {
          lastScannedLength.current = text.length;
          performScan(textToScan, offset);
        }
      }, debounceMs);
    },
    [debounceMs, minChunkSize, performScan]
  );

  const reset = useCallback(() => {
    // Clear timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    // Abort any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    // Reset state
    setPiiRanges([]);
    setIsScanning(false);
    lastScannedLength.current = 0;
    currentText.current = "";
  }, []);

  // Final scan when streaming ends - scan any remaining content
  const finalScan = useCallback(() => {
    const text = currentText.current;
    if (text.length > lastScannedLength.current) {
      const offset = lastScannedLength.current;
      const textToScan = text.slice(offset);
      if (textToScan.trim().length > 0) {
        lastScannedLength.current = text.length;
        performScan(textToScan, offset);
      }
    }
  }, [performScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  return {
    piiRanges,
    scanText,
    isScanning,
    reset,
    finalScan,
  };
}
