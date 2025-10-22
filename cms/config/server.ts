const resolveHost = (value: string | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }
  const normalised = value.trim().toLowerCase();
  if (value.includes('${') || normalised === '' || normalised === 'base' || normalised === 'undefined') {
    return fallback;
  }
  return value;
};

const resolvePort = (value: string | number | undefined, fallback: number) => {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

export default ({ env }) => {
  const rawHost = env('HOST') ?? env('STRAPI_HOST');
  const rawPort = env('PORT') ?? env('STRAPI_PORT');

  const host = resolveHost(rawHost, '0.0.0.0');
  const port = resolvePort(rawPort, 1337);

  return {
    host,
    port,
    app: {
      keys: env.array('APP_KEYS'),
    },
  };
};
