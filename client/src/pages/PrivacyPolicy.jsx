import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      {/* Page Header */}
      <section className="pt-32 pb-16 px-4 bg-primary-500 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
            <Shield size={32} className="text-accent-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-300">Your data security and privacy are our top priorities.</p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-soft-lg p-8 md:p-12">
          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-primary-500 mb-4 flex items-center gap-2">
                <Eye size={24} className="text-accent-500" />
                1. Information We Collect
              </h2>
              <p className="text-gray-600 leading-relaxed">
                At TaxFlow Pro, we collect information that is necessary to provide you with our tax and compliance services. This includes personal identification information (Name, Email, Phone), business details (GSTIN, PAN, Business Name), and financial documents uploaded for filing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-500 mb-4 flex items-center gap-2">
                <Lock size={24} className="text-accent-500" />
                2. How We Use Your Data
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>To process and file your GST, ITR, and other compliance returns.</li>
                <li>To provide expert CA support and consultation.</li>
                <li>To maintain your account and notify you about upcoming deadlines.</li>
                <li>To improve our AI-powered accuracy and platform features.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-500 mb-4 flex items-center gap-2">
                <Shield size={24} className="text-accent-500" />
                3. Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We implement industry-standard 256-bit encryption and ISO 27001 certified security protocols to ensure your data remains confidential and protected from unauthorized access. Your documents are stored in secure cloud environments with strictly controlled access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-500 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-accent-500" />
                4. Your Rights
              </h2>
              <p className="text-gray-600 leading-relaxed">
                You have the right to access, update, or delete your personal information at any time through your dashboard. For any specific data requests or privacy concerns, you can reach out to our DPO (Data Protection Officer).
              </p>
            </section>

            <div className="border-t border-gray-100 pt-8 mt-12">
              <p className="text-sm text-gray-500 italic">
                Last Updated: April 20, 2026. TaxFlow Pro reserves the right to update this policy periodically.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-gray-600">
            Questions about our privacy policy? <a href="mailto:support@taxflowpro.com" className="text-accent-500 font-bold hover:underline">Contact Support</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;