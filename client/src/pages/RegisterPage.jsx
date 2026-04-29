import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Input, Button } from '../components/UI';
import { User, Mail, Phone, Building2, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    const fullNameParts = formData.fullName.trim().split(' ');
    const firstName = fullNameParts[0] || '';
    const lastName = fullNameParts.slice(1).join(' ') || 'User';
    const normalizedPhone = formData.phone.replace(/\D/g, '');

    try {
      await register({
        firstName,
        lastName,
        email: formData.email,
        phone: normalizedPhone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-soft-lg p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary-500 mb-2">Create Account</h1>
              <p className="text-gray-600">Step {step} of 2 - Join India's trusted tax platform</p>
            </div>

            {/* Progress Steps */}
            <div className="flex gap-4 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step ? 'bg-accent-500' : 'bg-gray-200'
                }`} />
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3">{error}</div>}
              {step === 1 ? (
                <>
                  <Input
                    label="Full Name"
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Business Name"
                    type="text"
                    name="businessName"
                    placeholder="Your Company Ltd"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                  />

                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">
                      Business Type
                    </label>
                    <select 
                      name="businessType"
                      value={formData.businessType}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select business type</option>
                      <option value="sole_proprietor">Sole Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="pvt_ltd">Private Limited Company</option>
                      <option value="llp">LLP</option>
                      <option value="ngo">NGO</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />

                  <label className="flex items-start gap-3">
                    <input type="checkbox" className="w-4 h-4 mt-1 rounded border-gray-300" required />
                    <span className="text-sm text-gray-600">
                      I agree to the <a href="#" className="text-accent-500 font-semibold">Terms of Service</a> and{' '}
                      <a href="#" className="text-accent-500 font-semibold">Privacy Policy</a>
                    </span>
                  </label>
                </>
              )}

              <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                {step === 1 ? (
                  <>
                    Continue
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </Button>
            </form>

            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="w-full mt-3 btn-outline"
              >
                Skip for now
              </button>
            )}

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-500 font-semibold hover:text-accent-600">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              'Instant GST registration',
              'Free compliance setup',
              '24/7 expert support',
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check size={18} className="text-success flex-shrink-0" />
                <span className="text-gray-600">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
