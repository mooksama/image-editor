import { storage } from '@utils/storage';
import { themeDark } from './theme-dark';
import { themeLight } from './theme-light';

export type ThemeType = 'light' | 'dark';

export enum ThemeName {
  DARK = 'dark',
  LIGHT = 'light',
}

class Theme {
  theme: ThemeType = 'dark';
  constructor() {
    this.theme = storage.local.get('theme') || 'dark';
    this.setTheme(this.theme);
    // storage.local.set('theme', this.theme);
  }
  /**
   * 테마 전환
   */
  setTheme = (themeName: ThemeType): void => {
    this.theme = themeName;
    storage.local.set('theme', themeName);
    document.body.setAttribute('theme-mode', themeName);
    switch (themeName) {
      case ThemeName.DARK:
        for (const key in themeDark) {
          document.body.style.setProperty(key, themeDark[key]);
        }
        break;
      case ThemeName.LIGHT:
        for (const key in themeLight) {
          document.body.style.setProperty(key, themeLight[key]);
        }
        break;
    }
  };

  getTheme = (): ThemeType => {
    return this.theme || storage.local.get('theme') || 'dark';
  };

  // 전달된 다크 모드 색상 값을 기반으로 다른 환경에서 해당 색상 값을 자동으로 전환
  findColor = (val: string): string => {
    if (this.theme === 'dark') {
      return val;
    }
    for (const key in themeDark) {
      if (themeDark[key] === val) {
        return themeLight[key];
      }
    }
    return '';
  };
}

export const theme = new Theme();
