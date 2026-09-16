# Ashen Oracle

Ashen Oracle is a dark-fantasy web application that serves as an immersive AI assistant for game lore, combat strategies, and equipment upgrades. Inspired by the grim and atmospheric worlds of Souls-like games, it provides users with distinct "Guides"—each possessing unique personalities, thematic styling, and procedural ambient audio—to answer questions and assist in their journeys.

## Features

- **Cinematic Experience:** Features a fullscreen video preloader that acts as an atmospheric entry point before transitioning seamlessly into the application.
- **Multiple AI Guides (Personas):** Choose from specialized guides like The Ember Keeper, The Oathbound Knight, or The Hollow Scholar. Each guide alters the UI theme, dialogue style, and system prompt.
- **Dynamic Audio System:** Procedural ambient soundscapes (e.g., crackling fire, howling wind, echoing tombs) mapped to the selected guide using the Web Audio API.
- **Robust LLM Architecture:** Powered by the Vercel AI SDK, with a built-in provider cascade. Primary responses are handled by Google's Gemini models, with easy configurations to fallback to Groq, OpenRouter, or local Ollama instances.
- **Gothic Aesthetics:** Custom CSS Modules featuring deep blacks, muted golds, steel blues, and blood reds, complete with custom glyphs and glassmorphism elements.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI Library:** [React](https://reactjs.org/)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/)
- **Styling:** Vanilla CSS Modules (`.module.css`)
- **Icons:** [Lucide React](https://lucide.dev/)

## Architecture Overview

The application follows a clean separation of concerns using the Next.js App Router:

- **`app/`**: Contains the main page layouts, routing logic, and the `api/chat/route.js` endpoint which securely processes messages and connects to the LLM providers.
- **`components/`**: 
  - `effects/`: Contains the `CinematicIntro` and `SceneBackground` components responsible for the visual and atmospheric heavy lifting.
  - `layout/`: Houses the core UI structures such as the `Sidebar` and `ChatArea`.
- **`lib/`**: Contains the business logic.
  - `personas.js` & `modes.js`: Defines the data structures and system prompts for the different guides and interaction modes.
  - `llm-providers.js`: Manages the LLM client instantiations and model fallback cascade.
  - `soundManager.js`: Handles the Web Audio API integration for ambient background sounds.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- API Keys for your preferred LLM providers (Google Gemini, Groq, OpenRouter, etc.)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ashen-oracle
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment file and fill in your API keys:
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure you have a valid `GEMINI_API_KEY` set as it is the default provider.*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Customizing the AI

### Adding a New Persona
To add a new guide, open `lib/personas.js` and append a new object to the `personas` array. You can define their name, quote, thematic colors, scene type, and the `systemPrompt` that dictates how the AI responds.

### Changing the Default LLM Provider
By default, the application routes chat requests to Gemini. To change this, you can modify the `provider` string passed in the `body` of the `useChat` hook located in `components/layout/ChatArea.jsx`.

## License

This project is licensed under the MIT License.
