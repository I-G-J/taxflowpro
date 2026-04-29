import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Modal } from '../components/UI';
import ClientSidebar from '../components/ClientSidebar';
import { Download, Eye, CreditCard, TrendingUp, ArrowRight } from 'lucide-react';
import { invoiceAPI } from '../services/api';

const InvoiceBilling = () => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await invoiceAPI.getInvoices('', 1, 50);
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Unable to fetch invoices', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const payments = invoices
    .filter((invoice) => invoice.paymentMethod || invoice.status?.toLowerCase() === 'paid')
    .map((invoice, index) => ({
      id: invoice._id || index,
      invoice: invoice.invoiceId || invoice._id || `INV-${index + 1}`,
      amount: typeof invoice.totalAmount === 'number' ? `₹${invoice.totalAmount.toLocaleString()}` : invoice.totalAmount || '₹0',
      date: invoice.paymentDate ? new Date(invoice.paymentDate).toLocaleDateString() : invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-',
      method: invoice.paymentMethod || 'N/A',
      status: invoice.status || 'Pending',
      refId: invoice.transactionId || '-',
    }));

  const totalPaid = invoices.reduce((sum, invoice) => (
    invoice.status?.toLowerCase() === 'paid' && typeof invoice.totalAmount === 'number' ? sum + invoice.totalAmount : sum
  ), 0);

  const outstanding = invoices.reduce((sum, invoice) => (
    invoice.status?.toLowerCase() !== 'paid' && typeof invoice.totalAmount === 'number' ? sum + invoice.totalAmount : sum
  ), 0);

  const handleExportInvoices = () => {
    if (invoices.length === 0) return;
    setExporting(true);
    try {
      const rows = [
        ['Invoice ID', 'Date', 'Service', 'Amount', 'Status', 'Due Date'],
        ...invoices.map((invoice) => [
          invoice._id || invoice.id || 'N/A',
          invoice.date ? new Date(invoice.date).toLocaleDateString() : invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : '-',
          invoice.serviceType || invoice.description || 'N/A',
          typeof invoice.totalAmount === 'number' ? `₹${invoice.totalAmount.toLocaleString()}` : invoice.totalAmount || '₹0',
          invoice.status || 'Pending',
          invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-',
        ]),
      ];
      const csvContent = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'invoices.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Invoice export failed', error);
    } finally {
      setExporting(false);
    }
  };

  const handleSimulatePayment = (success) => {
    setPaymentProcessing(true);
    // Simulate API/Network delay
    setTimeout(() => {
      setPaymentProcessing(false);
      setShowPaymentModal(false);
      if (success) {
        window.alert('Payment Successful! Transaction ID: pay_dummy_' + Math.random().toString(36).substr(2, 9));
        fetchInvoices();
      } else {
        window.alert('Payment Failed. Please try again.');
      }
    }, 2000);
  };

  return (
    <div className="flex bg-background-50 min-h-screen">
      <ClientSidebar />
      
      <main className="flex-1 p-4 md:p-8 md:ml-0 mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">Invoice & Billing</h1>
          <p className="text-gray-600 mb-8">Manage your invoices and payments</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount Paid</p>
                  <p className="text-3xl font-bold text-accent-500">₹{totalPaid.toLocaleString()}</p>
                </div>
                <CreditCard className="w-8 h-8 text-accent-500" />
              </div>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Outstanding Amount</p>
                  <p className="text-3xl font-bold text-primary-500">₹{outstanding.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </Card>

            <Card>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Plan</p>
                  <p className="text-lg font-bold text-primary-500">{invoices[0]?.serviceType || 'Full Compliance'}</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Card className="mb-8">
            <div className="flex gap-4 border-b pb-4 mb-6">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                  activeTab === 'invoices'
                    ? 'bg-accent-500 text-primary-500'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                Invoices
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-2 font-semibold rounded-lg transition-colors ${
                  activeTab === 'payments'
                    ? 'bg-accent-500 text-primary-500'
                    : 'text-gray-600 hover:text-primary-500'
                }`}
              >
                Payments
              </button>
            </div>

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Invoice ID</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Service</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Amount</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice._id || invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-semibold text-primary-500">{invoice._id || invoice.id}</td>
                        <td className="py-4 px-4 text-gray-600">{new Date(invoice.date || invoice.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-4 text-gray-600">{invoice.serviceType || invoice.description || 'N/A'}</td>
                        <td className="py-4 px-4 font-bold text-primary-500">{typeof invoice.totalAmount === 'number' ? `₹${invoice.totalAmount.toLocaleString()}` : invoice.totalAmount || '₹0'}</td>
                        <td className="py-4 px-4">
                          <Badge variant={invoice.status?.toLowerCase() === 'paid' ? 'success' : 'warning'}>
                            {invoice.status || 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <button className="p-2 hover:bg-blue-100 rounded text-blue-600">
                              <Eye size={18} />
                            </button>
                            <button className="p-2 hover:bg-green-100 rounded text-accent-500" onClick={handleExportInvoices}>
                              <Download size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Invoice</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Date</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Amount</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Method</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Ref ID</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 font-semibold text-primary-500">{payment.invoice}</td>
                        <td className="py-4 px-4 text-gray-600">{new Date(payment.date).toLocaleDateString()}</td>
                        <td className="py-4 px-4 font-bold text-accent-500">{payment.amount}</td>
                        <td className="py-4 px-4 text-gray-600">{payment.method}</td>
                        <td className="py-4 px-4 text-gray-600 text-sm font-mono">{payment.refId}</td>
                        <td className="py-4 px-4">
                          <Badge variant="success">{payment.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Payment Method */}
          <Card>
            <h2 className="text-xl font-bold text-primary-500 mb-6">Make a Payment</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
              <p className="text-gray-600 mb-4">Pay for your services using Razorpay</p>
              <Button 
                variant="primary" 
                className="flex items-center justify-center gap-2"
                onClick={() => setShowPaymentModal(true)}
                disabled={outstanding <= 0}
              >
                <CreditCard size={18} />
                {outstanding > 0 ? `Pay ₹${outstanding.toLocaleString()} via Razorpay` : 'No Outstanding Dues'}
              </Button>
            </div>
          </Card>
        </div>
      </main>

      {/* Dummy Razorpay Checkout Template */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => !paymentProcessing && setShowPaymentModal(false)}
        title="Razorpay Secure Checkout"
        size="md"
      >
        <div className="flex flex-col">
          {/* Razorpay Brand Header */}
          <div className="bg-[#3395FF] -mx-8 -mt-8 p-6 mb-6 text-white flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">TaxFlow Pro</h3>
              <p className="text-sm opacity-90 font-medium">Invoice Payment</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold tracking-tight">₹{outstanding.toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-xl bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Preferred Method</span>
              <Badge variant="primary">UPI / QR</Badge>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button className="w-full p-4 border rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-left flex items-center gap-4 group">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold">C</div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-800">Cards</p>
                  <p className="text-xs text-gray-500">Visa, Mastercard, RuPay & More</p>
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            <div className="pt-6 border-t flex flex-col gap-3">
              <Button variant="primary" onClick={() => handleSimulatePayment(true)} disabled={paymentProcessing}>
                {paymentProcessing ? 'Processing Securely...' : 'Simulate Successful Payment'}
              </Button>
              <Button variant="outline" onClick={() => handleSimulatePayment(false)} disabled={paymentProcessing}>
                Simulate Payment Failure
              </Button>
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-6 uppercase tracking-widest font-extrabold">
              Secured by Razorpay
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoiceBilling;
