import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Card, Badge, Input } from '../components/UI';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { settingsAPI } from '../services/api';
import { 
  ArrowRight, Check, Star, ChevronDown, ChevronUp, Shield, Lock, 
  Calendar, Users, TrendingUp, CheckCircle, Clock, FileText, Zap, Mail, Phone 
} from 'lucide-react';

const HomePage = () => {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [animateStats, setAnimateStats] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [dashboardHighlights, setDashboardHighlights] = useState([
    { label: 'Next Filing', value: 'GSTR-1', detail: '5 Days' },
    { label: 'Monthly Target', value: '₹45,000', detail: '75% Complete' },
    { label: 'Compliance Alerts', value: '3', detail: 'Critical items' },
  ]);
  const [dashboardDeadlines, setDashboardDeadlines] = useState([
    { title: 'GSTR-1 Due', date: '2026-05-10' },
    { title: 'ITR Filing Due', date: '2026-07-31' },
    { title: 'TDS Due', date: '2026-05-15' },
  ]);
  const [heroMeta, setHeroMeta] = useState({
    lastFiling: 'April 30, 2026',
    upcomingDeadline: {
      title: 'GSTR-1 Due',
      date: '2026-05-10',
    },
  });
  const location = useLocation();

  const loadDashboardSettings = async () => {
    try {
      const response = await settingsAPI.getDashboardSettings();
      const data = response.data || {};
      setDashboardHighlights(data.heroHighlights || dashboardHighlights);
      setDashboardDeadlines(data.deadlines || dashboardDeadlines);
      setHeroMeta((prev) => ({
        lastFiling: data.heroMeta?.lastFiling || prev.lastFiling,
        upcomingDeadline: {
          title: data.heroMeta?.upcomingDeadline?.title || prev.upcomingDeadline.title,
          date: data.heroMeta?.upcomingDeadline?.date || prev.upcomingDeadline.date,
        },
      }));
    } catch (error) {
      console.error('Failed to load dashboard settings:', error);
    }
  };

  useEffect(() => {
    setAnimateStats(true);
    loadDashboardSettings();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle hash scrolling
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  const services = [
    { title: 'GST Registration', category: 'Tax & Compliance', icon: CheckCircle },
    { title: 'GST Filing', category: 'Tax & Compliance', icon: FileText },
    { title: 'Income Tax Filing', category: 'Tax & Compliance', icon: Calendar },
    { title: 'TDS/TCS Filing', category: 'Tax & Compliance', icon: Zap },
    { title: 'Accounting & Bookkeeping', category: 'Tax & Compliance', icon: TrendingUp },
    { title: 'Tax Audit', category: 'Tax & Compliance', icon: Shield },
  ];

  const trustStats = [
    { value: '10,000+', label: 'Active Clients', icon: Users },
    { value: '25,000+', label: 'GST Filings', icon: CheckCircle },
    { value: '98%', label: 'Client Retention', icon: TrendingUp },
    { value: '24×7', label: 'CA Support', icon: Clock },
  ];

  const certifications = [
    { title: 'Startup India', desc: 'Recognized startup' },
    { title: 'ISO Certified', desc: 'Quality standards' },
    { title: 'GSTN Compliant', desc: 'Government approved' },
    { title: 'Cloud Secure', desc: '256-bit encryption' },
    { title: 'CA Approved', desc: 'Accountant verified' },
    { title: 'RBI Trusted', desc: 'Bank-level security' },
  ];

  const pricingPlans = [
    {
      name: 'Starter',
      price: '₹999',
      period: '/month',
      desc: 'Perfect for freelancers',
      features: ['1 GST account', 'Quarterly filing', 'Email support', 'Basic templates'],
      cta: 'Start Free Trial',
    },
    {
      name: 'Professional',
      price: '₹2,999',
      period: '/month',
      desc: 'For growing businesses',
      features: ['5 GST accounts', 'All filings', 'Priority support', 'Advanced analytics', 'Document storage'],
      cta: 'Get Started',
      featured: true,
    },
    {
      name: 'Enterprise',
      price: '₹4,999',
      period: '/month',
      desc: 'For large enterprises',
      features: ['Unlimited accounts', 'Dedicated CA', '24×7 support', 'API access', 'Custom reports'],
      cta: 'Contact Sales',
    },
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      company: 'TechStart India',
      role: 'Founder',
      rating: 5,
      text: 'TaxFlow Pro saved us 20 hours every month. Their team is incredibly responsive and professional.',
      avatar: '🧑‍💼',
    },
    {
      name: 'Priya Sharma',
      company: 'Fresh Commerce',
      role: 'Operations Head',
      rating: 5,
      text: 'Best platform for GST compliance. Automated filings and saved us thousands in penalties.',
      avatar: '👩‍💼',
    },
    {
      name: 'Amit Patel',
      company: 'Digital Solutions Ltd',
      role: 'CFO',
      rating: 5,
      text: 'Professional, efficient, and trustworthy. We integrated it across 3 entities. Highly recommended!',
      avatar: '👨‍💼',
    },
  ];

  const faqs = [
    {
      q: 'How does TaxFlow Pro ensure data security?',
      a: 'We use 256-bit bank-level encryption, ISO 27001 certification, and secure cloud storage. Your data is protected with military-grade security protocols.',
    },
    {
      q: 'What filings can I handle on this platform?',
      a: 'GST (GSTR-1, GSTR-3B, etc.), ITR, TDS, TCS, and all compliance filings. Our AI automatically calculates and verifies all entries before filing.',
    },
    {
      q: 'Can I switch plans anytime?',
      a: 'Yes, upgrade or downgrade your plan anytime. No lock-in period. Only pay for what you use with our flexible billing system.',
    },
    {
      q: 'Is support available 24/7?',
      a: 'Yes! Our Chartered Accountants are available 24×7 via chat, email, and phone. Average response time is under 2 minutes.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[60] pointer-events-none">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <Header />

      {/* Hero Section */}
      <section id="home" className="relative pt-32 pb-20 px-4 overflow-hidden bg-primary-500">
        {/* Background gradient */}
        <div className="absolute inset-0 opacity-20 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-500 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-accent-50 border border-accent-200 mb-8">
                <Zap size={16} className="text-accent-500" />
                <span className="text-sm font-semibold text-accent-600">Trusted by 10,000+ Businesses</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
                India's Most Trusted
                <span className="block bg-gradient-to-r from-white to-accent-500 bg-clip-text text-transparent">
                  Tax & Compliance
                </span>
                Platform
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Automate your GST, ITR, and compliance filings. Get expert support from Chartered Accountants. File on time, every time.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/login" 
                  className="px-8 py-4 text-lg font-semibold text-primary-500 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl hover:shadow-soft-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                >
                  Book Consultation
                </Link>
              </div>

              {/* Quick Service Links */}
              <div className="flex flex-wrap gap-3">
                {['GST Filing', 'ITR Filing', 'TDS Filing', 'CA Support'].map((link, idx) => (
                  <Link
                    key={idx}
                    to="/#services"
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 text-sm font-semibold hover:shadow-soft-lg"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right - Premium Dashboard Preview */}
            <div className="relative animate-slide-up hidden lg:block">
              {/* Main Card */}
              <div className="relative bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 text-white shadow-soft-xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 pb-8 border-b border-white/20">
                  <div>
                    <p className="text-sm text-white/70 mb-1">Filing Status</p>
                    <h3 className="text-2xl font-bold">92% Complete</h3>
                  </div>
                  <Badge variant="success" className="bg-green-400/20 text-green-300">On Track</Badge>
                </div>

                {/* Metrics */}
                <div className="space-y-4 mb-8">
                  {dashboardHighlights.map((highlight, idx) => (
                    <div key={idx} className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">{highlight.label}</span>
                        <span className="text-xs font-bold">{highlight.detail}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-2xl font-semibold text-white">{highlight.value}</p>
                        <div className="w-1/2 bg-white/20 rounded-full h-2">
                          <div className="bg-accent-500 h-2 rounded-full" style={{ width: `${Math.min(100, parseInt(highlight.value.toString().replace(/[^0-9]/g, '')) || 65)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to="/login"
                  className="w-full inline-flex items-center justify-center bg-accent-500 hover:bg-accent-600 text-primary-500 font-bold py-3 rounded-xl transition-all duration-300 hover:shadow-lg"
                >
                  Upload Documents Now
                </Link>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 bg-white rounded-xl p-4 shadow-soft-xl max-w-xs animate-float" style={{ animationDelay: '0s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Last Filing</p>
                    <p className="font-bold text-sm">{heroMeta.lastFiling}</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-6 bg-white rounded-xl p-4 shadow-soft-xl max-w-xs animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Upcoming Deadline</p>
                    <p className="font-bold text-sm">{heroMeta.upcomingDeadline.title}</p>
                    <p className="text-xs text-gray-500">{heroMeta.upcomingDeadline.date}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Trust Stats Section */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustStats.map((stat, idx) => (
              <div 
                key={idx} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-100 mb-4">
                  <stat.icon size={24} className="text-accent-600" />
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-primary-500 mb-2">
                  {stat.value}
                </h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Trust */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Enterprise-Grade Trust</h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Trusted by thousands of businesses. Certified and secure. Built for compliance.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
            {certifications.map((cert, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl p-6 border border-gray-200 text-center hover:border-accent-500 hover:shadow-soft-lg transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} className="text-accent-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{cert.title}</h3>
                <p className="text-sm text-gray-600">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Complete Compliance Solutions</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            All the tax and compliance services your business needs in one platform.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, idx) => (
              <div 
                key={idx}
                className="group bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-accent-500 hover:-translate-y-3 hover:shadow-soft-xl hover:shadow-accent-500/10 transition-all duration-500 animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-accent-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-accent-500 transition-all duration-300">
                  <service.icon size={24} className="text-accent-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.category}</p>
                <button className="text-accent-500 font-bold text-sm inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                  Learn More <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="about" className="py-16 px-4 bg-gradient-to-br from-primary-500 to-secondary-500 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Why Choose TaxFlow Pro?</h2>
          <p className="text-xl text-white/80 text-center mb-12 max-w-2xl mx-auto">
            We're not just a software platform. We're your trusted compliance partner.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: 'AI-Powered Accuracy', desc: 'Auto-calculated filings with 99.9% accuracy' },
              { title: 'Expert CA Support', desc: 'Dedicated Chartered Accountants available 24×7' },
              { title: 'Bank-Level Security', desc: '256-bit encryption & ISO 27001 certified' },
              { title: 'Instant Compliance', desc: 'File on time, never miss deadlines again' },
              { title: 'Complete Automation', desc: 'From invoice upload to filing in minutes' },
              { title: 'Affordable Pricing', desc: 'Transparent pricing, no hidden charges' },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex-shrink-0">
                  <Check className="w-6 h-6 text-accent-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-white/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Choose the plan that fits your business. Upgrade anytime.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div 
                key={idx}
                className={`group rounded-2xl overflow-hidden transition-all duration-500 animate-scale-in hover:-translate-y-4 ${
                  plan.featured
                    ? 'md:scale-105 border-2 border-accent-500 shadow-soft-xl relative bg-gradient-to-br from-white to-accent-50 hover:shadow-accent-500/20'
                    : 'border-2 border-gray-200 bg-white hover:border-accent-500 hover:shadow-soft-xl hover:bg-accent-50/30'
                }`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {plan.featured && (
                  <div className="absolute top-0 right-0 bg-accent-500 text-white px-4 py-2 rounded-bl-lg text-sm font-bold">
                    POPULAR
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-6">{plan.desc}</p>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-5xl font-bold text-primary-500">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                  </div>

                  <button className={`w-full py-3 rounded-xl font-bold text-lg mb-8 transition-all duration-500 hover:shadow-soft-lg ${
                    plan.featured
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-primary-500 hover:scale-105'
                      : 'border-2 border-accent-500 text-accent-600 hover:bg-gradient-to-r hover:from-amber-400 hover:to-yellow-500 hover:text-primary-500 hover:border-transparent transition-all'
                  }`}>
                    {plan.cta}
                  </button>

                  <ul className="space-y-4">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <CheckCircle size={20} className="text-accent-500 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Loved by Business Owners</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Don't just take our word for it. See what our customers say.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-accent-500 hover:shadow-soft-xl transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-accent-500 text-accent-500" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>

                <div className="flex items-center gap-4 border-t pt-6">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contact Content */}
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold text-primary-500 mb-6">Contact Our Experts</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Need specialized assistance with GST, ITR, or Business registration? Our Chartered Accountants are just a message away.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600">
                    <Mail size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-bold text-primary-500">support@taxflowpro.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600">
                    <Phone size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Support</p>
                    <p className="font-bold text-primary-500">+91 1800-TAX-FLOW</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Head Office</p>
                    <p className="font-bold text-primary-500">BKC Business Park, Mumbai, 400051</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-slate-50 p-8 rounded-2xl border-2 border-gray-100 shadow-soft-lg animate-slide-up">
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Your Name" placeholder="Enter your name" required />
                  <Input label="Email Address" type="email" placeholder="name@company.com" required />
                </div>
                <Input label="Subject" placeholder="How can we help you?" required />
                <div>
                  <label className="block text-sm font-semibold text-primary-500 mb-2">Message</label>
                  <textarea 
                    className="input-field min-h-[120px] w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:outline-none" 
                    placeholder="Tell us more about your query..."
                    required
                  ></textarea>
                </div>
                <Button variant="accent" className="w-full py-4 text-lg flex items-center justify-center gap-2">
                  Send Message <ArrowRight size={20} />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Find answers to common questions about TaxFlow Pro.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:border-accent-500 hover:shadow-soft-lg animate-slide-up"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-bold text-lg text-left text-gray-900">{faq.q}</h3>
                  <div className="flex-shrink-0 ml-4">
                    {expandedFaq === idx ? (
                      <ChevronUp className="text-accent-500" size={24} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={24} />
                    )}
                  </div>
                </button>

                {expandedFaq === idx && (
                  <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 animate-slide-down">
                    <p className="text-gray-700 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-primary-500 shadow-soft-xl transition-all duration-500 transform ${
          showScrollTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        } hover:scale-110 hover:shadow-accent-500/25 active:scale-95`}
        aria-label="Scroll to top"
      >
        <ChevronUp size={24} strokeWidth={3} />
      </button>

      <Footer />
    </div>
  );
};

export default HomePage;
