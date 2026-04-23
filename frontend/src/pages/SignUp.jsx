import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const AUTH_LOGO_URL =
  'https://res.cloudinary.com/dzd47mpdo/image/upload/v1776086342/Untitled_design_9_fc6qsg.png';

const getGoogleAuthUrl = () => {
  const rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/$/, '');
  const apiBase = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;
  return `${apiBase}/auth/google`;
};

const SignUp = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleGoogleSignUp = () => {
    setError('');
    setSuccess('');
    window.location.assign(getGoogleAuthUrl());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const name = `${formData.firstName} ${formData.lastName}`.trim();
      const resp = await api.signup({ name, email: formData.email, password: formData.password });
      setSuccess('Account created successfully');
      // Do NOT auto-login after signup; redirect to Sign In
      navigate('/signin', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
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
        <div className="flex w-full items-start justify-center px-4 py-6 sm:py-8 lg:w-1/2 lg:items-center lg:py-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif font-semibold text-[var(--brand-text)] mb-2">
                Create Account
              </h2>
            </div>

            {/* Sign Up Form */}
            <div className="bg-white rounded-2xl shadow-[0_14px_40px_rgba(56,19,19,0.12)] p-6 border border-[var(--brand-border)]">
              <button
                type="button"
                onClick={handleGoogleSignUp}
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

              {error && (<div className="mb-3 text-sm text-red-600">{error}</div>)}
              {success && (<div className="mb-3 text-sm text-green-600">{success}</div>)}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all text-sm"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all text-sm"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all text-sm"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all text-sm"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all text-sm"
                      placeholder="Create password"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--brand-text)] mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-maroon)]/20 focus:border-[var(--brand-maroon)] transition-all text-sm"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                    className="h-4 w-4 text-[var(--brand-maroon)] focus:ring-[var(--brand-maroon)]/30 border-[var(--brand-border)] rounded mt-0.5"
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-xs text-[var(--brand-muted)]">
                    I agree to the{' '}
                    <Link to="/terms" className="text-[var(--brand-maroon)] hover:text-[var(--brand-maroon-2)] transition-colors">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-[var(--brand-maroon)] hover:text-[var(--brand-maroon-2)] transition-colors">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[var(--brand-maroon)] to-[var(--brand-maroon-2)] text-white py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-sm disabled:opacity-60"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-[var(--brand-muted)] text-sm">
                  Already have an account?{' '}
                  <Link
                    to="/signin"
                    className="text-[var(--brand-maroon)] hover:text-[var(--brand-maroon-2)] font-semibold transition-colors"
                  >
                    Sign in here
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

export default SignUp;
