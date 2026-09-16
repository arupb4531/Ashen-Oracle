# Architecture Overview

Ashen Oracle follows a modern Next.js (App Router) architecture tailored for building AI-integrated conversational interfaces with rich, dynamic front-end experiences.

## Core Structure

```text
ashen-oracle/
├── app/
│   ├── layout.jsx        # Root HTML layout and global providers
│   ├── page.jsx          # Entry point (Dynamic cinematic intro and routing)
│   ├── chat/
│   │   └── page.jsx      # Main application interface and chat view
│   └── api/
│       └── chat/         # Serverless API endpoint for LLM handling
├── components/
│   ├── effects/          # Visual & Audio Effects
│   │   ├── CinematicIntro.jsx    # Preloader video overlay
│   │   └── SceneBackground.jsx   # Particle and visual ambiance
│   └── layout/           # Main UI Components
│       ├── ChatArea.jsx  # Chat window and useChat integration
│       └── Sidebar.jsx   # Persona selection and settings navigation
├── lib/
│   ├── llm-providers.js  # Provider configuration (Gemini, Groq, OpenRouter)
│   ├── personas.js       # Data structure for the different Guides
│   ├── modes.js          # Tone/Style modifiers for the AI
│   └── soundManager.js   # Procedural Web Audio API synthesizer
└── public/               # Static assets (fonts, videos, images)
```

## Component Interaction

1. **State Management**: State is primarily managed at the `app/chat/page.jsx` level, ensuring the `Sidebar` and `ChatArea` stay in sync. The `currentPersona` dictates the theme, background visuals, and audio.
2. **Client-Side vs Server-Side**: The application aggressively utilizes Next.js Serverless Functions for API routes (`api/chat/route.js`) to protect API keys. The UI components are heavily Client Components (`'use client'`) due to the interactive nature of the AI streaming, audio synthesis, and visual effects.
3. **Session Persistence**: Certain features, like skipping the cinematic intro upon returning to the home screen, utilize `sessionStorage` in dynamically imported components (to prevent hydration errors).

## Theming and Styles

Styling is handled via **CSS Modules**. Each major component has a corresponding `.module.css` file.
Global CSS variables (`globals.css`) are injected dynamically based on the selected persona's `scene.accentRgb` to alter the entire application's mood in real-time.

## Deployment Architecture

Ashen Oracle is optimized for deployment on **Vercel**, taking full advantage of their Edge Network and Serverless Functions:

1. **Hosting**: Hosted on Vercel at `https://ashen-oracle.vercel.app`.
2. **Serverless APIs**: The `/api/chat` endpoints run as Vercel Serverless Functions, ensuring scalable and secure handling of API keys without exposing them to the client.
3. **Static Assets**: The `intro.mp4` video and ambient images in the `public/` directory are heavily cached at the edge for rapid delivery worldwide.
4. **Environment Security**: All provider keys (`GEMINI_API_KEY`) are managed strictly within Vercel's Environment Variables dashboard.
