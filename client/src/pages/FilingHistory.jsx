import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Modal } from '../components/UI';
import ClientSidebar from '../components/ClientSidebar';
import { Download, Eye, Search, X } from 'lucide-react';
import { filingAPI, documentAPI } from '../services/api';

const FilingHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filings, setFilings] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [showReceiptsModal, setShowReceiptsModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchFilings = async () => {
    setIsLoading(true);
    try {
      const response = await documentAPI.getDocuments(1, 50, 'invoice');
      setFilings(response.data.documents || []);
    } catch (error) {
      console.error('Unable to fetch filings', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReceipts = async () => {
    try {
      const response = await documentAPI.getDocuments(1, 50);
      const receiptDocs = (response.data.documents || []).filter((doc) => doc.category === 'receipt' || doc.category === 'other');
      setReceipts(receiptDocs);
      setShowReceiptsModal(true);
    } catch (error) {
      console.error('Unable to fetch receipts', error);
    }
  };

  const handleDownloadFile = async (documentId, index, originalName) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/documents/${documentId}/download?fileIndex=${index}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed', error);
      window.alert('Failed to download file. Please try again later.');
    }
  };

  const handlePreviewFile = async (documentId, index = 0) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/documents/${documentId}/download?fileIndex=${index}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch document for preview');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Preview failed', error);
      window.alert('Failed to preview file. Please try again later.');
    }
  };

  const exportReport = async () => {
    setIsExporting(true);
    try {
      const rows = [
        ['Filing Type', 'Period', 'Filing Date', 'Amount', 'Status'],
        ...filings.map((filing) => [
          filing.filingType || filing.type || '-',
          filing.filingPeriod || filing.period || '-',
          new Date(filing.createdAt || filing.date || '').toLocaleDateString(),
          typeof filing.amount === 'number' ? `₹${filing.amount.toLocaleString()}` : filing.amount || '-',
          filing.status || 'Pending',
        ]),
      ];
      const csvContent = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filing_history.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Unable to export report', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDFReport = async () => {
    setIsExporting(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Filing History Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1f3a93; padding-bottom: 20px; }
              .header h1 { margin: 0; color: #1f3a93; }
              .header p { margin: 5px 0; color: #666; }
              .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 30px 0; }
              .stat-box { background: #f0f5ff; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #1f3a93; }
              .stat-value { font-size: 24px; font-weight: bold; color: #1f3a93; }
              .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #1f3a93; color: white; padding: 12px; text-align: left; }
              td { padding: 12px; border-bottom: 1px solid #ddd; }
              tr:nth-child(even) { background: #f9f9f9; }
              .footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📊 Filing History Report</h1>
              <p>Generated on ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div class="summary">
              <div class="stat-box">
                <div class="stat-value">${filings.length}</div>
                <div class="stat-label">Total Documents</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${filings.filter((f) => f.month?.includes('2024')).length}</div>
                <div class="stat-label">This Year</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${filings.reduce((sum, doc) => sum + (doc.files?.length || 0), 0)}</div>
                <div class="stat-label">Total Files</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${filings.filter((f) => f.status?.toLowerCase() === 'approved').length}</div>
                <div class="stat-label">Approved</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Month</th>
                  <th>Upload Date</th>
                  <th>Files</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${filings.map((filing) => `
                  <tr>
                    <td>${filing.category || '-'}</td>
                    <td>${filing.month || '-'}</td>
                    <td>${new Date(filing.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>${filing.files?.length || 0}</td>
                    <td>${filing.status || 'Pending'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>This is an official filing history report from TaxFlow Pro</p>
              <p>For verification, please contact support@taxflowpro.com</p>
            </div>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '', 'width=900,height=700');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error('PDF generation failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    fetchFilings();
  }, []);

  const filteredFilings = filings.filter((f) =>
    f.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.month?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex bg-background-50 min-h-screen">
      <ClientSidebar />
      
      <main className="flex-1 p-4 md:p-8 md:ml-0 mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">Filing History</h1>
          <p className="text-gray-600 mb-8">View all your filed documents and download proofs</p>

          <Card className="mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documents by category or month..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 pb-8 border-b">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-accent-500">{filings.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">This Year</p>
                <p className="text-2xl font-bold text-accent-500">{filings.filter((f) => f.month?.includes('2024')).length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-accent-500">{filings.reduce((sum, doc) => sum + (doc.files?.length || 0), 0)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-success">{filings.filter((f) => f.status?.toLowerCase() === 'approved').length}</p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Category</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Month</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Upload Date</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Files</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-primary-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFilings.map((filing) => (
                    <tr key={filing._id || filing.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-primary-500">{filing.category}</td>
                      <td className="py-4 px-4 text-gray-600">{filing.month}</td>
                      <td className="py-4 px-4 text-gray-600">{new Date(filing.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-gray-600 font-semibold">{filing.files?.length || 0}</td>
                      <td className="py-4 px-4">
                        <Badge variant={filing.status?.toLowerCase() === 'approved' ? 'success' : filing.status?.toLowerCase() === 'rejected' ? 'danger' : 'warning'}>{filing.status || 'Pending'}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => filing.files?.length > 0 && handlePreviewFile(filing._id, 0)}
                            className={`p-2 rounded transition-colors ${filing.files?.length > 0 ? 'hover:bg-blue-100 text-blue-600' : 'text-gray-300 cursor-not-allowed'}`}
                            title={filing.files?.length > 0 ? "Preview Document" : "No files available"}
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => filing.files?.length > 0 && handleDownloadFile(filing._id, 0, filing.files[0].originalName)}
                            className={`p-2 rounded transition-colors ${filing.files?.length > 0 ? 'hover:bg-green-100 text-accent-500' : 'text-gray-300 cursor-not-allowed'}`}
                            title={filing.files?.length > 0 ? "Download Document" : "No files available"}
                          >
                            <Download size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Additional Resources */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <h3 className="font-bold text-lg text-primary-500 mb-4">Download Acknowledgements</h3>
              <p className="text-sm text-gray-600 mb-6">Get official acknowledgement certificates from tax authorities</p>
              <Button variant="outline" className="w-full" onClick={() => window.alert('Download acknowledgements is available after filings are approved.')}>Download All</Button>
            </Card>

            <Card>
              <h3 className="font-bold text-lg text-primary-500 mb-4">View Receipts</h3>
              <p className="text-sm text-gray-600 mb-6">View payment receipts and transaction history</p>
              <Button variant="outline" className="w-full" onClick={fetchReceipts}>View Receipts</Button>
            </Card>

            <Card>
              <h3 className="font-bold text-lg text-primary-500 mb-4">Export Report</h3>
              <p className="text-sm text-gray-600 mb-6">Export complete filing history as PDF or CSV</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={generatePDFReport} disabled={isExporting}>
                  {isExporting ? 'Generating...' : 'Export PDF'}
                </Button>
                <Button variant="outline" className="flex-1" onClick={exportReport} disabled={isExporting}>
                  Export CSV
                </Button>
              </div>
            </Card>
          </div>

          <Modal 
            isOpen={showReceiptsModal} 
            onClose={() => setShowReceiptsModal(false)}
            title="Receipt Documents"
            size="lg"
          >
            {receipts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Category</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Month</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Files</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((receipt) => (
                      <tr key={receipt._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-gray-600">{receipt.category.replace('_', ' ').toUpperCase()}</td>
                        <td className="py-4 px-4 text-gray-600">{receipt.month}</td>
                        <td className="py-4 px-4">
                          <Badge variant={receipt.status === 'approved' ? 'success' : receipt.status === 'rejected' ? 'danger' : 'warning'}>
                            {receipt.status || 'Uploaded'}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col gap-2">
                            {receipt.files?.map((file, fIdx) => (
                              <button 
                                key={fIdx}
                                onClick={() => handleDownloadFile(receipt._id, fIdx, file.originalName)}
                                className="flex items-center gap-2 text-xs text-blue-600 hover:text-primary-500 hover:underline transition-all text-left"
                              >
                                <Download size={14} />
                                <span className="truncate max-w-[120px]" title={file.originalName}>{file.originalName}</span>
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No receipts found. Upload receipt documents from the Upload Documents page.</p>
            )}
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default FilingHistory;
