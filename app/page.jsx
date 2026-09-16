'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { personas } from '@/lib/personas';
import dynamic from 'next/dynamic';
import styles from './page.module.css';

const CinematicIntro = dynamic(() => import('@/components/effects/CinematicIntro').then(mod => mod.CinematicIntro), {
  ssr: false,
});

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <CinematicIntro />
      <div className="bg-fx" style={{ backgroundImage: 'url(/bg_ruined_sanctuary.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }}></div>
      
      <header className={styles.header}>
        <div className={styles.logo}>Ashen Oracle</div>
        <nav className={styles.nav}>
          <Link href="/chat">Awaken</Link>
          <a href="#about">Lore</a>
          <a href="#guides">Guides</a>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.title}>Ashen Oracle</h1>
          <p className={styles.subtitle}>Speak, wanderer. Even in a dying world, an answer may yet be found.</p>
          
          <div className={styles.heroActions}>
            <Link href="/chat">
              <Button variant="primary" className={styles.ctaBtn}>Awaken the Oracle</Button>
            </Link>
            <a href="#guides">
              <Button variant="secondary" className={styles.ctaBtn}>Choose Your Guide</Button>
            </a>
          </div>
        </section>

        <section id="about" className={styles.about}>
          <div className={styles.contentBox}>
            <h2>A Sanctuary Between Worlds</h2>
            <p>
              Ashen Oracle is an AI companion for wanderers traversing harsh realms. Whether you seek lost lore, 
              strategies to fell a nightmare, or merely the quiet company of a fire keeper, your questions will be answered.
            </p>
            <p>
              Powered by advanced models like Gemini, Groq, or your own local instances, the Oracle speaks in the voice 
              of six distinct guides, each waiting to share their wisdom.
            </p>
          </div>
        </section>

        <section id="guides" className={styles.guides}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Guides</h2>
            <p className={styles.sectionSubtitle}>Choose the voice that leads you through the fog.</p>
          </div>
          
          <div className={styles.guidesGrid}>
            {personas.map(persona => (
              <div key={persona.id} className={styles.guideCard} style={{ '--card-theme': persona.scene.accentRgb }}>
                <div className={styles.guideCardHeader}>
                  <div className={styles.guideAvatar}>
                    <img
                      src={`/portrait_${persona.id}.jpg`}
                      alt={persona.name}
                      className={styles.guideImg}
                      onError={e => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className={styles.guideFallback}>
                      {persona.scene.glyph}
                    </div>
                  </div>
                  <div>
                    <h3 className={styles.guideName}>{persona.name}</h3>
                    <p className={styles.guideRole}>{persona.scene.tagline}</p>
                  </div>
                </div>
                
                <div className={styles.guideQuote}>
                  "{persona.quote}"
                </div>

                <div className={styles.guideDesc}>
                  {persona.systemPrompt.split('Instructions:')[0].replace('Personality:', '').replace('Speech style:', '').replace(`You are ${persona.name}.`, '').trim()}
                </div>
                
                <div className={styles.guideTags}>
                  {persona.specialties.map(spec => (
                    <span key={spec} className={styles.tag}>{spec}</span>
                  ))}
                </div>
                
                <Link href={`/chat?guide=${persona.id}`} className={styles.awakenLink}>
                  Awaken {persona.name.split(' ')[1]}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Created by the Fire. Not affiliated with any official Soulslike franchise. All lore is generated or derived from public knowledge.</p>
      </footer>
    </div>
  );
}
