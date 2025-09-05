
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {             // ---> Name of User
        type: String,
        required: true
    },
    email: {            // ---> Email Address of User
        type: String,
        required: true,
        unique: true,
    },
    password: {         // ---> Password of Account to be created
        type: String,
        required: true
    },
    verifyOtp: {        // ---> OTP(One Time Password) for Email Verification
        type: String,
        default: ''
    },
    verifyOtpExpiredAt: {        // ---> OTP expiration period for verify OTP
        type: Number,
        default: 0
    },
    isAccountVerified: {         // ---> Account Verification Check
        type: Boolean,
        default: false
    },
    role: {               // ---> Role-based access control
        type: String,
        enum: ['donor', 'patient'],
        default: 'patient'
    },
    phone: {              // ---> Contact number (optional)
        type: String,
        default: ''
    },
    hospital: {           // ---> Patient's hospital or donor's preferred hospital (optional)
        type: String,
        default: ''
    },
    bloodGroup: {         // ---> Blood group for matching
        type: String,
        default: ''
    },
    lastDonationAt: {     // ---> Track donor's last donation date (epoch ms)
        type: Number,
        default: 0
    },
    location: {           // ---> Simple location text
        type: String,
        default: ''
    },
    resetOtp: {        // ---> OTP for reset password
        type: String,
        default: ''
    },
    resetOtpExpiredAt: {        // ---> OTP expiration period for reset OTP
        type: Number,
        default: 0
    },
});

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
// ---> First check that the userModel is available in the database or not if yes then use that userModel
//      Otherwise create new userModel.

export default userModel;