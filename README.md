# UIGen

AI-powered React component generator with live preview.

## Prerequisites

- Node.js 18+
- npm

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/mrdavidlong/uigen
cd uigen
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Then edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_real_anthropic_api_key
```

The project will run without an API key. Rather than using a LLM to generate components, static code will be returned instead.

3. Install dependencies and initialize database

```bash
npm run setup
```

This command will:

- Install all dependencies
- Generate Prisma client
- Run database migrations

4. To add the Playwright server to Claude Code, run this command in your terminal (not inside Claude Code):

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

## Running the Application

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Sign up or continue as anonymous user
2. Describe the React component you want to create in the chat
3. View generated components in real-time preview
4. Switch to Code view to see and edit the generated files
5. Continue iterating with the AI to refine your components

## Features

- AI-powered component generation using Claude
- Live preview with hot reload
- Virtual file system (no files written to disk)
- Syntax highlighting and code editor
- Component persistence for registered users
- Export generated code

## Tech Stack

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Prisma with SQLite
- Anthropic Claude AI
- Vercel AI SDK
