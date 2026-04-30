import fs from 'node:fs';
import path from 'node:path';

export interface SecretResult {
  value: string;
  source: string;
}

/**
 * Get secret from docker secrets, local secrets, or environment vars
 */
export const getSecret = (secretName: string, fallback: string): SecretResult => {
  const dockerSecretPath: string = path.join('/run/secrets', secretName);
  const localSecretPath: string = path.join(process.cwd(), 'secrets', `${secretName}.txt`);

  /**
   * 1. Try Docker secrets
   */
  try {
    if (fs.existsSync(dockerSecretPath)) {
      return { value: fs.readFileSync(dockerSecretPath, 'utf8').trim(), source: 'docker-secret' };
    }
  } catch {
    // Silence error
  }

  /**
   * 2. Try local secret files
   */
  try {
    if (fs.existsSync(localSecretPath)) {
      return { value: fs.readFileSync(localSecretPath, 'utf8').trim(), source: 'local-file' };
    }
  } catch {
    // Silence error
  }

  /**
   * 3. Fallback to environment vars
   */
  const envVarName: string = secretName.toUpperCase();
  if (process.env[envVarName]) {
    return { value: process.env[envVarName] as string, source: 'env-var' };
  }

  return { value: fallback, source: 'default' };
};
