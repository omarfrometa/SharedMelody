import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import esTranslations from '../languages/es.json';
import enTranslations from '../languages/en.json';
import zhTranslations from '../languages/zh.json';
import frTranslations from '../languages/fr.json';
import ptTranslations from '../languages/pt.json';
import ruTranslations from '../languages/ru.json';
import deTranslations from '../languages/de.json';
import hiTranslations from '../languages/hi.json';
import jaTranslations from '../languages/ja.json';

// Tipos para las traducciones
type TranslationKeys = typeof esTranslations;
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<TranslationKeys>;

// Idiomas disponibles
export type Language = 'es' | 'en' | 'zh' | 'fr' | 'pt' | 'ru' | 'de' | 'hi' | 'ja';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const availableLanguages: LanguageInfo[] = [
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'zh',
    name: 'Chinese (Mandarin)',
    nativeName: '中文',
    flag: '🇨🇳'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵'
  }
];

// Traducciones
const translations = {
  es: esTranslations,
  en: enTranslations,
  zh: zhTranslations,
  fr: frTranslations,
  pt: ptTranslations,
  ru: ruTranslations,
  de: deTranslations,
  hi: hiTranslations,
  ja: jaTranslations
};

// Contexto
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  availableLanguages: LanguageInfo[];
  resetToDetectedLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Función para obtener valor anidado del objeto
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// Función para reemplazar parámetros en el texto
function replaceParams(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;

  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  }, text);
}

// Función para detectar el idioma del navegador
function detectBrowserLanguage(): Language {
  // Obtener idiomas preferidos del navegador
  const browserLanguages = navigator.languages || [navigator.language];

  // Mapeo de códigos de idioma del navegador a nuestros códigos
  const languageMap: Record<string, Language> = {
    'es': 'es',
    'es-ES': 'es',
    'es-MX': 'es',
    'es-AR': 'es',
    'es-CO': 'es',
    'es-CL': 'es',
    'es-PE': 'es',
    'es-VE': 'es',
    'en': 'en',
    'en-US': 'en',
    'en-GB': 'en',
    'en-CA': 'en',
    'en-AU': 'en',
    'zh': 'zh',
    'zh-CN': 'zh',
    'zh-Hans': 'zh',
    'zh-TW': 'zh',
    'zh-Hant': 'zh',
    'fr': 'fr',
    'fr-FR': 'fr',
    'fr-CA': 'fr',
    'fr-BE': 'fr',
    'fr-CH': 'fr',
    'pt': 'pt',
    'pt-BR': 'pt',
    'pt-PT': 'pt',
    'ru': 'ru',
    'ru-RU': 'ru',
    'de': 'de',
    'de-DE': 'de',
    'de-AT': 'de',
    'de-CH': 'de',
    'hi': 'hi',
    'hi-IN': 'hi',
    'ja': 'ja',
    'ja-JP': 'ja'
  };

  // Buscar el primer idioma soportado
  for (const browserLang of browserLanguages) {
    // Buscar coincidencia exacta
    if (languageMap[browserLang]) {
      return languageMap[browserLang];
    }

    // Buscar coincidencia por código base (ej: 'es' de 'es-MX')
    const baseLang = browserLang.split('-')[0];
    if (languageMap[baseLang]) {
      return languageMap[baseLang];
    }
  }

  // Si no se encuentra ningún idioma soportado, usar inglés por defecto
  return 'en';
}

// Provider del contexto
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Obtener idioma guardado, detectar del navegador, o usar inglés por defecto
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;

    // Si hay un idioma guardado y es válido, usarlo
    if (savedLanguage && availableLanguages.some(lang => lang.code === savedLanguage)) {
      return savedLanguage;
    }

    // Si no hay idioma guardado, detectar del navegador
    const detectedLanguage = detectBrowserLanguage();

    // Log para debug
    console.log('🌍 Idioma detectado del navegador:', detectedLanguage);
    console.log('🗣️ Idiomas del navegador:', navigator.languages || [navigator.language]);

    // Guardar el idioma detectado en localStorage para futuras visitas
    localStorage.setItem('language', detectedLanguage);

    return detectedLanguage;
  });

  // Función para cambiar idioma
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // Cambiar el atributo lang del documento
    document.documentElement.lang = newLanguage;
  };

  // Función de traducción
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[language], key);
    return replaceParams(translation, params);
  };

  // Función para resetear al idioma detectado del navegador
  const resetToDetectedLanguage = () => {
    const detectedLanguage = detectBrowserLanguage();
    console.log('🔄 Reseteando al idioma detectado:', detectedLanguage);
    setLanguage(detectedLanguage);
  };

  // Establecer idioma inicial en el documento
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    availableLanguages,
    resetToDetectedLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook para usar el contexto
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Hook simplificado para solo obtener la función de traducción
export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};

export default LanguageContext;
