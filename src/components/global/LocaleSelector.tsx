import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { localizationService, LocaleConfig } from '@/services/localizationService';
import { Languages, Globe } from 'lucide-react';

interface LocaleSelectorProps {
  showCard?: boolean;
}

export const LocaleSelector = ({ showCard = false }: LocaleSelectorProps) => {
  const [locales, setLocales] = useState<LocaleConfig[]>([]);
  const [currentLocale, setCurrentLocale] = useState('');

  useEffect(() => {
    loadLocales();
    localizationService.loadSavedLocale();
    setCurrentLocale(localizationService.getLocale());
  }, []);

  const loadLocales = () => {
    const availableLocales = localizationService.getLocales();
    setLocales(availableLocales);
  };

  const handleLocaleChange = (locale: string) => {
    localizationService.setLocale(locale);
    setCurrentLocale(locale);
    
    // Trigger page refresh to apply new locale
    window.location.reload();
  };

  const LocaleSelect = () => (
    <div className="flex items-center gap-2">
      <Languages className="h-4 w-4" />
      <Select value={currentLocale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {locales.map((locale) => (
            <SelectItem key={locale.code} value={locale.code}>
              <div className="flex items-center gap-2">
                <span>{locale.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({locale.currency})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Language & Region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Language & Currency
            </label>
            <LocaleSelect />
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              Changing the language will also update currency formatting and number formats
              to match your selected region.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Sample Price:</span>
              <div className="mt-1">
                {localizationService.formatCurrency(1234.56)}
              </div>
            </div>
            <div>
              <span className="font-medium">Sample Date:</span>
              <div className="mt-1">
                {localizationService.formatDate(new Date())}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <LocaleSelect />;
};