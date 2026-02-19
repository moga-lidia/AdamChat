import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import type { Lang } from "@/types/chat";
import { translations, type TranslationKeys } from "@/i18n";

interface I18nContextValue {
  lang: Lang;
  t: TranslationKeys;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "ro",
  t: translations.ro,
  setLang: () => {},
});

export function I18nProvider({ children }: PropsWithChildren) {
  const [lang, setLangState] = useState<Lang>("ro");

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
