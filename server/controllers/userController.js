
import userModel from "../models/userModel.js";

// 📄 Get User Data Controller
export const getUserData = async (req, res) => {
    try 
    {
        // 📨 Step 1: Extract userId from authenticated user info in req.user
        const userId = req.userId;

        // 🔍 Step 2: Search for user in database by ID
        const user = await userModel.findById(userId);

        if (!user)
        {
            // ❌ Step 3: If user not found, return error response
            return res.json({ success: false, message: "User not found" });
        }

        // ✅ Step 4: Return success response with selected user data
        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
                role: user.role,
                phone: user.phone,
                hospital: user.hospital,
                bloodGroup: user.bloodGroup,
                location: user.location
            }
        });
    } 
    catch (error)
    {
        // ❌ Step 5: Handle and return server error
        res.json({ success: false, message: error.message });
    }
};

// Update user profile fields (patient/donor common)
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const allowed = ['name', 'phone', 'hospital', 'bloodGroup', 'location'];
        const updates = {};
        for (const key of allowed) {
            if (typeof req.body[key] !== 'undefined') {
                updates[key] = req.body[key];
            }
        }

        const user = await userModel.findByIdAndUpdate(userId, updates, { new: true });
        if (!user) return res.json({ success: false, message: 'User not found' });

        return res.json({ success: true, userData: {
            name: user.name,
            isAccountVerified: user.isAccountVerified,
            role: user.role,
            phone: user.phone,
            hospital: user.hospital,
            bloodGroup: user.bloodGroup,
            location: user.location
        }});
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Get user details by ID (for chat functionality)
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await userModel.findById(userId).select('-password -resetOtp -resetOtpExpiry');
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        return res.json({ success: true, user });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
