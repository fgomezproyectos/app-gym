// useLanguage.js — Hook para usar traducciones fácilmente en componentes
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { t, getLanguage, setLanguage as saveLanguage } from '../services/i18n';

export function useLanguage() {
  const context = useContext(LanguageContext);

  // Fallback si el contexto no está disponible (fuera del Provider)
  if (!context) {
    return {
      language: getLanguage(),
      t: (key) => t(key, getLanguage()),
      setLanguage: saveLanguage,
    };
  }

  return {
    language: context.language,
    t: (key) => t(key, context.language),
    setLanguage: context.setLanguage,
  };
}
