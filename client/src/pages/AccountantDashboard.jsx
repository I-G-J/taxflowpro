import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from '../components/UI';
import AccountantSidebar from '../components/AccountantSidebar';
import { assignmentAPI, userAPI, documentAPI } from '../services/api';
import { Clock, FileText, Users, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

const AccountantDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const loadAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await assignmentAPI.getAssignments('', 1, 100);
      setAssignments(response.data.assignments || []);
    } catch (err) {
      setError(err.message || 'Unable to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await documentAPI.getDocuments(1, 50);
      setDocuments(response.data.documents || []);
    } catch (err) {
      console.error('Unable to load documents:', err);
    }
  };

  useEffect(() => {
    loadAssignments();
    loadDocuments();
  }, []);

  const pendingKYCCount = assignments.filter((assignment) => assignment.clientId?.kycStatus !== 'verified').length;
  const totalClients = assignments.length;
  const upcomingDeadlines = assignments.filter((assignment) => new Date(assignment.deadline) > new Date()).length;
  const pendingDocuments = documents.filter((doc) => doc.status === 'pending').length;

  const handleVerifyKYC = async (clientId) => {
    setMessage('');
    setError('');

    try {
      await userAPI.verifyKYC(clientId, 'verified');
      setMessage('Client KYC verified successfully.');
      await loadAssignments();
    } catch (err) {
      setError(err.message || 'Failed to verify KYC status.');
    }
  };

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

  return (
    <div className="flex bg-background-50 min-h-screen">
      <AccountantSidebar />

      <main className="flex-1 p-4 md:p-8 md:ml-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary-500 mb-2">Accountant Dashboard</h1>
              <p className="text-gray-600">View your assigned clients, documents, and KYC status.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Badge variant="primary">{totalClients} Clients</Badge>
              <Badge variant="warning">{pendingKYCCount} KYC pending</Badge>
              <Badge variant="success">{upcomingDeadlines} Active assignments</Badge>
              <Badge variant="info">{pendingDocuments} Documents pending</Badge>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
          )}
          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Users size={24} className="text-primary-500" />
                <div>
                  <p className="text-sm text-gray-600">Assigned Clients</p>
                  <p className="text-3xl font-bold text-primary-500">{totalClients}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Clients that have been assigned to you by the admin.</p>
            </Card>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={24} className="text-success" />
                <div>
                  <p className="text-sm text-gray-600">KYC Pending</p>
                  <p className="text-3xl font-bold text-success">{pendingKYCCount}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Verify assigned client KYC details before approval.</p>
            </Card>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Clock size={24} className="text-warning" />
                <div>
                  <p className="text-sm text-gray-600">Active Assignments</p>
                  <p className="text-3xl font-bold text-warning">{upcomingDeadlines}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Assignments with upcoming deadlines and active follow-ups.</p>
            </Card>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <FileText size={24} className="text-info" />
                <div>
                  <p className="text-sm text-gray-600">Documents Pending</p>
                  <p className="text-3xl font-bold text-info">{pendingDocuments}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Client documents awaiting your review and approval.</p>
            </Card>
          </div>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary-500">Assigned Client Details</h2>
                <p className="text-gray-600">Review documents, KYC status, and client details for each assignment.</p>
              </div>
              <Button variant="accent" onClick={() => navigate('/accountant/chat')}>
                Open Chat
              </Button>
            </div>

            {loading ? (
              <p className="text-gray-600">Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p className="text-gray-600">No assignments found. Ask admin to assign clients to you.</p>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="rounded-2xl border border-gray-200 p-5 bg-gray-50">
                    <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Client</p>
                        <h3 className="text-lg font-semibold text-primary-500">
                          {assignment.clientId?.businessName || `${assignment.clientId?.firstName || ''} ${assignment.clientId?.lastName || ''}`.trim()}
                        </h3>
                        <p className="text-sm text-gray-600">{assignment.clientId?.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Service</p>
                        <p className="font-semibold text-primary-500 capitalize">{assignment.serviceType.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-600">Deadline: {new Date(assignment.deadline).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                      <div className="rounded-2xl bg-white p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Client KYC</p>
                        <Badge variant={assignment.clientId?.kycStatus === 'verified' ? 'success' : assignment.clientId?.kycStatus === 'in_progress' ? 'warning' : 'default'}>
                          {assignment.clientId?.kycStatus || 'not_started'}
                        </Badge>
                      </div>
                      <div className="rounded-2xl bg-white p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Business Type</p>
                        <p className="font-semibold text-primary-500 capitalize">{assignment.clientId?.businessType || 'N/A'}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">Uploaded Docs</p>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>Aadhar: {assignment.clientId?.kycDocuments?.aadhar ? 'Yes' : 'No'}</p>
                          <p>PAN: {assignment.clientId?.kycDocuments?.pan ? 'Yes' : 'No'}</p>
                          <p>GSTIN: {assignment.clientId?.kycDocuments?.gstin ? 'Yes' : 'No'}</p>
                          <p>Bank Proof: {assignment.clientId?.kycDocuments?.bankProof ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>

                    {assignment.clientId?.kycStatus === 'verified' ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="rounded-2xl bg-green-50 border border-green-200 p-4 flex-1">
                          <p className="text-sm font-semibold text-green-700 mb-2">KYC Verified Documents</p>
                          <div className="space-y-2 text-sm text-gray-700">
                            <p><span className="font-semibold">PAN:</span> {assignment.clientId?.pan || 'N/A'}</p>
                            <p><span className="font-semibold">GSTIN:</span> {assignment.clientId?.gstin || 'N/A'}</p>
                            <p><span className="font-semibold">Verified At:</span> {assignment.clientId?.kycVerifiedAt ? new Date(assignment.clientId.kycVerifiedAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        <Button variant="primary" onClick={() => navigate('/accountant/chat')}>
                          Chat with client
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button variant="primary" onClick={() => navigate('/accountant/chat')}>
                          Chat with client
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleVerifyKYC(assignment.clientId?._id)}
                        >
                          Verify KYC
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary-500">Client Document Management</h2>
                <p className="text-gray-600">Review and approve documents uploaded by your assigned clients.</p>
              </div>
            </div>

            {documents.length === 0 ? (
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

                    {doc.status === 'pending' && (
                      <div className="flex flex-col sm:flex-row gap-3">
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
                      </div>
                    )}
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

export default AccountantDashboard;
