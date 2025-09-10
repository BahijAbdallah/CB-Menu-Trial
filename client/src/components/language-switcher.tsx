import { useTranslation } from "react-i18next";

const languages = [
  { code: 'en', name: 'EN' },
  { code: 'ar', name: 'AR' },
  { code: 'fr', name: 'FR' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const languageCode = event.target.value;
    i18n.changeLanguage(languageCode);
    // Update HTML dir attribute for RTL support
    document.documentElement.dir = languageCode === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = languageCode;
  };

  return (
    <select
      className="pill"
      aria-label="Language"
      value={i18n.language}
      onChange={changeLanguage}
    >
      {languages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </select>
  );
}