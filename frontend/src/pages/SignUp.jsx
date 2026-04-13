import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const SignUp = () => {
  const rawApiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');
  const apiBase = rawApiBase.endsWith('/api') ? rawApiBase.slice(0, -4) : rawApiBase;
  const googleAuthUrl = `${apiBase}/api/auth/google`;

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
      <div className="flex h-screen">
        {/* Left Side - Logo */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[var(--brand-cream)] via-[#efe1dc] to-[#e4cfca] items-center justify-center">
          <div className="text-center">
            <Link to="/" className="inline-block mb-8">
              <h1 className="text-6xl font-serif font-bold text-[var(--brand-maroon)]">
                ArovaPerfume
              </h1>
            </Link>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <h1 className="text-3xl font-serif font-bold text-[var(--brand-maroon)]">
                  ArovaPerfume
                </h1>
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
              {error && (<div className="mb-3 text-sm text-red-600">{error}</div>)}
              {success && (<div className="mb-3 text-sm text-green-600">{success}</div>)}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
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

                <div className="grid grid-cols-2 gap-3">
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

              <div className="mt-4 hidden md:block">
                <a
                  href={googleAuthUrl}
                  className="w-full inline-flex items-center justify-center gap-2 border border-[var(--brand-border)] bg-white text-[var(--brand-text)] py-2 rounded-lg font-semibold hover:bg-[var(--brand-cream)] transition-colors text-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.5-5.5 3.5-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 2.9 14.7 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.9-.1-1.3H12z" />
                  </svg>
                  Continue with Google
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
