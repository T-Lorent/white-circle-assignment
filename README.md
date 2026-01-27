# AI Chat Application

A ChatGPT-like application built with Next.js, featuring real-time streaming responses from Claude (Anthropic's AI), a conversation history sidebar, and SQLite database persistence.

## Features

- Real-time streaming responses from Claude AI
- Create and manage multiple conversations
- Chat history persisted in SQLite database
- Modern UI with Tailwind CSS and Shadcn UI components
- Markdown rendering for AI responses
- Responsive design with collapsible sidebar

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: Tailwind CSS v4 + Shadcn UI
- **LLM**: Anthropic Claude (via `@anthropic-ai/sdk`)
- **Database**: SQLite with Drizzle ORM
- **Markdown**: react-markdown + remark-gfm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- An Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Set up your environment variables:

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local and add your Anthropic API key
ANTHROPIC_API_KEY=your_api_key_here
```

3. Initialize the database:

```bash
pnpm db:push
```

4. Start the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm db:push` - Push database schema changes
- `pnpm db:studio` - Open Drizzle Studio to manage database

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # Streaming chat endpoint
│   │   └── conversations/ # Conversation CRUD endpoints
│   ├── chat/[id]/         # Chat page
│   ├── layout.tsx         # Root layout with sidebar
│   └── page.tsx           # Home page
├── components/
│   ├── chat/              # Chat UI components
│   ├── sidebar/           # Sidebar components
│   └── ui/                # Shadcn UI components
└── lib/
    ├── db/                # Database schema and connection
    ├── anthropic.ts       # Anthropic client configuration
    └── utils.ts           # Utility functions
```

## License

MIT
