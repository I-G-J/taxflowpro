// User Roles
const ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
};

// Business Types
const BUSINESS_TYPES = [
  'sole_proprietor',
  'partnership',
  'pvt_ltd',
  'llp',
  'ngo',
  'other',
];

// Document Categories
const DOCUMENT_CATEGORIES = [
  'gst_registration',
  'gst_return',
  'itr',
  'tds',
  'purchase_register',
  'sales_register',
  'bank_statement',
  'invoice',
  'other',
];

// Document Status
const DOCUMENT_STATUS = ['uploaded', 'under_review', 'approved', 'rejected'];

// Filing Types
const FILING_TYPES = ['gstr1', 'gstr3b', 'gstr2b', 'itr', 'tds', 'tcs', 'other'];

// Filing Status
const FILING_STATUS = [
  'draft',
  'pending',
  'under_review',
  'submitted',
  'acknowledged',
  'rejected',
  'amended',
];

// Assignment Status
const ASSIGNMENT_STATUS = ['assigned', 'in_progress', 'completed', 'cancelled'];

// Service Types
const SERVICE_TYPES = [
  'gst_filing',
  'itr_filing',
  'tds_filing',
  'compliance',
  'full_support',
];

// Payment Status
const PAYMENT_STATUS = ['unpaid', 'partial', 'paid', 'overdue', 'cancelled'];

// KYC Status
const KYC_STATUS = ['not_started', 'in_progress', 'verified', 'rejected'];

// Reminder Types
const REMINDER_TYPES = [
  'gst_filing',
  'itr_filing',
  'tds_filing',
  'invoice_due',
  'kyc_pending',
  'document_review',
  'custom',
];

// Chat Status
const CHAT_STATUS = ['active', 'resolved', 'on_hold', 'closed'];

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized. Please login first.',
  FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'Email already registered.',
  VALIDATION_ERROR: 'Validation error.',
  INTERNAL_ERROR: 'Internal server error.',
  INVALID_ID: 'Invalid ID format.',
};

// Success Messages
const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully.',
  LOGIN_SUCCESS: 'Logged in successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  DOCUMENT_UPLOADED: 'Document uploaded successfully.',
  ASSIGNMENT_CREATED: 'Assignment created successfully.',
  FILING_CREATED: 'Filing created successfully.',
  INVOICE_CREATED: 'Invoice created successfully.',
  REMINDER_CREATED: 'Reminder created successfully.',
  CHAT_MESSAGE_SENT: 'Message sent successfully.',
};

module.exports = {
  ROLES,
  BUSINESS_TYPES,
  DOCUMENT_CATEGORIES,
  DOCUMENT_STATUS,
  FILING_TYPES,
  FILING_STATUS,
  ASSIGNMENT_STATUS,
  SERVICE_TYPES,
  PAYMENT_STATUS,
  KYC_STATUS,
  REMINDER_TYPES,
  CHAT_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
