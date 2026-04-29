// Standardized response handler
const sendResponse = (res, statusCode, success, message, data = null, error = null) => {
  const response = {
    success,
    message,
  };

  if (data) {
    response.data = data;
  }

  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }

  return res.status(statusCode).json(response);
};

const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return sendResponse(res, statusCode, true, message, data);
};

const errorResponse = (res, statusCode = 400, message = 'Error', error = null) => {
  return sendResponse(res, statusCode, false, message, null, error);
};

module.exports = {
  sendResponse,
  successResponse,
  errorResponse,
};
