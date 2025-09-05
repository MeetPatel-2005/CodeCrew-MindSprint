
import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { getUserData, updateUserProfile } from '../controllers/userController.js';

const userRouter = express.Router();

// Step 1️⃣: Define route to get user data
// 📌 Route: GET /api/user/data
// 🔐 Protected route — requires valid authentication token
// 🛡️ Returns user's basic information (name, verification status)
userRouter.get('/data', userAuth, getUserData);
// Update profile
userRouter.put('/profile', userAuth, updateUserProfile);

export default userRouter;
