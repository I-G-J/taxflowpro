import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Client Dashboard
import DashboardHome from './pages/DashboardHome';
import UploadDocuments from './pages/UploadDocuments';
import FilingHistory from './pages/FilingHistory';
import InvoiceBilling from './pages/InvoiceBilling';
import ChatSupport from './pages/ChatSupport';
import ProfileKYC from './pages/ProfileKYC';

// Admin Dashboard
import AdminDashboard from './pages/AdminDashboard';
import AdminClientManagement from './pages/AdminClientManagement';
import AdminFilingWorkflow from './pages/AdminFilingWorkflow';
import AdminReports from './pages/AdminReports';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AccountantDashboard from './pages/AccountantDashboard';
import AccountantDocuments from './pages/AccountantDocuments';
import { PrivateRoute, AdminRoute, AccountantRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Client Dashboard Routes */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardHome /></PrivateRoute>} />
          <Route path="/dashboard/upload" element={<PrivateRoute><UploadDocuments /></PrivateRoute>} />
          <Route path="/dashboard/filing-history" element={<PrivateRoute><FilingHistory /></PrivateRoute>} />
          <Route path="/dashboard/billing" element={<PrivateRoute><InvoiceBilling /></PrivateRoute>} />
          <Route path="/dashboard/chat" element={<PrivateRoute><ChatSupport /></PrivateRoute>} />
          <Route path="/dashboard/profile" element={<PrivateRoute><ProfileKYC /></PrivateRoute>} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/clients" element={<AdminRoute><AdminClientManagement /></AdminRoute>} />
          <Route path="/admin/filings" element={<AdminRoute><AdminFilingWorkflow /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

          {/* Accountant Dashboard Routes */}
          <Route path="/accountant" element={<AccountantRoute><AccountantDashboard /></AccountantRoute>} />
          <Route path="/accountant/clients" element={<AccountantRoute><AccountantDashboard /></AccountantRoute>} />
          <Route path="/accountant/documents" element={<AccountantRoute><AccountantDocuments /></AccountantRoute>} />
          <Route path="/accountant/chat" element={<AccountantRoute><ChatSupport /></AccountantRoute>} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
