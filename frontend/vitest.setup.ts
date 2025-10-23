import { config } from '@vue/test-utils';
import { vi } from 'vitest';

config.global.mocks = {
  $t: (msg: string) => msg,
};

vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    apiBase: 'http://localhost:1337',
  },
}));
