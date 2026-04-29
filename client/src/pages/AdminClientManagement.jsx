import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Input } from '../components/UI';
import AdminSidebar from '../components/AdminSidebar';
import { Search, Mail, Phone, User, Plus, CheckCircle, ClipboardList } from 'lucide-react';
import { userAPI, assignmentAPI } from '../services/api';

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [accountants, setAccountants] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [accountantToDelete, setAccountantToDelete] = useState(null);

  const [newAccountant, setNewAccountant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
  });

  const [assignmentData, setAssignmentData] = useState({
    clientId: '',
    accountantId: '',
    serviceType: 'full_support',
    deadline: '',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const [clientRes, accountantRes, assignmentRes] = await Promise.all([
        userAPI.getAllUsers(1, 100, 'client'),
        userAPI.getAccountants(),
        assignmentAPI.getAssignments('', 1, 100),
      ]);

      setClients(clientRes.data.users || []);
      setAccountants(accountantRes.data || []);
      setAssignments(assignmentRes.data.assignments || []);
    } catch (err) {
      setError(err.message || 'Unable to load client and accountant data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeAssignments = assignments.filter((assignment) =>
    ['assigned', 'in_progress'].includes(assignment.status)
  );

  const clientAssignmentMap = activeAssignments.reduce((map, assignment) => {
    const clientId = assignment.clientId?._id || assignment.clientId;
    if (!clientId) return map;
    map[clientId] = map[clientId] || [];
    map[clientId].push(assignment);
    return map;
  }, {});

  const assignedAccountantIds = [...new Set(activeAssignments.map((assignment) => assignment.accountantId?._id || assignment.accountantId))];
  const freeAccountants = accountants.filter((accountant) => !assignedAccountantIds.includes(accountant._id));

  const filteredClients = clients.filter((client) =>
    client.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${client.firstName || ''} ${client.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewAccountant((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignmentChange = (event) => {
    const { name, value } = event.target;
    setAssignmentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAccountant = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await userAPI.createUser({
        ...newAccountant,
        role: 'accountant',
      });
      setMessage('Accountant created successfully.');
      setNewAccountant({ firstName: '', lastName: '', email: '', phone: '', password: '', specialization: '' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to create accountant.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignAccountant = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!assignmentData.clientId || !assignmentData.accountantId || !assignmentData.deadline) {
        setError('Please select a client, accountant, and deadline.');
        return;
      }

      await assignmentAPI.create({
        clientId: assignmentData.clientId,
        accountantId: assignmentData.accountantId,
        serviceType: assignmentData.serviceType,
        deadline: assignmentData.deadline,
        notes: assignmentData.notes,
      });

      setMessage('Accountant assigned successfully.');
      setAssignmentData({ clientId: '', accountantId: '', serviceType: 'full_support', deadline: '', notes: '' });
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to assign accountant.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyKYC = async (clientId) => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await userAPI.verifyKYC(clientId, 'verified');
      setMessage('Client KYC verified successfully.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to verify KYC.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeassignAssignment = async (assignmentId) => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      await assignmentAPI.deassign(assignmentId, 'Accountant unassigned by admin');
      setMessage('Accountant deassigned successfully.');
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to deassign accountant.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccountant = (accountantId, accountantName) => {
    setAccountantToDelete({ id: accountantId, name: accountantName });
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteAccountant = async () => {
    if (!accountantToDelete) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      await userAPI.deleteUser(accountantToDelete.id);
      setMessage('Accountant deleted successfully.');
      setConfirmDeleteOpen(false);
      setAccountantToDelete(null);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete accountant.');
    } finally {
      setSaving(false);
    }
  };

  const cancelDeleteAccountant = () => {
    setConfirmDeleteOpen(false);
    setAccountantToDelete(null);
  };

  return (
    <div className="flex bg-background-50 min-h-screen">
      <AdminSidebar />

      <main className="flex-1 p-4 md:p-8 md:ml-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary-500 mb-2">Client & Accountant Management</h1>
              <p className="text-gray-600">Create accountants, assign them to clients, and verify KYC status.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Badge variant="primary">{clients.length} clients</Badge>
              <Badge variant="success">{accountants.length} accountants</Badge>
              <Badge variant="info">{freeAccountants.length} free accountants</Badge>
              <Badge variant="warning">{clients.filter((c) => c.kycStatus !== 'verified').length} KYC pending</Badge>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
          )}
          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{message}</div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8 mb-8">
            <Card>
              <h2 className="text-xl font-bold text-primary-500 mb-4">Create New Accountant</h2>
              <form className="space-y-4" onSubmit={handleCreateAccountant}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={newAccountant.firstName}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={newAccountant.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Email" name="email" value={newAccountant.email} onChange={handleInputChange} required />
                  <Input label="Phone" name="phone" value={newAccountant.phone} onChange={handleInputChange} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={newAccountant.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label="Specialization"
                    name="specialization"
                    value={newAccountant.specialization}
                    onChange={handleInputChange}
                    placeholder="GST, ITR, TDS, etc."
                  />
                </div>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Create Accountant'}
                </Button>
              </form>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-primary-500 mb-4">Assign Accountant</h2>
              <form className="space-y-4" onSubmit={handleAssignAccountant}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Client</label>
                    <select
                      name="clientId"
                      value={assignmentData.clientId}
                      onChange={handleAssignmentChange}
                      className="input-field w-full"
                      required
                    >
                      <option value="">Select client</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.businessName || `${client.firstName} ${client.lastName}`} ({client.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Accountant</label>
                    <select
                      name="accountantId"
                      value={assignmentData.accountantId}
                      onChange={handleAssignmentChange}
                      className="input-field w-full"
                      required
                    >
                      <option value="">Select accountant</option>
                      {accountants.map((accountant) => (
                        <option key={accountant._id} value={accountant._id}>
                          {accountant.firstName} {accountant.lastName} ({accountant.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Service Type</label>
                    <select
                      name="serviceType"
                      value={assignmentData.serviceType}
                      onChange={handleAssignmentChange}
                      className="input-field w-full"
                    >
                      <option value="full_support">Full Support</option>
                      <option value="gst_filing">GST Filing</option>
                      <option value="itr_filing">ITR Filing</option>
                      <option value="tds_filing">TDS Filing</option>
                      <option value="compliance">Compliance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={assignmentData.deadline}
                      onChange={handleAssignmentChange}
                      className="input-field w-full"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-primary-500 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={assignmentData.notes}
                    onChange={handleAssignmentChange}
                    className="input-field w-full min-h-[120px]"
                    placeholder="Optional guidance for the accountant"
                  />
                </div>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Assigning...' : 'Assign Accountant'}
                </Button>
              </form>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
            <Card>
              <h2 className="text-xl font-bold text-primary-500 mb-4">Free Accountants</h2>
              <p className="text-gray-600 mb-4">Accountants who are not currently assigned to an active case.</p>
              {freeAccountants.length > 0 ? (
                <ul className="space-y-3">
                  {freeAccountants.slice(0, 4).map((accountant) => (
                    <li key={accountant._id} className="rounded-lg border border-gray-100 p-3 bg-white">
                      <p className="font-semibold text-primary-500">{accountant.firstName} {accountant.lastName}</p>
                      <p className="text-sm text-gray-600">{accountant.email}</p>
                      <p className="text-xs text-gray-500">{accountant.specialization || 'General Tax Support'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No accountants are currently free. Consider deassigning or reassigning workload.</p>
              )}
            </Card>

            <Card className="xl:col-span-2">
              <h2 className="text-xl font-bold text-primary-500 mb-4">Active Assignments Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-background-100 p-4 border border-gray-100">
                  <p className="text-sm text-gray-600">Active Assignments</p>
                  <p className="text-3xl font-bold text-primary-500">{activeAssignments.length}</p>
                </div>
                <div className="rounded-lg bg-background-100 p-4 border border-gray-100">
                  <p className="text-sm text-gray-600">Assigned Accountants</p>
                  <p className="text-3xl font-bold text-primary-500">{assignedAccountantIds.length}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary-500">Accountants</h2>
                <p className="text-gray-600">View all active accountants and delete any inactive or redundant accounts.</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-600 py-12">Loading accountants...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Accountant</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Email</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Phone</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Specialization</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accountants.map((accountant) => (
                      <tr key={accountant._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-primary-500">{accountant.firstName} {accountant.lastName}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{accountant.email}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{accountant.phone}</td>
                        <td className="py-4 px-4 text-sm text-gray-700">{accountant.specialization || 'General'}</td>
                        <td className="py-4 px-4">
                          <Badge variant="success">Active</Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteAccountant(accountant._id, `${accountant.firstName} ${accountant.lastName}`)}
                            disabled={saving}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary-500">Clients</h2>
                <p className="text-gray-600">Search clients, review KYC status, and assign accountants.</p>
              </div>
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search clients by name, email or business..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-11 w-full"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center text-gray-600 py-12">Loading clients...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Client</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Contact</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">KYC Status</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Documents</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Assigned Accountant</th>
                      <th className="text-left py-4 px-4 font-semibold text-primary-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client) => {
                      const documentCount = Object.values(client.kycDocuments || {}).filter(Boolean).length;
                      const clientAssignments = clientAssignmentMap[client._id] || [];
                      const latestAssignment = clientAssignments.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))[0];

                      return (
                        <tr key={client._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-semibold text-primary-500">{client.businessName || `${client.firstName} ${client.lastName}`}</div>
                            <div className="text-sm text-gray-600">{client.email}</div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-700">
                            <div className="flex items-center gap-2 mb-1"><Mail size={14} className="text-gray-400" />{client.email}</div>
                            <div className="flex items-center gap-2"><Phone size={14} className="text-gray-400" />{client.phone}</div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={client.kycStatus === 'verified' ? 'success' : client.kycStatus === 'rejected' ? 'danger' : 'warning'}>
                              {client.kycStatus.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <ClipboardList size={16} className="text-primary-500" />
                              {documentCount} document{documentCount === 1 ? '' : 's'}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-700">
                            {latestAssignment ? (
                              <div>
                                <span className="font-semibold text-primary-500">
                                  {latestAssignment.accountantId?.firstName || 'N/A'} {latestAssignment.accountantId?.lastName || ''}
                                </span>
                                <div className="text-xs text-gray-500">{latestAssignment.serviceType.replace('_', ' ')}</div>
                              </div>
                            ) : (
                              <span className="text-gray-500">Not assigned</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleVerifyKYC(client._id)}
                                disabled={saving || client.kycStatus === 'verified'}
                              >
                                <CheckCircle size={16} />
                                Verify KYC
                              </Button>
                              {latestAssignment && latestAssignment.status !== 'cancelled' && (
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeassignAssignment(latestAssignment._id)}
                                  disabled={saving}
                                >
                                  Deassign
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {confirmDeleteOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
              <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
                <h3 className="text-2xl font-semibold text-primary-500 mb-3">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">{accountantToDelete?.name}</span>?
                  This will deactivate their account and remove access.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button variant="secondary" onClick={cancelDeleteAccountant} disabled={saving}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={confirmDeleteAccountant} disabled={saving}>
                    {saving ? 'Deleting...' : 'Delete Accountant'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientManagement;
