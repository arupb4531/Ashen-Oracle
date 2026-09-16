'use client';

import { useState } from 'react';
import styles from './Sidebar.module.css';
import { Settings, Plus, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { personas } from '@/lib/personas';

export function Sidebar({ currentPersona, setCurrentPersona, onNewChat }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        {!collapsed && <h2 className={styles.title}>Ashen Oracle</h2>}
        <button
          className={styles.toggleBtn}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Main content */}
      <div className={styles.content}>
        <button className={styles.newChatBtn} onClick={onNewChat}>
          <Plus size={16} />
          {!collapsed && <span>New Conversation</span>}
        </button>

        {/* Guide list */}
        <div className={styles.section}>
          {!collapsed && (
            <h3 className={styles.sectionTitle}>Your Guide</h3>
          )}
          <div className={styles.guidesList}>
            {personas.map(persona => (
              <button
                key={persona.id}
                className={`${styles.guideItem} ${currentPersona?.id === persona.id ? styles.activeGuide : ''}`}
                onClick={() => setCurrentPersona(persona)}
                style={{ '--theme-color': `rgb(${persona.scene.accentRgb})` }}
                title={persona.name}
              >
                <span className={styles.guideGlyph}>{persona.scene.glyph}</span>
                {!collapsed && (
                  <span className={styles.guideName}>{persona.name}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Link href="/" className={styles.homeBtn} title="Return to Sanctuary">
          <Home size={16} />
          {!collapsed && <span>Return to Sanctuary</span>}
        </Link>
        <button className={styles.footerBtn} title="Settings">
          <Settings size={16} />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}
