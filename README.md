# Sameer GPT v2 — Render-ready Text + Image AI

Sameer GPT is a React + Express personal AI assistant developed by Mohammad Sameer.

## Providers
- Text: Groq OpenAI-compatible API, default model `openai/gpt-oss-20b`
- Images: Pollinations image API, default model `flux`
- Hosting: Render web service

## Local setup
1. Run `npm install`
2. Run `npm run install:all`
3. Copy `server/.env.example` to `server/.env`
4. Put your Groq key in `GROQ_API_KEY`
5. Put your Pollinations key in `POLLINATIONS_API_KEY`
6. Run `npm run build`
7. Run `npm start`
8. Open `http://localhost:3000`

There is no `setup-db` command because this starter does not require a database.

## Render
Push the project to GitHub and create a Render Blueprint from `render.yaml`. Render will ask for `GROQ_API_KEY` and `POLLINATIONS_API_KEY`. Never commit real API keys to GitHub.

## UI improvements in v2
Assistant responses render Markdown, headings, lists, tables, links, blockquotes and code blocks cleanly. User messages use compact chat bubbles and the overall dark layout is more polished.
