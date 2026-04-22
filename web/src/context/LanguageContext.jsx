import { createContext, useState, useEffect, useCallback } from 'react';
import { getLanguage as getStoredLanguage, setLanguage as saveLanguage } from '../services/i18n';

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => getStoredLanguage());

  // Manejar cambios de idioma desde el evento global
  useEffect(() => {
    const handleLanguageChange = (e) => {
      setLanguageState(e.detail);
    };
    
    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, []);

  const setLanguage = useCallback((newLang) => {
    saveLanguage(newLang);
    setLanguageState(newLang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
