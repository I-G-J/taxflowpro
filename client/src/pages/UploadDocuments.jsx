import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '../components/UI';
import ClientSidebar from '../components/ClientSidebar';
import { Upload, Plus, Trash2, FileText } from 'lucide-react';
import { documentAPI } from '../services/api';

const UploadDocuments = () => {
  const [month, setMonth] = useState('2024-04');
  const [category, setCategory] = useState('invoice');
  const [files, setFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const [recentUploads, setRecentUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const monthOptions = [
    { label: 'April 2024', value: '2024-04' },
    { label: 'March 2024', value: '2024-03' },
    { label: 'February 2024', value: '2024-02' },
    { label: 'January 2024', value: '2024-01' },
    { label: 'December 2023', value: '2023-12' },
    { label: 'November 2023', value: '2023-11' },
  ];

  const categories = [
    { label: 'Invoices', value: 'invoice' },
    { label: 'Receipts', value: 'receipt' },
    { label: 'Expense Reports', value: 'expense' },
    { label: 'Bank Statements', value: 'bank_statement' },
    { label: 'Purchase Orders', value: 'purchase_register' },
    { label: 'Payroll', value: 'other' },
  ];

  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles([...files, ...newFiles]);
  };

  const removeFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const getRecentUploads = async () => {
    try {
      const response = await documentAPI.getDocuments(1, 6);
      setRecentUploads(response.data.documents || []);
    } catch (error) {
      console.error('Unable to load recent uploads', error);
    }
  };

  useEffect(() => {
    getRecentUploads();
  }, []);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Verified';
      case 'under_review':
        return 'Under Review';
      case 'uploaded':
        return 'Uploaded';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'under_review':
        return 'warning';
      case 'uploaded':
        return 'primary';
      case 'rejected':
        return 'danger';
      default:
        return 'outline';
    }
  };

  const handleUploadDocuments = async () => {
    if (files.length === 0) {
      setErrorMessage('Please select at least one file to upload.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('month', month);
      formData.append('category', category);
      formData.append('notes', notes);
      files.forEach((file) => {
        formData.append('documents', file);
      });

      const response = await documentAPI.upload(formData);
      setSuccessMessage(response.message || 'Documents uploaded successfully.');
      setFiles([]);
      setNotes('');
      getRecentUploads();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex bg-background-50 min-h-screen">
      <ClientSidebar />
      
      <main className="flex-1 p-4 md:p-8 md:ml-0 mt-16 md:mt-0">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">Upload Documents</h1>
          <p className="text-gray-600 mb-8">Upload invoices and receipts for monthly GST filing</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <Card className="lg:col-span-2">
              <h2 className="text-xl font-bold text-primary-500 mb-6">Document Upload</h2>

              {/* Month and Category Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-primary-500 mb-2">Month</label>
                  <select 
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="input-field"
                  >
                    {monthOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-primary-500 mb-2">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drag and Drop Area */}
              <label className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent-500 hover:bg-accent-50 transition-colors block mb-6">
                <Upload className="w-12 h-12 text-accent-500 mx-auto mb-4" />
                <p className="font-semibold text-primary-500 mb-2">Drag and drop files here</p>
                <p className="text-sm text-gray-600 mb-4">or click to browse</p>
                <p className="text-xs text-gray-500">Supported formats: PDF, Excel, Images (Max 10MB per file)</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.xlsx,.xls,.jpg,.png"
                />
              </label>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-primary-500 mb-2">Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field"
                  rows="4"
                  placeholder="Add any notes about these documents..."
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-primary-500 mb-4">Selected Files ({files.length})</h3>
                  <div className="space-y-2">
                    {files.map((file, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-accent-500" />
                          <div>
                            <p className="font-semibold text-sm text-primary-500">{file.name}</p>
                            <p className="text-xs text-gray-600">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-danger hover:bg-red-100 p-2 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 p-4">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mb-4 rounded-lg bg-green-50 border border-green-200 text-green-700 p-4">
                  {successMessage}
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={handleUploadDocuments}
                  disabled={isUploading}
                >
                  <Plus size={18} />
                  {isUploading ? 'Uploading...' : 'Upload Files'}
                </Button>
                <Button variant="outline" className="flex-1" onClick={getRecentUploads}>
                  Refresh Recent Uploads
                </Button>
              </div>
            </Card>

            {/* Sidebar Info */}
            <div>
              <Card className="mb-6">
                <Badge variant="success" className="mb-4">Upload Guide</Badge>
                <h3 className="font-bold text-lg text-primary-500 mb-4">Tips for Better Filing</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li>✓ Organize documents by category</li>
                  <li>✓ Use clear, legible scans</li>
                  <li>✓ Include all supporting documents</li>
                  <li>✓ Upload before deadline</li>
                  <li>✓ Keep originals for verification</li>
                </ul>
              </Card>

              <Card>
                <h3 className="font-bold text-lg text-primary-500 mb-4">Recent Uploads</h3>
                <div className="space-y-3 text-sm">
                  {recentUploads.length > 0 ? (
                    recentUploads.slice(0, 3).map((upload) => (
                      <div key={upload._id} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-primary-500">{upload.category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                          <p className="text-gray-600 text-xs">{upload.month}</p>
                        </div>
                        <Badge variant={getStatusVariant(upload.status)}>{getStatusLabel(upload.status)}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-600">No uploads yet. Upload documents to see recent activity here.</div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadDocuments;
