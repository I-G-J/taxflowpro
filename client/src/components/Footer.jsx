import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary-500 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-500 font-bold">TF</span>
              </div>
              <span className="text-xl font-bold">TaxFlow Pro</span>
            </div>
            <p className="text-gray-200 text-sm">India's most trusted tax & compliance platform</p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-gray-200">
              <li><Link to="/#services" className="hover:text-white transition-colors">GST Filing</Link></li>
              <li><Link to="/#services" className="hover:text-white transition-colors">ITR Filing</Link></li>
              <li><Link to="/#services" className="hover:text-white transition-colors">TDS Filing</Link></li>
              <li><Link to="/#services" className="hover:text-white transition-colors">Business Registration</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-200">
              <li><Link to="/#about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/#contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><a href="#home" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-200">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-600 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-200">© 2026 TaxFlow Pro. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-accent-500 hover:-translate-y-1 hover:scale-110 transition-all duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-accent-500 hover:-translate-y-1 hover:scale-110 transition-all duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-accent-500 hover:-translate-y-1 hover:scale-110 transition-all duration-300">
                <Linkedin size={20} />
              </a>
              <a href="#" className="hover:text-accent-500 hover:-translate-y-1 hover:scale-110 transition-all duration-300">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
