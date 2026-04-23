const clean = (value) => String(value || '').trim().replace(/\/$/, '');

export const getBackendBaseUrl = () => {
  const explicit = clean(process.env.BACKEND_URL);
  if (explicit) return explicit;
  const port = process.env.PORT || '5000';
  return `http://localhost:${port}`;
};

export const getGoogleCallbackUrl = () => {
  const explicit = clean(process.env.GOOGLE_CALLBACK_URL);
  if (explicit) return explicit;
  return `${getBackendBaseUrl()}/api/auth/google/callback`;
};

export const getFrontendBaseUrl = () => {
  const explicit = clean(process.env.FRONTEND_URL) || clean(process.env.REDIRECT_URI);
  if (explicit) return explicit;
  return 'http://localhost:5174';
};

export const GOOGLE_OAUTH_SCOPE = 'profile email';
