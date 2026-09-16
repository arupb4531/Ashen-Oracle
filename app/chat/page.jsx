'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChatArea } from '@/components/layout/ChatArea';
import { SceneBackground } from '@/components/effects/SceneBackground';
import { personas } from '@/lib/personas';
import { modes } from '@/lib/modes';
import { setAmbientEnabled } from '@/lib/soundManager';
import styles from './page.module.css';

function ChatContent() {
  const searchParams = useSearchParams();
  const guideId = searchParams.get('guide');
  
  const [currentPersona, setCurrentPersona] = useState(() => {
    const found = personas.find(p => p.id === guideId);
    return found || personas[0];
  });

  // Sync state if URL changes while component is mounted
  useEffect(() => {
    if (guideId) {
      const found = personas.find(p => p.id === guideId);
      if (found) setCurrentPersona(found);
    }
  }, [guideId]);
  const [currentMode, setCurrentMode] = useState(modes[0]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [messages, setMessages] = useState([]);

  // Ambient sound management
  useEffect(() => {
    // Map persona scene type to ambient sound type
    // Fallback logic for soundManager ambient configs
    const sceneToAmbient = {
      embers: 'fire',
      fog: 'wind',
      motes: 'cave',
      ravens: 'tomb',
      sparks: 'forge',
      fireflies: 'forest'
    };
    
    // In lib/personas.js, scene objects are defined, but here we can just use ID mapping
    const personaToScene = {
      ember_keeper:    'embers',
      oathbound_knight:'fog',
      hollow_scholar:  'motes',
      grave_prophet:   'ravens',
      old_smith:       'sparks',
      moonlit_duelist: 'fireflies',
    };
    
    const scene = personaToScene[currentPersona.id] || 'embers';
    const ambientType = sceneToAmbient[scene];
    
    setAmbientEnabled(voiceEnabled, ambientType);

    return () => setAmbientEnabled(false);
  }, [currentPersona.id, voiceEnabled]);

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <div className={styles.layout}>
      <SceneBackground personaId={currentPersona.id} />
      
      <Sidebar 
        currentPersona={currentPersona} 
        setCurrentPersona={setCurrentPersona}
        onNewChat={handleNewChat}
      />
      
      <main className={styles.main}>
        <ChatArea 
          persona={currentPersona}
          currentMode={currentMode}
          setCurrentMode={setCurrentMode}
          voiceEnabled={voiceEnabled}
          setVoiceEnabled={setVoiceEnabled}
          messages={messages}
          setMessages={setMessages}
        />
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className={styles.layout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-relic)' }}>Awakening guide...</div>}>
      <ChatContent />
    </Suspense>
  );
}
