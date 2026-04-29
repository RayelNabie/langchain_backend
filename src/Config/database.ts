import fs from 'node:fs';
import path from 'node:path';

const getSecret: (
  secretName: string,
  fallback: string,
) => {
  value: string;
  source: string;
} = (secretName: string, fallback: string): { value: string; source: string } => {
  const dockerSecretPath: string = path.join('/run/secrets', secretName);
  const localSecretPath: string = path.join(process.cwd(), 'secrets', `${secretName}.txt`);

  /**
   * Try docker secrets
   **/
  try {
    if (fs.existsSync(dockerSecretPath)) {
      return { value: fs.readFileSync(dockerSecretPath, 'utf8').trim(), source: 'docker-secret' };
    }
  } catch {
    // Silence error
  }

  /**
   * Try the local secret file
   **/
  try {
    if (fs.existsSync(localSecretPath)) {
      return { value: fs.readFileSync(localSecretPath, 'utf8').trim(), source: 'local-file' };
    }
  } catch {
    // Silence error
  }

  /**
   * Fallback to env variable
   * **/
  const envVarName: string = secretName.toUpperCase();
  if (process.env[envVarName]) {
    return { value: process.env[envVarName] as string, source: 'env-var' };
  }

  return { value: fallback, source: 'default' };
};

export const databaseConfig = {
  get details(): { url: string; source: string } {
    if (process.env.DATABASE_URL) {
      return { url: process.env.DATABASE_URL, source: 'env-DATABASE_URL' };
    }

    const userSecret: { value: string; source: string } = getSecret('pg_user', 'postgres');
    const passSecret: { value: string; source: string } = getSecret('pg_pw', 'postgres');

    const host: string = process.env.DB_HOST || 'postgres';
    const port: string = process.env.DB_PORT || '5432';
    const dbName: string = process.env.DB_NAME || 'postgres';

    return {
      url: `postgresql://${userSecret.value}:${passSecret.value}@${host}:${port}/${dbName}?schema=public`,
      source: `user:${userSecret.source}, pass:${passSecret.source}`,
    };
  },

  get url(): string {
    return this.details.url;
  },

  /**
   * Safe version of the URL for logging (masks password)
   */
  get safeUrl(): string {
    const { url: rawUrl } = this.details;
    try {
      const url = new URL(rawUrl);
      return `${url.protocol}//${url.username}:****@${url.host}${url.pathname}${url.search}`;
    } catch {
      // If not a valid URL, just return masked version manually
      return rawUrl.replace(/:([^@]+)@/, ':****@');
    }
  },
};
