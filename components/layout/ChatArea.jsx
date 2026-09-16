'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Mic, Volume2, VolumeX, Send } from 'lucide-react';
import styles from './ChatArea.module.css';
import { modes } from '@/lib/modes';
import { playTypingSound, playResponseSound } from '@/lib/soundManager';

// ─── Markdown renderer ────────────────────────────────────────────────────────
function mdToHtml(raw) {
  if (!raw) return '';

  let t = raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/^---+$/gm, '<hr/>')
    .replace(/^[*-] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    .replace(/\n\n+/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');

  return t;
}

// ─── Persona avatar ───────────────────────────────────────────────────────────
function PersonaAvatar({ persona }) {
  return (
    <span
      style={{
        width: 36, height: 36,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `rgba(${persona?.scene?.accentRgb || '226,88,34'}, 0.15)`,
        border: `1px solid rgba(${persona?.scene?.accentRgb || '226,88,34'}, 0.35)`,
        fontSize: '1.1rem', flexShrink: 0, marginTop: 4,
        boxShadow: `0 0 10px rgba(${persona?.scene?.accentRgb || '226,88,34'}, 0.2)`,
      }}
    >
      {persona?.scene?.glyph || '?'}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ChatArea({
  persona,
  currentMode, setCurrentMode,
  voiceEnabled, setVoiceEnabled,
  messages: externalMessages,
  setMessages: setExternalMessages,
}) {
  const endRef   = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const themeColor = `rgb(${persona?.scene?.accentRgb || '226,88,34'})`;
  const themeRgb   = persona?.scene?.accentRgb || '226,88,34';

  const [input,     setInput]     = useState('');
  const [messages,  setMessages]  = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync to parent
  useEffect(() => {
    if (setExternalMessages) setExternalMessages(messages);
  }, [messages]); // eslint-disable-line

  // Clear when parent requests new chat
  useEffect(() => {
    if (externalMessages && externalMessages.length === 0 && messages.length > 0) {
      setMessages([]);
    }
  }, [externalMessages]); // eslint-disable-line

  // Auto-scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputWithSound = useCallback((e) => {
    if (voiceEnabled) playTypingSound();
    setInput(e.target.value);
  }, [voiceEnabled]);

  // ─── Core send function using plain fetch + streaming ──────────────────────
  const handleSend = async (text) => {
    if (!text?.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setIsLoading(true);

    // Build the message history for the API (plain {role, content} format)
    const apiMessages = history.map(m => ({ role: m.role, content: m.content }));

    // Placeholder for streaming AI response
    const aiMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMsgId, role: 'assistant', content: '' }]);

    try {
      abortRef.current = new AbortController();

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          personaId: persona?.id,
          modeId:    currentMode?.id,
          provider:  'gemini',
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error ${res.status}: ${errText}`);
      }

      // Read the SSE stream and accumulate text
      // Format: "data: {"type":"text-delta","textDelta":"chunk"}\n\n"
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // keep incomplete last line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') continue;
          try {
            const event = JSON.parse(dataStr);
            // text-delta events carry the streamed text
            if (event.type === 'text-delta' && typeof event.delta === 'string') {
              accumulated += event.delta;
              setMessages(prev =>
                prev.map(m => m.id === aiMsgId ? { ...m, content: accumulated } : m)
              );
            }
          } catch { /* skip malformed lines */ }
        }
      }

      // TTS on finish
      if (voiceEnabled) {
        playResponseSound(persona?.id);
        if (typeof window !== 'undefined' && window.speechSynthesis && accumulated) {
          const utter = new SpeechSynthesisUtterance(accumulated);
          utter.rate = 0.9; utter.pitch = 0.8;
          window.speechSynthesis.speak(utter);
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[Chat] Error:', err);
      setMessages(prev =>
        prev.map(m => m.id === aiMsgId
          ? { ...m, content: `*The oracle falls silent. An error has occurred: ${err.message}*` }
          : m
        )
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSend(input);
  };

  const suggestions = [
    persona?.specialties?.[0] ? `Tell me about ${persona.specialties[0]}` : 'What can you help me with?',
    'What lies beyond the fog?',
    'Guide me, I am lost',
  ];

  return (
    <div
      className={styles.chatArea}
      style={{ '--theme-color': themeColor, '--theme-rgb': themeRgb }}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <img
            src={`/portrait_${persona?.id}.jpg`}
            alt={persona?.name}
            className={styles.headerAvatar}
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <span
            style={{
              display: 'none',
              width: 52, height: 52, borderRadius: '50%',
              background: `rgba(${themeRgb}, 0.15)`,
              border: `1px solid rgb(${themeRgb})`,
              alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem',
              boxShadow: `0 0 18px rgba(${themeRgb}, 0.4)`,
              flexShrink: 0,
            }}
          >
            {persona?.scene?.glyph}
          </span>

          <div className={styles.headerText}>
            <h1 className={styles.headerTitle}>{persona?.name || 'Choose a Guide'}</h1>
            <p className={styles.headerMode}>{currentMode?.name || 'Wanderer Mode'}</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            className={`${styles.actionBtn} ${voiceEnabled ? styles.activeActionBtn : ''}`}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? 'Mute all sounds' : 'Enable sounds'}
          >
            {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </header>

      {/* ── Runic divider ─────────────────────────────────────────────────── */}
      <div className={styles.runicDivider}>✦</div>

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <div className={styles.messagesContainer}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyGlyph}>{persona?.scene?.glyph || '⚗'}</div>
            <h2 className={styles.emptyTitle}>{persona?.name || 'The Oracle Awaits'}</h2>
            <p className={styles.emptyTagline}>
              {persona?.scene?.tagline || 'Ask what you will of the darkness...'}
            </p>
            <div className={styles.suggestions}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className={styles.suggestBtn}
                  onClick={() => handleSend(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.messageList}>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`${styles.messageWrapper} ${isUser ? styles.userWrapper : styles.aiWrapper}`}
                >
                  {!isUser && (
                    <div className={styles.messageAvatar}>
                      <PersonaAvatar persona={persona} />
                    </div>
                  )}
                  <div className={`${styles.message} ${isUser ? styles.userMessage : styles.aiMessage}`}>
                    {isUser ? (
                      <span>{msg.content}</span>
                    ) : msg.content ? (
                      <div
                        className="ai-content"
                        dangerouslySetInnerHTML={{ __html: mdToHtml(msg.content) }}
                      />
                    ) : (
                      <div className={styles.loading}>
                        <div className={styles.dot} />
                        <div className={styles.dot} />
                        <div className={styles.dot} />
                        <span className={styles.loadingLabel}>
                          {persona?.name?.split(' ')[1] || 'Oracle'} speaks...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* ── Input area ────────────────────────────────────────────────────── */}
      <div className={styles.inputArea}>
        <div className={styles.modeBar}>
          {modes.map(m => (
            <button
              key={m.id}
              className={`${styles.modePill} ${currentMode?.id === m.id ? styles.activePill : ''}`}
              onClick={() => setCurrentMode(m)}
            >
              {m.name}
            </button>
          ))}
        </div>

        <form className={styles.inputForm} onSubmit={onSubmit}>
          <button type="button" className={styles.micBtn} title="Voice input (coming soon)">
            <Mic size={18} />
          </button>
          <input
            ref={inputRef}
            className={styles.inputField}
            value={input}
            onChange={handleInputWithSound}
            placeholder={persona?.quote ? `"${persona.quote.slice(0, 55)}..."` : 'Ask what you will, wanderer...'}
            disabled={isLoading}
            autoComplete="off"
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(e); } }}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={!input.trim() || isLoading}
            title="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
