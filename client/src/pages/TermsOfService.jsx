import React, { useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Scale, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const TermsOfService = () => {
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
            <Scale size={32} className="text-accent-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-300">Please read these terms carefully before using our platform.</p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-soft-lg p-8 md:p-12">
          <div className="prose prose-slate max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-primary-500 mb-4 flex items-center gap-2">
                <CheckCircle size={24} className="text-accent-500" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using TaxFlow Pro, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-500 mb-4 flex items-center gap-2">
                <FileText size={24} className="text-accent-500" />
                2. Service Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                TaxFlow Pro provides a SaaS platform for tax automation, GST filing, ITR filing, and compliance management. While our AI and Chartered Accountants provide high-accuracy support, the final responsibility for the accuracy of submitted information lies with the user.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-500 mb-4 flex items-center gap-2">
                <AlertCircle size={24} className="text-accent-500" />
                3. User Responsibilities
              </h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Providing accurate and truthful information for tax filings.</li>
                <li>Maintaining the confidentiality of your account credentials.</li>
                <li>Ensuring all documents are uploaded before the government-mandated deadlines.</li>
                <li>Paying all service fees as per the chosen pricing plan.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary-500 mb-4 flex items-center gap-2">
                <Scale size={24} className="text-accent-500" />
                4. Limitation of Liability
              </h2>
              <p className="text-gray-600 leading-relaxed">
                TaxFlow Pro shall not be liable for any penalties, interest, or legal consequences resulting from incorrect data provided by the user or delays in document uploads. Our total liability is limited to the amount paid for the service in question.
              </p>
            </section>

            <div className="border-t border-gray-100 pt-8 mt-12">
              <p className="text-sm text-gray-500 italic">
                Effective Date: April 20, 2026. These terms are governed by the laws of India.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-gray-600">
            Need clarification? <a href="/#home" className="text-accent-500 font-bold hover:underline">Speak with our Legal Team</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;