# watchbox

A Wails-powered desktop application scaffold for managing watched folder jobs and sinking uploads to Amazon S3.

This repository combines a Go backend with a Vue 3 + Vite frontend, packaged as a native desktop app using Wails.

## What this project includes

- A desktop shell built with `github.com/wailsapp/wails/v2`
- Vue 3 frontend UI under `frontend/`
- Mock job data and UI scaffolding for:
  - scheduled watch jobs
  - S3 destination configuration
  - job enable/disable toggles
  - run-now and batch run actions
  - settings and confirmation dialogs
- Go backend entrypoint in `app.go` and `main.go`

## Tech stack

- Go 1.XX
- Wails 2
- Vue 3
- Vite

## Prerequisites

- Go installed and available on `PATH`
- Node.js and npm installed
- `wails` CLI installed globally for desktop development

## Get started

From the project root:

1. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   cd ..
   ```

2. Start the Wails development environment:

   ```bash
   wails dev
   ```

This launches the Vue development server and the Wails host application. UI changes are reflected immediately.

## Alternative frontend-only development

If you want to work on the Vue UI without running the full desktop shell, use:

```bash
cd frontend
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build for production

From the project root:

```bash
wails build
```

This will build the frontend assets and compile the Go application into a standalone desktop binary.

## Project structure

- `app.go` — Go application logic and method bindings
- `main.go` — Wails application entrypoint and asset embedding
- `wails.json` — Wails project configuration
- `frontend/` — Vue 3 frontend source and Vite config
- `frontend/src/` — application UI components and page logic
- `frontend/package.json` — frontend dependencies and scripts

## Notes

- The current frontend UI is scaffolded with mock job data and TODO comments for wiring real Go methods.
- Backend methods can be added in `app.go` and exposed via Wails bindings.
- Customize the desktop app appearance and behavior through `wails.json` and the Vue components.

## Further reading

- Wails docs: https://wails.io/docs
- Vue 3 docs: https://v3.vuejs.org
- Vite docs: https://vitejs.dev
