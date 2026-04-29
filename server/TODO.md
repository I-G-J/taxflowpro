# Fix Plan — TypeError: argument handler must be a function

## Issues Confirmed
1. **errorHandler.js**: Exports `module.exports = errorHandler` (default), but **server.js** destructures `const { errorHandler } = require(...)` → `undefined`
2. **userRoutes.js**: Imports `getAllUsers`, `createUser`, `updateUser`, `deleteUser`, `getAccountants` — but **userController.js** exports `listAllUsers`, `createStaffAccount`, `deactivateUser`, and is missing `updateUser` & `getAccountants` 
3. **documentRoutes.js**: Imports `getDocument`, `downloadDocument`, `updateDocumentStatus` — but **documentController.js** exports `getDocumentById`, `reviewDocument`, and is missing `downloadDocument`
4. **userController.js**: `getProfile` uses `req.params.userId` but route `/profile` has no `:userId` param
5. **fillingRoutes.js** inconsistent naming with controller/filing convention

## Fix Steps
- [x] 1. Fix `errorHandler.js` export to `{ errorHandler }`
- [x] 2. Fix `userController.js` (getProfile req.userId, add getAccountants & updateUser, export aliases)
- [x] 3. Fix `documentController.js` (add downloadDocument, export aliases)
- [x] 4. Fix `userRoutes.js` — add debug test route
- [x] 5. Fix `documentRoutes.js` — add debug test route
- [x] 6. Rename `fillingRoutes.js` → `filingRoutes.js`, update `server.js`
- [x] 7. Add test routes to all remaining route files
- [x] 8. Start server and verify no errors
- [x] 9. Fix `config/db.js` — remove deprecated `useNewUrlParser` / `useUnifiedTopology` options
