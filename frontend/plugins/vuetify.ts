import { createVuetify, ThemeDefinition } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const lightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#F8FAFC',
    'on-background': '#0F172A',
    surface: '#FFFFFF',
    'on-surface': '#0F172A',
    primary: '#C52233',
    'primary-darken-1': '#8f1a26',
    secondary: '#1B75BC',
    accent: '#FDE68A',
  },
};

const darkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#0F172A',
    'on-background': '#E2E8F0',
    surface: '#111827',
    'on-surface': '#E2E8F0',
    primary: '#F43F5E',
    'primary-darken-1': '#BE123C',
    secondary: '#38BDF8',
    accent: '#FBBF24',
  },
};

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      defaultTheme: 'lightTheme',
      themes: {
        lightTheme,
        darkTheme,
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
