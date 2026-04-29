const express = require('express');
const {
  getChats,
  getChat,
  createOrGetChat,
  sendMessage,
  markAsRead,
  getUnreadCount,
} = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/multer');

const router = express.Router();

// @route   GET /api/chats
// @desc    Get chat conversations
// @access  Private
router.get('/', authenticate, getChats);

// @route   GET /api/chats/:chatId
// @desc    Get single chat conversation
// @access  Private
router.get('/:chatId', authenticate, getChat);

// @route   POST /api/chats
// @desc    Create or get chat for assignment
// @access  Private
router.post('/', authenticate, createOrGetChat);

// @route   POST /api/chats/:chatId/messages
// @desc    Send message in chat
// @access  Private
router.post('/:chatId/messages', authenticate, upload.single('attachment'), sendMessage);

// @route   PUT /api/chats/:chatId/read
// @desc    Mark messages as read
// @access  Private
router.put('/:chatId/read', authenticate, markAsRead);

// @route   GET /api/chats/unread-count
// @desc    Get unread message count
// @access  Private
router.get('/unread/count', authenticate, getUnreadCount);

// Debug test route
router.get('/test', (req, res) => {
  res.send('Chat routes working');
});

module.exports = router;
