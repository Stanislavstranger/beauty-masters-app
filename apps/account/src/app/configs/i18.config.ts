import { I18nJsonLoader } from 'nestjs-i18n';
import * as path from 'path';

export const getI18Config = () => ({
  fallbackLanguage: 'en',  
      fallbacks: {
        'en-*': 'en',
        'ru-*': 'ru', 
        'tr-*': 'tr',
      },
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
      },
      loader: I18nJsonLoader,
});
