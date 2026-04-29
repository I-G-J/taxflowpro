// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  // Attach token if it exists
  const token = localStorage.getItem('authToken');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  if (mergedOptions.body instanceof FormData) {
    delete mergedOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, mergedOptions);

    // Handle 401 - unauthorized (token expired)
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// AUTH ENDPOINTS
export const authAPI = {
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (email, password) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),

  changePassword: (currentPassword, newPassword, confirmPassword) =>
    apiCall('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    }),

  forgotPassword: (email) => apiCall('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
};

// USER ENDPOINTS
export const userAPI = {
  getProfile: () => apiCall('/users/profile'),

  updateProfile: (userData) => apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  updateKYC: (formData) => apiCall('/users/kyc', {
    method: 'PUT',
    body: formData,
    headers: {
      // Don't set Content-Type, let browser set it for multipart/form-data
    },
  }),

  getDashboard: () => apiCall('/users/dashboard'),

  getAllUsers: (page = 1, limit = 10, role) => {
    const roleParam = role ? `&role=${encodeURIComponent(role)}` : '';
    return apiCall(`/users?page=${page}&limit=${limit}${roleParam}`);
  },

  createUser: (userData) => apiCall('/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  updateUser: (userId, userData) => apiCall(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),

  verifyKYC: (userId, status) => apiCall(`/users/${userId}/kyc-status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  deleteUser: (userId) => apiCall(`/users/${userId}`, {
    method: 'DELETE',
  }),

  getAccountants: () => apiCall('/users/accountants/list'),
};

// DOCUMENT ENDPOINTS
export const documentAPI = {
  upload: (formData) => apiCall('/documents', {
    method: 'POST',
    body: formData,
    headers: {},
  }),

  getDocuments: (page = 1, limit = 10, category) => {
    const categoryParam = category ? `&category=${encodeURIComponent(category)}` : '';
    return apiCall(`/documents?page=${page}&limit=${limit}${categoryParam}`);
  },

  getDocument: (documentId) => apiCall(`/documents/${documentId}`),

  downloadDocument: (documentId) => ({
    url: `${API_BASE_URL}/documents/${documentId}/download`,
  }),

  updateStatus: (documentId, status, reviewNotes) =>
    apiCall(`/documents/${documentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewNotes }),
    }),

  deleteDocument: (documentId) => apiCall(`/documents/${documentId}`, {
    method: 'DELETE',
  }),
};

// FILING ENDPOINTS
export const filingAPI = {
  create: (filingData) => apiCall('/filings', {
    method: 'POST',
    body: JSON.stringify(filingData),
  }),

  getFilings: (status, filingType, page = 1, limit = 10) =>
    apiCall(
      `/filings?status=${status || ''}&filingType=${filingType || ''}&page=${page}&limit=${limit}`
    ),

  updateStatus: (filingId, status, rejectionReason, acknowledgementNumber, acknowledgementUrl) =>
    apiCall(`/filings/${filingId}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        rejectionReason,
        acknowledgementNumber,
        acknowledgementUrl,
      }),
    }),

  uploadDocuments: (filingId, formData) =>
    apiCall(`/filings/${filingId}/documents`, {
      method: 'POST',
      body: formData,
      headers: {},
    }),
};

// ASSIGNMENT ENDPOINTS
export const assignmentAPI = {
  create: (assignmentData) => apiCall('/assignments', {
    method: 'POST',
    body: JSON.stringify(assignmentData),
  }),

  getAssignments: (status, page = 1, limit = 10) =>
    apiCall(`/assignments?status=${status || ''}&page=${page}&limit=${limit}`),

  updateStatus: (assignmentId, status, progressNotes, completionDate) =>
    apiCall(`/assignments/${assignmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, progressNotes, completionDate }),
    }),

  reassign: (assignmentId, newAccountantId, reason) =>
    apiCall(`/assignments/${assignmentId}/reassign`, {
      method: 'PUT',
      body: JSON.stringify({ newAccountantId, reason }),
    }),

  deassign: (assignmentId, reason) =>
    apiCall(`/assignments/${assignmentId}/deassign`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  getStats: () => apiCall('/assignments/stats/overview'),
};

// SETTINGS ENDPOINTS
export const settingsAPI = {
  getDashboardSettings: () => apiCall('/settings/dashboard'),
  updateDashboardSettings: (settings) => apiCall('/settings/dashboard', {
    method: 'PUT',
    body: JSON.stringify({ value: settings }),
  }),
};

// INVOICE ENDPOINTS
export const invoiceAPI = {
  create: (invoiceData) => apiCall('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  }),

  getInvoices: (status, page = 1, limit = 10) =>
    apiCall(`/invoices?status=${status || ''}&page=${page}&limit=${limit}`),

  updatePaymentStatus: (invoiceId, status, paymentMethod, transactionId, paymentDate) =>
    apiCall(`/invoices/${invoiceId}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ status, paymentMethod, transactionId, paymentDate }),
    }),

  generatePDF: (invoiceId) => apiCall(`/invoices/${invoiceId}/pdf`),

  getStats: () => apiCall('/invoices/stats/overview'),
};

// REMINDER ENDPOINTS
export const reminderAPI = {
  create: (reminderData) => apiCall('/reminders', {
    method: 'POST',
    body: JSON.stringify(reminderData),
  }),

  getReminders: (status, reminderType, page = 1, limit = 10) =>
    apiCall(
      `/reminders?status=${status || ''}&reminderType=${reminderType || ''}&page=${page}&limit=${limit}`
    ),

  updateStatus: (reminderId, status, sentAt, deliveryStatus) =>
    apiCall(`/reminders/${reminderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, sentAt, deliveryStatus }),
    }),

  createAuto: (entityType, entityId, reminderDays) =>
    apiCall('/reminders/auto', {
      method: 'POST',
      body: JSON.stringify({ entityType, entityId, reminderDays }),
    }),

  sendPending: () => apiCall('/reminders/send-pending', {
    method: 'POST',
  }),
};

// CHAT ENDPOINTS
export const chatAPI = {
  getChats: (assignmentId, page = 1, limit = 20) =>
    apiCall(
      `/chats?${assignmentId ? `assignmentId=${assignmentId}&` : ''}page=${page}&limit=${limit}`
    ),

  getChat: (chatId) => apiCall(`/chats/${chatId}`),

  createOrGetChat: (assignmentId, message) => {
    const body = { assignmentId };
    if (message && message.trim()) {
      body.message = message;
    }
    // Always include subject for chat creation
    body.subject = 'Assignment Discussion'; // Default subject, can be customized later
    return apiCall('/chats', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  sendMessage: (chatId, message, messageType = 'text', formData = null) => {
    if (formData) {
      // For file uploads
      return apiCall(`/chats/${chatId}/messages`, {
        method: 'POST',
        body: formData,
        headers: {},
      });
    }
    return apiCall(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, messageType }),
    });
  },

  markAsRead: (chatId) => apiCall(`/chats/${chatId}/read`, {
    method: 'PUT',
  }),

  getUnreadCount: () => apiCall('/chats/unread/count'),
};

export default {
  apiCall,
  authAPI,
  userAPI,
  documentAPI,
  filingAPI,
  assignmentAPI,
  invoiceAPI,
  reminderAPI,
  chatAPI,
};
