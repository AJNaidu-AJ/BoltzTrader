interface LocaleConfig {
  code: string;
  name: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
  rtl: boolean;
}

interface Translations {
  [key: string]: {
    [locale: string]: string;
  };
}

class LocalizationService {
  private currentLocale = 'en-US';
  private fallbackLocale = 'en-US';
  
  private locales: LocaleConfig[] = [
    {
      code: 'en-US',
      name: 'English (US)',
      currency: 'USD',
      dateFormat: 'MM/dd/yyyy',
      numberFormat: 'en-US',
      rtl: false
    },
    {
      code: 'en-GB',
      name: 'English (UK)',
      currency: 'GBP',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: 'en-GB',
      rtl: false
    },
    {
      code: 'de-DE',
      name: 'Deutsch',
      currency: 'EUR',
      dateFormat: 'dd.MM.yyyy',
      numberFormat: 'de-DE',
      rtl: false
    },
    {
      code: 'fr-FR',
      name: 'Français',
      currency: 'EUR',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: 'fr-FR',
      rtl: false
    },
    {
      code: 'ja-JP',
      name: '日本語',
      currency: 'JPY',
      dateFormat: 'yyyy/MM/dd',
      numberFormat: 'ja-JP',
      rtl: false
    },
    {
      code: 'zh-CN',
      name: '中文',
      currency: 'CNY',
      dateFormat: 'yyyy/MM/dd',
      numberFormat: 'zh-CN',
      rtl: false
    }
  ];

  private translations: Translations = {
    'dashboard': {
      'en-US': 'Dashboard',
      'en-GB': 'Dashboard',
      'de-DE': 'Dashboard',
      'fr-FR': 'Tableau de bord',
      'ja-JP': 'ダッシュボード',
      'zh-CN': '仪表板'
    },
    'analysis': {
      'en-US': 'Analysis',
      'en-GB': 'Analysis',
      'de-DE': 'Analyse',
      'fr-FR': 'Analyse',
      'ja-JP': '分析',
      'zh-CN': '分析'
    },
    'trading': {
      'en-US': 'Trading',
      'en-GB': 'Trading',
      'de-DE': 'Handel',
      'fr-FR': 'Trading',
      'ja-JP': '取引',
      'zh-CN': '交易'
    },
    'strategy_builder': {
      'en-US': 'Strategy Builder',
      'en-GB': 'Strategy Builder',
      'de-DE': 'Strategie-Builder',
      'fr-FR': 'Créateur de stratégie',
      'ja-JP': 'ストラテジービルダー',
      'zh-CN': '策略构建器'
    },
    'marketplace': {
      'en-US': 'Marketplace',
      'en-GB': 'Marketplace',
      'de-DE': 'Marktplatz',
      'fr-FR': 'Place de marché',
      'ja-JP': 'マーケットプレイス',
      'zh-CN': '市场'
    },
    'buy': {
      'en-US': 'Buy',
      'en-GB': 'Buy',
      'de-DE': 'Kaufen',
      'fr-FR': 'Acheter',
      'ja-JP': '購入',
      'zh-CN': '购买'
    },
    'sell': {
      'en-US': 'Sell',
      'en-GB': 'Sell',
      'de-DE': 'Verkaufen',
      'fr-FR': 'Vendre',
      'ja-JP': '売却',
      'zh-CN': '出售'
    },
    'price': {
      'en-US': 'Price',
      'en-GB': 'Price',
      'de-DE': 'Preis',
      'fr-FR': 'Prix',
      'ja-JP': '価格',
      'zh-CN': '价格'
    },
    'volume': {
      'en-US': 'Volume',
      'en-GB': 'Volume',
      'de-DE': 'Volumen',
      'fr-FR': 'Volume',
      'ja-JP': '出来高',
      'zh-CN': '成交量'
    },
    'profit_loss': {
      'en-US': 'Profit/Loss',
      'en-GB': 'Profit/Loss',
      'de-DE': 'Gewinn/Verlust',
      'fr-FR': 'Profit/Perte',
      'ja-JP': '損益',
      'zh-CN': '盈亏'
    }
  };

  setLocale(locale: string): void {
    if (this.locales.find(l => l.code === locale)) {
      this.currentLocale = locale;
      localStorage.setItem('boltztrader_locale', locale);
    }
  }

  getLocale(): string {
    return this.currentLocale;
  }

  getLocales(): LocaleConfig[] {
    return this.locales;
  }

  getCurrentLocaleConfig(): LocaleConfig {
    return this.locales.find(l => l.code === this.currentLocale) || this.locales[0];
  }

  t(key: string, params?: Record<string, string>): string {
    const translation = this.translations[key]?.[this.currentLocale] || 
                       this.translations[key]?.[this.fallbackLocale] || 
                       key;

    if (params) {
      return Object.entries(params).reduce(
        (str, [param, value]) => str.replace(`{{${param}}}`, value),
        translation
      );
    }

    return translation;
  }

  formatCurrency(amount: number, currency?: string): string {
    const config = this.getCurrentLocaleConfig();
    const currencyCode = currency || config.currency;
    
    return new Intl.NumberFormat(config.numberFormat, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    const config = this.getCurrentLocaleConfig();
    return new Intl.NumberFormat(config.numberFormat, options).format(value);
  }

  formatPercent(value: number): string {
    const config = this.getCurrentLocaleConfig();
    return new Intl.NumberFormat(config.numberFormat, {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
  }

  formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const config = this.getCurrentLocaleConfig();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(this.currentLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }).format(dateObj);
  }

  formatTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(this.currentLocale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(dateObj);
  }

  getDirection(): 'ltr' | 'rtl' {
    const config = this.getCurrentLocaleConfig();
    return config.rtl ? 'rtl' : 'ltr';
  }

  loadSavedLocale(): void {
    const saved = localStorage.getItem('boltztrader_locale');
    if (saved && this.locales.find(l => l.code === saved)) {
      this.currentLocale = saved;
    }
  }
}

export const localizationService = new LocalizationService();
export type { LocaleConfig };