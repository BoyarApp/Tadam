import path from 'path';

const resolveString = (value: string | undefined, fallback: string) => {
  if (!value) {
    return fallback;
  }
  const normalised = value.trim().toLowerCase();
  if (value.includes('${') || normalised === '' || normalised === 'base' || normalised === 'undefined') {
    return fallback;
  }
  return value;
};

const resolveInt = (value: string | number | undefined, fallback: number) => {
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
  const rawClient = env('DATABASE_CLIENT', 'sqlite');
  let client = resolveString(rawClient, 'sqlite') as 'sqlite' | 'postgres' | 'mysql';
  const rawHost = resolveString(env('DATABASE_HOST'), 'localhost');
  const rawUrl = env('DATABASE_URL');
  const connectionString =
    rawUrl && !rawUrl.includes('${') && rawUrl.trim() !== '' ? rawUrl : undefined;

  if (
    client === 'postgres' &&
    !connectionString &&
    (!process.env.DATABASE_HOST || process.env.DATABASE_HOST.trim() === '') &&
    (!process.env.DATABASE_USERNAME || process.env.DATABASE_USERNAME.trim() === '')
  ) {
    client = 'sqlite';
  }

  const connections = {
    mysql: {
      connection: {
        host: resolveString(env('DATABASE_HOST'), 'localhost'),
        port: resolveInt(env('DATABASE_PORT'), 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: {
        connectionString,
        host: rawHost,
        port: resolveInt(env('DATABASE_PORT'), 5432),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...(connections[client] ?? connections.sqlite),
      acquireConnectionTimeout: resolveInt(env('DATABASE_CONNECTION_TIMEOUT'), 60000),
    },
  };
};
