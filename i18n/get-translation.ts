import type { Lang } from "@/types/chat";
import { translations, type TranslationKeys } from "./translations";

export function getTranslation(lang: Lang): TranslationKeys {
  return translations[lang];
}
