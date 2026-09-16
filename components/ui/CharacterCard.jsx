import styles from './CharacterCard.module.css';
import { Play } from 'lucide-react';

export function CharacterCard({ persona, onSelect, selected }) {
  const isSelected = selected?.id === persona.id;

  return (
    <div 
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect(persona)}
      style={{ '--theme-color': persona.theme.color }}
    >
      <div className={styles.imageContainer}>
        <img 
          src={`/portrait_${persona.id}.jpg`} 
          alt={persona.name} 
          className={styles.image}
        />
        {isSelected && <div className={styles.selectionRing}></div>}
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.name}>{persona.name}</h3>
        <p className={styles.quote}>"{persona.quote}"</p>
        
        <div className={styles.tags}>
          {persona.specialties.map(tag => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.previewBtn} 
            onClick={(e) => {
              e.stopPropagation();
              // In a real app, this would play an audio snippet
              console.log(`Playing voice preview for ${persona.name}`);
            }}
            title="Preview Voice"
          >
            <Play size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
