# Technology Stack

Ashen Oracle is built using a highly modern and opinionated web stack designed for performance, AI integration, and atmospheric UX.

## Core Framework
- **Next.js (App Router)**: Version 16+ using Turbopack. Chosen for its robust serverless API routing, built-in file-based routing, and optimal rendering performance.
- **React**: Powers the component-based UI.

## AI & LLM Infrastructure
- **Vercel AI SDK (`ai` & `@ai-sdk/react`)**: Version 4.0+. Simplifies the complexities of streaming UI text generation and manages message arrays automatically.
- **Model Providers**:
  - **Google Generative AI (`@ai-sdk/google`)**: Powers the primary LLM interaction (Gemini models).
  - **OpenAI Compatible (`@ai-sdk/openai`)**: Used to interface with Groq, OpenRouter, and local Ollama instances via custom base URLs.

## Visuals & UX
- **Vanilla CSS Modules**: Ensures completely scoped, collision-free styling without the bloat of large utility frameworks, providing precise control over the Gothic, glassmorphic UI.
- **Lucide React**: Lightweight, clean SVG icon library.
- **HTML5 Video API**: Handles the seamless, un-clickable cinematic intro preloader.

## Audio Engine
- **Web Audio API**: Instead of loading large static audio files, ambient soundscapes (fire, wind, caves) are procedurally generated entirely on the client side using oscillators and noise buffers. This results in zero bandwidth overhead for audio.
