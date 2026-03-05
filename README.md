# IT Tech Arena AI - Architectural & Action Plan

This document outlines the deployment instructions, architectural setup, and how to initialize your platform.

## 1. Local Initialization

### Frontend (Client)
\`\`\`bash
cd client
npx -y create-vite@latest . --template react-ts
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install framer-motion tailwindcss postcss autoprefixer react-router-dom axios socket.io-client
npx tailwindcss init -p
\`\`\`
*(Configure tailwind.config.js for a dark neon theme later)*

### Backend (Server)
\`\`\`bash
cd server
npm init -y
npm install express socket.io cors dotenv jsonwebtoken mysql2 openai bcrypt
npm install -D typescript @types/node @types/express @types/cors @types/jsonwebtoken ts-node
npx tsc --init
\`\`\`

## 2. PWA Setup
To turn the Vite React app into a Progressive Web App:
1. Install Vite PWA Plugin: `npm i vite-plugin-pwa -D`
2. Update `vite.config.ts`:
\`\`\`typescript
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ registerType: 'autoUpdate', manifest: { /* add app icons and colors */ } })
  ]
})
\`\`\`

## 3. Capacitor Setup for Android APK
Capacitor easily wraps a web app into native iOS/Android containers.
1. In the `client` directory:
\`\`\`bash
npm i @capacitor/core
npm i -D @capacitor/cli @capacitor/android
npx cap init
npx cap add android
\`\`\`
2. When ready to build:
\`\`\`bash
npm run build
npx cap sync android
npx cap open android
\`\`\`
*(This opens Android Studio to generate your signed APK)*

## 4. Docker Sandbox setup
In the `docker-sandbox` folder, you need a `Dockerfile` to sandbox execution.
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm install vm2
COPY . .
ENTRYPOINT ["node", "runner.js"]
\`\`\`

You can spin this up dynamically using the backend node process when a user submits standard code by using child processes:
\`\`\`javascript
const { execSync } = require('child_process');
// Pass code inside docker
\`\`\`

## 5. Deployment Guide

**Database:**
1. Use PlanetScale or Railway to provision a MySQL database.
2. Run \`schema.sql\` on the newly provisioned instance.

**Backend (Render):**
1. Add Render as a remote.
2. Ensure `START` scripts compile TypeScript (`npx tsc && node dist/server.js`).
3. Provide ENV VARS: `DB_URL`, `JWT_SECRET`, `OPENAI_API_KEY`.

**Frontend (Vercel):**
1. Connect Vercel to your Github Repository.
2. Set root directory to `client`.
3. Build command: `npm run build`. Let Vercel handle the rest.

## 6. Real-time Leaderboard with Socket.IO
The setup allows for real-time projection natively. Inside `server.ts`:
- Emit `leaderboard_update` on every new submission to all connected admin clients.
- Use `framer-motion` in the frontend (`Leaderboard.tsx`) for `layout` transitions so rows smoothly swap positions.
