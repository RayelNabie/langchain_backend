import { getSecret } from '#Utils/secrets.js';

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
