import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../components/UI';
import ClientSidebar from '../components/ClientSidebar';
import { Edit, Check, AlertCircle, Shield } from 'lucide-react';
import { userAPI } from '../services/api';

const ProfileKYC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    businessType: '',
    state: '',
    city: '',
    pincode: '',
    gstin: '',
    pan: '',
    aadharNumber: '',
  });
  const [documents, setDocuments] = useState({
    aadharDocument: null,
    panDocument: null,
    gstinDocument: null,
    bankDocument: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [kycStatus, setKycStatus] = useState({
    fullName: 'Pending',
    email: 'Pending',
    pan: 'Pending',
    gstin: 'Pending',
    bankAccount: 'Pending',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const normalizeKycState = (user) => ({
    fullName: user.firstName && user.lastName ? 'Verified' : 'Pending',
    email: user.email ? 'Verified' : 'Pending',
    pan: user.pan ? 'Verified' : 'Pending',
    gstin: user.gstin ? 'Verified' : 'Pending',
    bankAccount: user.kycDocuments?.bankProof ? 'Verified' : 'Pending',
  });

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userAPI.getProfile();
      const user = response.data;
      setProfile(user);
      setFormData({
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.phone || '',
        businessName: user.businessName || '',
        businessType: user.businessType || '',
        state: user.state || '',
        city: user.city || '',
        pincode: user.pincode || '',
        gstin: user.gstin || '',
        pan: user.pan || '',
        aadharNumber: user.kycDocuments?.aadhar || '',
      });
      setKycStatus(normalizeKycState(user));
    } catch (err) {
      setError(err.message || 'Unable to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentChange = (e) => {
    const { name, files } = e.target;
    setDocuments((prev) => ({ ...prev, [name]: files[0] || null }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      const [firstName, ...lastNameParts] = formData.fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || 'User';
      const updatedProfile = {
        firstName,
        lastName,
        phone: formData.phone,
        businessName: formData.businessName,
        businessType: formData.businessType,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        gstin: formData.gstin,
        pan: formData.pan,
      };

      const response = await userAPI.updateProfile(updatedProfile);
      setProfile(response.data);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKYCSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      const payload = new FormData();
      if (formData.gstin) payload.append('gstin', formData.gstin);
      if (formData.pan) payload.append('pan', formData.pan);
      if (formData.aadharNumber) payload.append('aadhar', formData.aadharNumber);
      if (documents.aadharDocument) payload.append('aadharDocument', documents.aadharDocument);
      if (documents.panDocument) payload.append('panDocument', documents.panDocument);
      if (documents.gstinDocument) payload.append('gstinDocument', documents.gstinDocument);
      if (documents.bankDocument) payload.append('bankDocument', documents.bankDocument);

      const response = await userAPI.updateKYC(payload);
      setProfile(response.data);
      setKycStatus(normalizeKycState(response.data));
      setSuccess('KYC information submitted successfully.');
      setDocuments({ aadharDocument: null, panDocument: null, gstinDocument: null, bankDocument: null });
    } catch (err) {
      setError(err.message || 'Failed to submit KYC');
    } finally {
      setIsSaving(false);
    }
  };

  const completeCount = Object.values(kycStatus).filter((status) => status === 'Verified').length;
  const completion = Math.round((completeCount / Object.keys(kycStatus).length) * 100);
  const formattedFullName = profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : 'N/A';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="flex bg-background-50 min-h-screen">
      <ClientSidebar />
      
      <main className="flex-1 p-4 md:p-8 md:ml-0 mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">Profile & KYC</h1>
          <p className="text-gray-600 mb-8">Manage your account information and KYC status</p>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
              {success}
            </div>
          )}

          {/* KYC Status Overview */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-primary-500 mb-2">KYC Status</h2>
                <p className="text-gray-600">Complete your KYC for enhanced account features</p>
              </div>
              <Badge variant={completion === 100 ? 'success' : 'warning'}>{completion}% Complete</Badge>
            </div>

            <div className="space-y-4">
              {Object.entries(kycStatus).map(([field, status]) => (
                <div key={field} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary-500 capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div className={`h-2 rounded-full ${status === 'Verified' ? 'w-full bg-success' : 'w-1/2 bg-warning'}`} />
                    </div>
                    <Badge variant={status === 'Verified' ? 'success' : 'warning'}>
                      {status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile Form */}
            <Card className="lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-primary-500">Personal Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 text-accent-500 hover:text-accent-600 font-semibold"
                >
                  <Edit size={18} />
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              <div className="space-y-6">
                {/* Name & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{formattedFullName || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profile?.email || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* Phone & Business */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profile?.phone || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Business Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profile?.businessName || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* GSTIN & PAN */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-primary-500 mb-2 flex items-center gap-2">
                      GSTIN <Badge variant={profile?.gstin ? 'success' : 'warning'}>{profile?.gstin ? 'Verified' : 'Pending'}</Badge>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter GSTIN"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg font-mono">{profile?.gstin || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-primary-500 mb-2 flex items-center gap-2">
                      PAN <Badge variant={profile?.pan ? 'success' : 'warning'}>{profile?.pan ? 'Verified' : 'Pending'}</Badge>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="pan"
                        value={formData.pan}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter PAN"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg font-mono">{profile?.pan || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {/* Business Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Business Type</label>
                    {isEditing ? (
                      <select name="businessType" value={formData.businessType} onChange={handleChange} className="input-field">
                        <option value="">Select business type</option>
                        <option value="sole_proprietor">Sole Proprietorship</option>
                        <option value="partnership">Partnership</option>
                        <option value="pvt_ltd">Private Limited Company</option>
                        <option value="llp">LLP</option>
                        <option value="ngo">NGO</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profile?.businessType || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">State</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{profile?.state || 'N/A'}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button variant="primary" onClick={handleSave} className="flex-1">
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <Badge variant={completion === 100 ? 'success' : 'warning'} className="mb-3">
                      {completion === 100 ? 'KYC Complete' : 'KYC Pending'}
                    </Badge>
                    <h3 className="font-bold text-lg text-primary-500">Submit Documents</h3>
                  </div>
                  <span className="text-sm text-gray-600">{completion}% complete</span>
                </div>

                <form onSubmit={handleKYCSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Aadhar Document</label>
                    <input
                      type="file"
                      name="aadharDocument"
                      accept=".pdf,image/*"
                      onChange={handleDocumentChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">PAN Document</label>
                    <input
                      type="file"
                      name="panDocument"
                      accept=".pdf,image/*"
                      onChange={handleDocumentChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">GSTIN Document</label>
                    <input
                      type="file"
                      name="gstinDocument"
                      accept=".pdf,image/*"
                      onChange={handleDocumentChange}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-500 mb-2">Bank Proof</label>
                    <input
                      type="file"
                      name="bankDocument"
                      accept=".pdf,image/*"
                      onChange={handleDocumentChange}
                      className="input-field"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full" disabled={isSaving}>
                    {isSaving ? 'Submitting...' : 'Submit KYC'}
                  </Button>
                </form>
              </Card>

              <Card>
                <Badge variant={completion === 100 ? 'success' : 'warning'} className="mb-4">
                  {completion === 100 ? 'Ready' : 'Action Required'}
                </Badge>
                <h3 className="font-bold text-lg text-primary-500 mb-4">Verification Summary</h3>
                <div className="space-y-3 text-sm">
                  {Object.entries(kycStatus).map(([field, status]) => (
                    <div key={field} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                      <span className="capitalize text-gray-700">{field.replace(/([A-Z])/g, ' $1')}</span>
                      <Badge variant={status === 'Verified' ? 'success' : 'warning'}>{status}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileKYC;
