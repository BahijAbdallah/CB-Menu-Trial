import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export function useLocale() {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState(i18n.resolvedLanguage || i18n.language || "en");
  useEffect(() => {
    const onChange = (lng: string) => setLocale(lng);
    i18n.on("languageChanged", onChange);
    return () => i18n.off("languageChanged", onChange);
  }, [i18n]);
  return locale;
}