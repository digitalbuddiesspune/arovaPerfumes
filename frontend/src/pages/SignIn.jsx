import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { FiPhone } from 'react-icons/fi';

const AUTH_LOGO_URL =
  'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776086342/Untitled_design_9_fc6qsg.png';

const getGoogleAuthUrl = () => {
  const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');
  const apiBase = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;
  return `${apiBase}/auth/google`;
};

const SignIn = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'otp'
  
  // Email/Password form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // OTP form data
  const [otpData, setOtpData] = useState({
    mobile: '',
    otp: '',
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (e) => {
    setOtpData({ ...otpData, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const postAuthRedirect = () => {
    const from = location.state?.from;
    if (from?.pathname) {
      return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
    }
    return '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const resp = await api.signin({ email: formData.email, password: formData.password });
      // store token then redirect to intended page or home
      if (resp?.token) localStorage.setItem('auth_token', resp.token);
      try { window.dispatchEvent(new Event('auth:updated')); } catch {}
      if (resp?.user?.isAdmin) {
        localStorage.setItem('auth_is_admin', 'true');
      } else {
        try { localStorage.removeItem('auth_is_admin'); } catch {}
      }
      navigate(postAuthRedirect(), { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validate mobile number
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(otpData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSendingOTP(true);
    try {
      const resp = await api.sendOTP({ mobile: otpData.mobile });
      setSuccess(resp.message || 'OTP sent successfully');
      setOtpSent(true);
      
      // Start countdown timer (10 minutes = 600 seconds)
      setOtpTimer(600);
      const timerInterval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const resp = await api.verifyOTP({
        mobile: otpData.mobile,
        otp: otpData.otp,
      });
      
      // Store token and redirect
      if (resp?.token) localStorage.setItem('auth_token', resp.token);
      try { window.dispatchEvent(new Event('auth:updated')); } catch {}
      if (resp?.user?.isAdmin) {
        localStorage.setItem('auth_is_admin', 'true');
      } else {
        try { localStorage.removeItem('auth_is_admin'); } catch {}
      }
      navigate(postAuthRedirect(), { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoogleSignIn = () => {
    setError('');
    setSuccess('');
    window.location.assign(getGoogleAuthUrl());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--brand-cream)] via-[#f6eeea] to-[#efe2dd]">
      <div className="flex min-h-screen">
        {/* Left Side - Logo */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--brand-cream)] via-[#efe1dc] to-[#e4cfca] items-center justify-center">
          <div className="text-center">
            <Link to="/" className="inline-block mb-8">
              <img
                src={AUTH_LOGO_URL}
                alt="Arova"
                className="h-20 w-auto object-contain"
                loading="eager"
              />
            </Link>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex w-full items-start justify-center px-4 py-6 sm:py-8 lg:w-1/2 lg:items-center">
          <div className="w-full max-w-sm sm:max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6">
              <Link to="/" className="inline-block mb-6">
                <img
                  src={AUTH_LOGO_URL}
                  alt="Arova"
                  className="h-12 w-auto object-contain"
                  loading="eager"
                />
              </Link>
            </div>

            {/* Form Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-serif font-semibold text-[var(--brand-text)] mb-1">
                Welcome
              </h2>
              <p className="text-[var(--brand-muted)]">
                Sign in to your account to continue shopping
              </p>
            </div>

            {/* Sign In Form */}
            <div className="bg-white rounded-2xl shadow-[0_14px_40px_rgba(56,19,19,0.12)] p-6 border border-[var(--brand-border)]">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mb-4 flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--brand-border)] bg-white px-4 py-2.5 font-medium text-[var(--brand-text)] transition-colors hover:bg-[var(--brand-cream)]"
              >
                <span
                  aria-hidden
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#dadce0] bg-white text-xs font-semibold text-[#4285f4]"
                >
                  G
                </span>
                Continue with Google
              </button>

              <div className="mb-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-[var(--brand-border)]" />
                <span className="text-xs uppercase tracking-[0.18em] text-[var(--brand-muted)]">or</span>
                <span className="h-px flex-1 bg-[var(--brand-border)]" />
              </div>

              {/* Login Method Toggle */}
              <div className="mb-6 flex gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-cream)] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setError('');
                    setSuccess('');
                    setOtpSent(false);
                    setOtpTimer(0);
                  }}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                    loginMethod === 'email'
                      ? 'bg-white text-[var(--brand-maroon)] shadow-sm'
                      : 'text-[var(--brand-muted)] hover:text-[var(--brand-text)]'
                  }`}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setError('');
                    setSuccess('');
                    setOtpSent(false);
                    setOtpTimer(0);
                  }}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                    loginMethod === 'otp'
                      ? 'bg-white text-[var(--brand-maroon)] shadow-sm'
                      : 'text-[var(--brand-muted)] hover:text-[var(--brand-text)]'
                  }`}
                >
                  Login with OTP
                </button>
              </div>

              {error && (<div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>)}
              {success && (<div className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</div>)}

              {/* Email/Password Login Form */}
              {loginMethod === 'email' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[var(--brand-maroon)] focus:ring-[var(--brand-maroon)]/30 border-[var(--brand-border)] rounded"
                    />
                    <span className="ml-2 text-sm text-[var(--brand-muted)]">Remember me</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[var(--brand-maroon)] to-[var(--brand-maroon-2)] text-white py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              )}

              {/* OTP Login Form */}
              {loginMethod === 'otp' && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-[var(--brand-text)] mb-2 flex items-center gap-2">
                          <FiPhone className="w-4 h-4" />
                          Mobile Number
                        </label>
                        <input
                          type="tel"
                          id="mobile"
                          name="mobile"
                          value={otpData.mobile}
                          onChange={handleOtpChange}
                          required
                          maxLength="10"
                          className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all"
                          placeholder="Enter 10-digit mobile number"
                        />
                        <p className="mt-1 text-xs text-[var(--brand-muted)]">We'll send you a 6-digit OTP</p>
                      </div>

                      <button
                        type="submit"
                        disabled={sendingOTP}
                        className="w-full bg-gradient-to-r from-[var(--brand-maroon)] to-[var(--brand-maroon-2)] text-white py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                      >
                        {sendingOTP ? 'Sending OTP...' : 'Send OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <div>
                        <label htmlFor="mobile-display" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                          Mobile Number
                        </label>
                        <div className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg bg-[var(--brand-cream)] text-[var(--brand-muted)]">
                          +91 {otpData.mobile}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpData({ ...otpData, otp: '' });
                            setError('');
                            setSuccess('');
                          }}
                          className="mt-1 text-xs text-[var(--brand-maroon)] hover:text-[var(--brand-maroon-2)]"
                        >
                          Change number
                        </button>
                      </div>

                      <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-[var(--brand-text)] mb-2">
                          Enter OTP
                        </label>
                        <input
                          type="text"
                          id="otp"
                          name="otp"
                          value={otpData.otp}
                          onChange={handleOtpChange}
                          required
                          maxLength="6"
                          className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all text-center text-2xl tracking-widest"
                          placeholder="000000"
                        />
                        {otpTimer > 0 && (
                          <p className="mt-2 text-xs text-[var(--brand-muted)] text-center">
                            OTP expires in: <span className="font-semibold text-[var(--brand-maroon)]">{formatTimer(otpTimer)}</span>
                          </p>
                        )}
                        {otpTimer === 0 && otpSent && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            className="mt-2 text-xs text-[var(--brand-maroon)] hover:text-[var(--brand-maroon-2)] font-medium"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[var(--brand-maroon)] to-[var(--brand-maroon-2)] text-white py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
                      >
                        {loading ? 'Verifying...' : 'Verify & Login'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-[var(--brand-muted)]">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="text-[var(--brand-maroon)] hover:text-[var(--brand-maroon-2)] font-semibold transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;