# Application Workflow

This document explains the data flow and user journey through the Ashen Oracle application.

## 1. Entry and Initialization
1. User navigates to `/`.
2. `CinematicIntro` mounts. It checks `sessionStorage` to see if the intro has played in this session.
3. If not played, it plays the cinematic video. If autoplay is blocked by the browser, a manual "Awaken" interaction button is presented.
4. Upon completion or skip, the user is seamlessly routed to `/chat`.

## 2. Guide Selection
1. The `Sidebar` component mounts and maps through `personas.js`.
2. The user selects a persona (e.g., "The Hollow Scholar").
3. This triggers a state update in `app/chat/page.jsx`, which:
   - Updates CSS Variables for the theme color.
   - Updates the `SceneBackground` particle effects.
   - Instructs the `soundManager` to synthesize the correct ambient noise.

## 3. Chat Interaction (The LLM Flow)
1. User types a message in the `ChatArea` input.
2. The `useChat` hook calls its `sendMessage` function.
3. The hook automatically appends the user's message to the UI array and triggers a `POST` request to `/api/chat`.
4. The request payload contains the message history, the `personaId`, the `modeId`, and the selected `provider`.

## 4. Server-Side Processing
1. `/api/chat/route.js` receives the payload.
2. It looks up the correct `personaId` to construct a dynamic, highly specific **System Prompt** injected with the Persona's rules and lore.
3. It passes the prompt and message array to `lib/llm-providers.js`.
4. The provider script attempts to stream a response using the primary model. If the primary model hits a rate limit (e.g., HTTP 429), it will automatically cascade to the next available fallback model.
5. The response is piped back to the client as an HTTP stream.

## 5. UI Updates
1. The `useChat` hook on the client intercepts the incoming stream.
2. The UI is updated word-by-word in real time.
3. If voice output is enabled, the completion callback triggers an audio readout of the generated text (if configured).
