import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

export const CLAUDE_SONNET_4_MODEL = "claude-sonnet-4-20250514";
export const CLAUDE_HAIKU_4_5_MODEL = "claude-haiku-4-5-20251001";
export const DEFAULT_MAX_TOKENS = 1024;
