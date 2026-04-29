import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Input, Button } from '../components/UI';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(formData.email, formData.password);
      const destination = response.user?.role === 'admin'
        ? '/admin'
        : response.user?.role === 'accountant'
        ? '/accountant'
        : '/dashboard';
      navigate(destination);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft-lg p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary-500 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your TaxFlow Pro account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">{error}</div>}
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                icon={Mail}
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                required
              />

              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-accent-500 hover:text-accent-600 font-semibold">
                  Forgot password?
                </a>
              </div>

              <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                {loading ? 'Signing in...' : (
                  <>
                    Sign In
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent-500 font-semibold hover:text-accent-600">
                Sign up here
              </Link>
            </p>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 mt-8 text-center">
            <div>
              <p className="text-lg font-bold text-primary-500">10K+</p>
              <p className="text-xs text-gray-600">Active Users</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary-500">99.9%</p>
              <p className="text-xs text-gray-600">Uptime</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary-500">ISO</p>
              <p className="text-xs text-gray-600">Certified</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
