import styles from './Button.module.css';

export function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  className = '', 
  disabled = false,
  type = 'button',
  ...props 
}) {
  const baseClass = `${styles.btn} ${styles[variant]} ${className}`;
  
  return (
    <button 
      className={baseClass}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
