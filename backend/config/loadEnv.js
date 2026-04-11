/**
 * Load backend/.env before any other app modules read process.env.
 * Uses override: true only when the file exists so local .env wins over
 * stale OS/user environment variables (e.g. old RAZORPAY_KEY_SECRET).
 * On hosts like Render with no .env file, dashboard env vars are untouched.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { configDotenv } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env');

if (fs.existsSync(envPath)) {
  const result = configDotenv({ path: envPath, override: true });
  if (result.error) {
    console.warn('[env] Could not load .env:', result.error.message);
  } else if (result.parsed) {
    console.log('[env] Loaded', envPath, `(${Object.keys(result.parsed).length} keys, override existing env)`);
  }
}
