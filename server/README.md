# TaxFlow Pro Backend API

A comprehensive backend API for TaxFlow Pro, a GST compliance platform built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (Client, Accountant, Admin)
- **Document Management**: Secure file upload and management for tax documents
- **Filing Management**: Complete GST/ITR/TDS filing lifecycle management
- **Assignment System**: Admin assignment of accountants to clients with progress tracking
- **Invoice & Billing**: Automated invoicing with GST calculations and payment tracking
- **Reminder System**: Automated deadline notifications via email and SMS
- **Real-time Chat**: Communication system between clients and assigned accountants
- **KYC Management**: Know Your Customer verification and document storage

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing, Helmet for security headers
- **File Upload**: Multer with validation
- **CORS**: Configurable cross-origin resource sharing

## Project Structure

```
server/
├── config/
│   └── db.js                 # Database connection
├── controllers/              # Business logic controllers
│   ├── authController.js
│   ├── userController.js
│   ├── documentController.js
│   ├── filingController.js
│   ├── assignmentController.js
│   ├── invoiceController.js
│   ├── reminderController.js
│   └── chatController.js
├── middleware/               # Custom middleware
│   ├── auth.js              # JWT authentication & authorization
│   ├── errorHandler.js      # Global error handling
│   └── multer.js            # File upload configuration
├── models/                  # MongoDB schemas
│   ├── User.js
│   ├── Document.js
│   ├── Assignment.js
│   ├── Filing.js
│   ├── Invoice.js
│   ├── Reminder.js
│   └── Chat.js
├── routes/                  # API route definitions
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── documentRoutes.js
│   ├── fillingRoutes.js
│   ├── assignmentRoutes.js
│   ├── invoiceRoutes.js
│   ├── reminderRoutes.js
│   └── chatRoutes.js
├── utils/                   # Utility functions
│   ├── constants.js         # Application constants
│   ├── jwt.js              # JWT utilities
│   └── responseHandler.js  # Standardized API responses
├── uploads/                # File upload directory
├── .env                    # Environment variables
├── package.json
├── server.js               # Application entry point
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taxflow-pro/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/taxflow_pro
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:3000

   # File Upload Configuration
   MAX_FILE_SIZE=5242880
   ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document

   # Email Configuration (for reminders)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # SMS Configuration (for reminders)
   SMS_API_KEY=your_sms_api_key
   SMS_API_SECRET=your_sms_api_secret
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/kyc` - Update KYC information
- `GET /api/users/dashboard` - Get dashboard statistics

### Documents
- `POST /api/documents` - Upload document
- `GET /api/documents` - Get documents
- `GET /api/documents/:id/download` - Download document
- `PUT /api/documents/:id/status` - Update document status

### Filings
- `POST /api/filings` - Create filing
- `GET /api/filings` - Get filings
- `PUT /api/filings/:id/status` - Update filing status
- `POST /api/filings/:id/documents` - Upload filing documents

### Assignments
- `POST /api/assignments` - Create assignment (Admin)
- `GET /api/assignments` - Get assignments
- `PUT /api/assignments/:id/status` - Update assignment status
- `PUT /api/assignments/:id/reassign` - Reassign accountant (Admin)

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - Get invoices
- `PUT /api/invoices/:id/payment` - Update payment status
- `GET /api/invoices/:id/pdf` - Generate invoice PDF

### Reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders` - Get reminders
- `PUT /api/reminders/:id/status` - Update reminder status
- `POST /api/reminders/auto` - Create automatic reminders

### Chat
- `GET /api/chats` - Get chat conversations
- `POST /api/chats` - Create/get chat for assignment
- `POST /api/chats/:id/messages` - Send message
- `PUT /api/chats/:id/read` - Mark messages as read
- `GET /api/chats/unread/count` - Get unread message count

## User Roles & Permissions

### Client
- Register and manage profile
- Upload documents
- View assigned work and progress
- Receive invoices and make payments
- Chat with assigned accountant
- Receive reminders and notifications

### Accountant
- View assigned clients and work
- Review and approve documents
- Create and manage filings
- Generate invoices
- Send reminders to clients
- Communicate via chat

### Admin
- Full system access
- Create and manage users (accountants/admins)
- Assign accountants to clients
- View all system data and statistics
- Manage system-wide settings

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Role-Based Access Control**: Granular permissions per user role
- **File Upload Security**: Type and size validation, secure storage
- **CORS Protection**: Configurable cross-origin policies
- **Helmet Security Headers**: Protection against common vulnerabilities
- **Input Validation**: Comprehensive validation on all endpoints

## Business Workflow

1. **Client Registration**: Public registration for clients
2. **Admin Setup**: Admin creates accountant accounts
3. **Document Upload**: Clients upload tax documents
4. **Assignment**: Admin assigns accountants to clients
5. **Review Process**: Accountants review documents and create filings
6. **Filing Management**: Track filing status and acknowledgements
7. **Invoicing**: Generate invoices with GST calculations
8. **Payment Processing**: Track payment status
9. **Communication**: Real-time chat between clients and accountants
10. **Reminders**: Automated deadline notifications

## Development

### Code Style
- Consistent error handling with custom middleware
- Standardized API response format
- Comprehensive input validation
- Professional code organization and naming

### Testing
```bash
npm test
```

### Deployment
1. Set `NODE_ENV=production` in environment
2. Configure production MongoDB URI
3. Set up proper CORS origins
4. Configure email and SMS services for reminders
5. Use process manager like PM2 for production

## Contributing

1. Follow the established code structure
2. Implement proper error handling
3. Add comprehensive validation
4. Update documentation for new features
5. Test thoroughly before committing

## License

ISC