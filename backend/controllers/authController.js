import axios from 'axios';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { GOOGLE_OAUTH_SCOPE, getFrontendBaseUrl, getGoogleCallbackUrl } from '../config/google.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

const clean = (value) => String(value || '').trim();

const jwtSecret = () => clean(process.env.JWT_SECRET) || 'dev_secret_change_me';

const signJwt = (user) =>
  jwt.sign({ id: String(user._id), email: user.email || null, isAdmin: !!user.isAdmin }, jwtSecret(), {
    expiresIn: '7d',
  });

const getGoogleAuthConfig = () => {
  const clientId = clean(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = clean(process.env.GOOGLE_CLIENT_SECRET);
  const redirectUri = getGoogleCallbackUrl();
  return { clientId, clientSecret, redirectUri };
};

export const redirectToGoogle = async (_req, res) => {
  const { clientId, redirectUri } = getGoogleAuthConfig();
  if (!clientId) return res.status(500).json({ message: 'Missing GOOGLE_CLIENT_ID' });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });

  return res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};

export const googleCallback = async (req, res) => {
  try {
    const code = clean(req.query.code);
    if (!code) return res.status(400).json({ message: 'Missing authorization code' });

    const { clientId, clientSecret, redirectUri } = getGoogleAuthConfig();
    if (!clientId || !clientSecret) {
      return res.status(500).json({ message: 'Google OAuth env is incomplete' });
    }

    const tokenParams = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await axios.post(GOOGLE_TOKEN_URL, tokenParams, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    });

    const accessToken = tokenResponse?.data?.access_token;
    if (!accessToken) {
      return res.status(401).json({ message: 'Google token exchange failed' });
    }

    const profileResponse = await axios.get(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 15000,
    });

    const { name, email, picture } = profileResponse.data || {};
    if (!email) return res.status(400).json({ message: 'Google account email is unavailable' });

    let user = await User.findOne({ email: String(email).toLowerCase() });
    if (user) {
      const updates = {};
      if (!user.name && name) updates.name = name;
      if (!user.avatar && picture) updates.avatar = picture;
      if (user.provider !== 'google') updates.provider = 'google';
      if (Object.keys(updates).length) {
        user.set(updates);
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || email.split('@')[0] || 'Google User',
        email: String(email).toLowerCase(),
        avatar: picture || '',
        provider: 'google',
      });
    }

    const token = signJwt(user);
    const frontendBaseUrl = getFrontendBaseUrl();
    const isProd = frontendBaseUrl.startsWith('https://');

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const redirectUrl = `${frontendBaseUrl}/dashboard?token=${encodeURIComponent(token)}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    const frontendBaseUrl = getFrontendBaseUrl();
    const message = clean(error?.response?.data?.error_description || error?.message) || 'google_oauth_failed';
    return res.redirect(`${frontendBaseUrl}/signin?error=${encodeURIComponent(message)}`);
  }
};
