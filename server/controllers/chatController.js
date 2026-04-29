const Chat = require('../models/Chat');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, ROLES } = require('../utils/constants');

// @desc    Get chat conversations
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res, next) => {
  try {
    const { assignmentId, page = 1, limit = 20 } = req.query;

    let query = {};

    if (req.userRole === ROLES.CLIENT) {
      query.clientId = req.userId;
    } else if (req.userRole === ROLES.ACCOUNTANT) {
      query.accountantId = req.userId;
    } else if (req.userRole === 'admin') {
      // Admin can see all
    }

    if (assignmentId) query.assignmentId = assignmentId;

    const chats = await Chat.find(query)
      .populate('clientId', 'firstName lastName email')
      .populate('accountantId', 'firstName lastName email')
      .populate('assignmentId', 'serviceType status')
      .populate('messages.senderId', 'firstName lastName role')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ updatedAt: -1 });

    const total = await Chat.countDocuments(query);

    return successResponse(res, 200, 'Chats fetched successfully', {
      chats,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get chats error:', error);
    return errorResponse(res, 500, error.message || 'Failed to fetch chats');
  }
};

// @desc    Get single chat conversation
// @route   GET /api/chats/:chatId
// @access  Private
const getChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId)
      .populate('clientId', 'firstName lastName email')
      .populate('accountantId', 'firstName lastName email')
      .populate('assignmentId', 'serviceType status deadline')
      .populate('messages.senderId', 'firstName lastName role');

    if (!chat) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (req.userRole === ROLES.CLIENT && chat.clientId?._id?.toString() !== req.userId?.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.userRole === ROLES.ACCOUNTANT && chat.accountantId?._id?.toString() !== req.userId?.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    return successResponse(res, 200, 'Chat fetched successfully', chat);
  } catch (error) {
    console.error('Get chat error:', error);
    return errorResponse(res, 500, error.message || 'Failed to fetch chat');
  }
};

// @desc    Create or get chat for assignment
// @route   POST /api/chats
// @access  Private
const createOrGetChat = async (req, res, next) => {
  try {
    const { assignmentId, message, subject } = req.body;

    if (!assignmentId) {
      return errorResponse(res, 400, 'Assignment ID is required');
    }

    // Verify assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return errorResponse(res, 400, 'Invalid assignment ID');
    }

    // Check if user is part of this assignment
    if (req.userRole === ROLES.CLIENT && assignment.clientId?.toString() !== req.userId?.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.userRole === ROLES.ACCOUNTANT && assignment.accountantId?.toString() !== req.userId?.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({ assignmentId });

    if (!chat) {
      chat = new Chat({
        clientId: assignment.clientId,
        accountantId: assignment.accountantId,
        assignmentId,
        subject: subject || 'Assignment Discussion', // Use provided subject or default
      });
    }

    // Add message if provided
    if (message) {
      chat.messages.push({
        senderId: req.userId,
        message,
        messageType: 'text',
        timestamp: new Date(),
      });
    }

    await chat.save();

    return successResponse(res, 200, chat.messages.length > 0 ? 'Message sent successfully' : 'Chat created successfully', chat);
  } catch (error) {
    console.error('Chat creation error:', error);
    return errorResponse(res, 500, error.message || 'Failed to create or get chat');
  }
};

// @desc    Send message in chat
// @route   POST /api/chats/:chatId/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { message, messageType = 'text' } = req.body;

    if (!message) {
      return errorResponse(res, 400, 'Message is required');
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (req.userRole === ROLES.CLIENT && chat.clientId?.toString() !== req.userId?.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.userRole === ROLES.ACCOUNTANT && chat.accountantId?.toString() !== req.userId?.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    const newMessage = {
      senderId: req.userId,
      message,
      messageType,
      timestamp: new Date(),
    };

    // Handle file attachments
    if (req.file && messageType === 'file') {
      newMessage.attachment = {
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      };
    }

    chat.messages.push(newMessage);
    chat.lastMessage = message;
    chat.lastMessageTime = new Date();

    await chat.save();

    // Populate the new message for response
    await chat.populate('messages.senderId', 'firstName lastName role');

    const sentMessage = chat.messages[chat.messages.length - 1];

    return successResponse(res, 200, 'Message sent successfully', sentMessage);
  } catch (error) {
    console.error('Send message error:', error);
    return errorResponse(res, 500, error.message || 'Failed to send message');
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chats/:chatId/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return errorResponse(res, 404, ERROR_MESSAGES.NOT_FOUND);
    }

    // Check authorization
    if (req.userRole === ROLES.CLIENT && chat.clientId?.toString() !== req.userId?.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    if (req.userRole === ROLES.ACCOUNTANT && chat.accountantId?.toString() !== req.userId?.toString()) {
      return errorResponse(res, 403, ERROR_MESSAGES.FORBIDDEN);
    }

    // Mark messages from the other user as read
    const otherUserId = req.userRole === 'client' ? chat.accountantId : chat.clientId;

    chat.messages.forEach(msg => {
      if (msg.senderId.toString() === otherUserId.toString() && !msg.isRead) {
        msg.isRead = true;
        msg.readAt = new Date();
      }
    });

    await chat.save();

    return successResponse(res, 200, 'Messages marked as read');
  } catch (error) {
    console.error('Mark as read error:', error);
    return errorResponse(res, 500, error.message || 'Failed to mark messages as read');
  }
};

// @desc    Get unread message count
// @route   GET /api/chats/unread-count
// @access  Private
const getUnreadCount = async (req, res, next) => {
  try {
    let query = {};

    if (req.userRole === ROLES.CLIENT) {
      query.clientId = req.userId;
    } else if (req.userRole === ROLES.ACCOUNTANT) {
      query.accountantId = req.userId;
    }

    const chats = await Chat.find(query);

    let totalUnread = 0;
    const unreadByChat = [];

    for (const chat of chats) {
      const otherUserId = req.userRole === 'client' ? chat.accountantId : chat.clientId;
      const unreadCount = chat.messages.filter(msg =>
        msg.senderId.toString() === otherUserId.toString() && !msg.isRead
      ).length;

      totalUnread += unreadCount;

      if (unreadCount > 0) {
        unreadByChat.push({
          chatId: chat._id,
          unreadCount,
        });
      }
    }

    return successResponse(res, 200, 'Unread count fetched successfully', {
      totalUnread,
      unreadByChat,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    return errorResponse(res, 500, error.message || 'Failed to get unread count');
  }
};

module.exports = {
  getChats,
  getChat,
  createOrGetChat,
  sendMessage,
  markAsRead,
  getUnreadCount,
};
