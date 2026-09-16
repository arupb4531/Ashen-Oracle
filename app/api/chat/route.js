import { generateChatResponse } from '@/lib/llm-providers';
import { getPersona } from '@/lib/personas';
import { getMode } from '@/lib/modes';

export async function POST(req) {
  try {
    const { messages, personaId, modeId, provider, modelConfig } = await req.json();

    // 1. Get Persona and Mode
    const persona = getPersona(personaId);
    const mode = getMode(modeId);

    // 2. Construct System Prompt
    const systemPrompt = `
You are an AI assistant in a dark-fantasy web application called Ashen Oracle.
You must adhere strictly to the following persona and mode.

--- PERSONA ---
${persona.systemPrompt}

--- MODE ---
${mode.systemPromptModifier}

--- GLOBAL RULES ---
1. Use original fictional character voices and original audio performances. Do not clone, imitate, or claim to use the real voices of game actors.
2. The site may reference Souls games and discuss their lore where appropriate, but its branding, artwork, voice performances, icons, and character designs should be original. 
3. Do not use copyrighted game logos, direct visual copies of characters, or official voice recordings.
4. Keep the flavor but ensure the actual answer is clear, practical, and highly useful. 
5. Never hallucinate game mechanics. If uncertain, admit it gracefully in character.
6. Format your output in readable Markdown. Use lists, bold text, and line breaks to ensure legibility.
    `;

    // 3. Provider selection with Gemini model auto-fallback cascade
    let selectedProvider = provider || 'gemini';

    const result = await generateChatResponse(messages, systemPrompt, selectedProvider, modelConfig);

    // 4. Return UI Message Stream Response (required for AI SDK v7 useChat)
    return result.toUIMessageStreamResponse();

  } catch (error) {
    console.error('Chat API Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while awakening the Oracle.' 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
