import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import AccountantSidebar from '../components/AccountantSidebar';
import { documentAPI } from '../services/api';
import { CheckCircle, XCircle, Download, Eye } from 'lucide-react';

const AccountantDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDocuments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await documentAPI.getDocuments(1, 50);
      setDocuments(response.data.documents || []);
    } catch (err) {
      setError(err.message || 'Unable to load documents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDocumentReview = async (documentId, status, reviewNotes = '') => {
    setMessage('');
    setError('');

    try {
      await documentAPI.updateStatus(documentId, status, reviewNotes);
      setMessage(`Document ${status} successfully.`);
      await loadDocuments();
    } catch (err) {
      setError(err.message || `Failed to ${status} document.`);
    }
  };

  const handleDownload = (documentId) => {
    const downloadUrl = documentAPI.downloadDocument(documentId).url;
    window.open(downloadUrl, '_blank');
  };

  const pendingDocuments = documents.filter((doc) => doc.status === 'pending').length;
  const approvedDocuments = documents.filter((doc) => doc.status === 'approved').length;

  return (
    <div className="flex bg-background-50 min-h-screen">
      <AccountantSidebar />

      <main className="flex-1 p-4 md:p-8 md:ml-0 mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary-500 mb-2">Document Management</h1>
              <p className="text-gray-600">Review and approve documents uploaded by your assigned clients.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Badge variant="warning">{pendingDocuments} Pending</Badge>
              <Badge variant="success">{approvedDocuments} Approved</Badge>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
          )}
          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>
          )}

          <Card>
            {loading ? (
              <p className="text-gray-600">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-gray-600">No documents found from assigned clients.</p>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc._id} className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                    <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Client</p>
                        <h3 className="text-lg font-semibold text-primary-500">
                          {doc.userId?.name || doc.userId?.email || 'Unknown Client'}
                        </h3>
                        <p className="text-sm text-gray-600">{doc.userId?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Document Details</p>
                        <p className="font-semibold text-primary-500">{doc.category} - {doc.month}</p>
                        <p className="text-sm text-gray-600">Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div className="rounded-2xl bg-white p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Files</p>
                        <p className="font-semibold text-primary-500">{doc.files?.length || 0} files</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Status</p>
                        <Badge variant={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'danger' : 'warning'}>
                          {doc.status || 'pending'}
                        </Badge>
                      </div>
                      <div className="rounded-2xl bg-white p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Notes</p>
                        <p className="text-sm text-gray-600">{doc.notes || 'No notes'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(doc._id)}
                        className="flex items-center gap-2"
                      >
                        <Download size={16} />
                        Download
                      </Button>
                      {doc.status === 'pending' && (
                        <>
                          <Button
                            variant="success"
                            onClick={() => handleDocumentReview(doc._id, 'approved')}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDocumentReview(doc._id, 'rejected', 'Document rejected by accountant')}
                            className="flex items-center gap-2"
                          >
                            <XCircle size={16} />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AccountantDocuments;