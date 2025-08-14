import { useLanguage } from '@/hooks/useLanguage';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'EN', flag: '🇺🇸' },
    { code: 'es', name: 'ES', flag: '🇪🇸' },
    { code: 'ca', name: 'CA', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
    { code: 'hi', name: 'हि', flag: '🇮🇳' }
  ];

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-400" />
      <div className="flex gap-1">
        {languages.map((lang) => (
          <Button
            key={lang.code}
            variant={language === lang.code ? "default" : "ghost"}
            size="sm"
            onClick={() => setLanguage(lang.code as any)}
            className="h-8 px-2 text-xs font-mono"
          >
            {lang.flag} {lang.name}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;