import userModel from "../models/userModel.js";
import bloodRequestModel from "../models/bloodRequestModel.js";

// Save donor profile details
export const saveDonorProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        
        if (!user || user.role !== 'donor') {
            return res.json({ success: false, message: 'Donor not found or not a donor' });
        }

        const {
            bloodGroup,
            phone,
            dateOfBirth,
            gender,
            address,
            emergencyContact,
            medicalInfo
        } = req.body;

        // Update user profile
        user.bloodGroup = bloodGroup;
        user.phone = phone;
        user.dateOfBirth = dateOfBirth;
        user.gender = gender;
        user.address = address;
        user.emergencyContact = emergencyContact;
        user.medicalInfo = medicalInfo;
        user.profileCompleted = true;

        await user.save();

        return res.json({
            success: true,
            message: 'Profile saved successfully'
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get donor profile for editing
export const getDonorProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        
        if (!user || user.role !== 'donor') {
            return res.json({ success: false, message: 'Donor not found or not a donor' });
        }

        return res.json({
            success: true,
            profile: {
                bloodGroup: user.bloodGroup,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                address: user.address,
                emergencyContact: user.emergencyContact,
                medicalInfo: user.medicalInfo,
                profileCompleted: user.profileCompleted
            }
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Dashboard data for donor: profile, quick stats, nearby requests, recent history
export const getDonorDashboard = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        if (!user || user.role !== 'donor') {
            return res.json({ success: false, message: 'Donor not found or not a donor' });
        }

        // Check if profile is completed
        if (!user.profileCompleted) {
            return res.json({ success: false, message: 'Please complete your profile first' });
        }

        // No dummy data - only show real requests from database

        // Nearby open requests for donor's blood group
        const requests = await bloodRequestModel.find({
            bloodGroup: user.bloodGroup,
            status: 'active'
        }).sort({ createdAt: -1 }).limit(10);

        // Build response structures matching frontend needs
        const donorInfo = {
            name: user.name,
            bloodGroup: user.bloodGroup,
            lastDonation: user.lastDonationAt ? timeAgo(user.lastDonationAt) : 'No donations yet',
            totalDonations: user.totalDonations,
            phone: user.phone || ''
        };

        const nearbyRequests = requests.map((r) => ({
            id: r._id,
            patientName: r.patientName,
            bloodGroup: r.bloodGroup,
            unitsNeeded: r.unitsNeeded,
            urgency: r.urgency,
            hospital: r.hospitalName,
            distance: '1.0 km', // Default distance since we don't have coordinates yet
            timeAgo: timeAgo(r.createdAt)
        }));

        const donationHistory = buildDonationHistory(user);

        return res.json({
            success: true,
            data: {
                donorInfo,
                isAvailable: user.isAvailable,
                nearbyRequests,
                donationHistory
            }
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const updateAvailability = async (req, res) => {
    try {
        const userId = req.userId;
        const { isAvailable } = req.body;
        const user = await userModel.findById(userId);
        if (!user || user.role !== 'donor') {
            return res.json({ success: false, message: 'Donor not found or not a donor' });
        }
        user.isAvailable = Boolean(isAvailable);
        await user.save();
        return res.json({ success: true, isAvailable: user.isAvailable });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const acceptRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const { requestId } = req.body;
        
        console.log('Donor accepting request:', requestId, 'donor:', userId);
        
        const user = await userModel.findById(userId);
        if (!user || user.role !== 'donor') {
            return res.json({ success: false, message: 'Donor not found or not a donor' });
        }

        const reqDoc = await bloodRequestModel.findById(requestId);
        console.log('Found request document:', reqDoc);
        
        if (!reqDoc || reqDoc.status !== 'active') {
            return res.json({ success: false, message: 'Request not available' });
        }
        
        // Add donor to accepted donors list
        await reqDoc.addDonor(userId, 'Accepted via donor dashboard');
        
        console.log('Added donor to request. Updated request:', reqDoc);
        
        // Update donor's stats
        user.totalDonations += 1;
        user.lastDonationAt = new Date();
        await user.save();
        
        return res.json({ 
            success: true, 
            message: 'Request accepted! Your donation count has been updated.',
            newStats: {
                totalDonations: user.totalDonations,
                lastDonationAt: user.lastDonationAt
            }
        });
    } catch (error) {
        console.error('Error in acceptRequest:', error);
        return res.json({ success: false, message: error.message });
    }
};

export const declineRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const { requestId } = req.body;
        const user = await userModel.findById(userId);
        if (!user || user.role !== 'donor') {
            return res.json({ success: false, message: 'Donor not found or not a donor' });
        }

        const reqDoc = await bloodRequestModel.findById(requestId);
        if (!reqDoc || reqDoc.status !== 'active') {
            return res.json({ success: false, message: 'Request not available' });
        }
        
        // Remove donor from accepted donors if they were previously accepted
        await reqDoc.removeDonor(userId);
        
        return res.json({ success: true, message: 'Request declined' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const getPatientDetails = async (req, res) => {
    try {
        const { patientId } = req.params;
        console.log('Patient ID:', patientId, 'Type:', typeof patientId);
        
        const patient = await userModel.findById(patientId).select('-password -resetOtp -resetOtpExpiry');
        
        if (!patient) {
            return res.json({ success: false, message: 'Patient not found' });
        }

        return res.json({ success: true, patient });
    } catch (error) {
        console.error('Error in getPatientDetails:', error);
        return res.json({ success: false, message: error.message });
    }
};

// Get accepted requests where donor can chat with patients
export const getAcceptedRequests = async (req, res) => {
    try {
        const userId = req.userId;
        console.log('Donor ID:', userId, 'Type:', typeof userId);
        
        const user = await userModel.findById(userId);
        
        if (!user || user.role !== 'donor') {
            return res.json({ success: false, message: 'Donor not found or not a donor' });
        }

        // Find requests where this donor has accepted
        const acceptedRequests = await bloodRequestModel.find({
            'acceptedDonors.donorId': userId,
            status: 'active'
        }).populate('patientId', 'name phone bloodGroup');

        const chatRequests = acceptedRequests.map(request => ({
            requestId: request._id,
            patientId: request.patientId._id,
            patientName: request.patientId.name,
            patientBloodGroup: request.patientId.bloodGroup,
            patientPhone: request.patientId.phone,
            bloodGroup: request.bloodGroup,
            unitsNeeded: request.unitsNeeded,
            urgency: request.urgency,
            hospitalName: request.hospitalName,
            acceptedAt: request.acceptedDonors.find(d => d.donorId.toString() === userId.toString())?.acceptedAt
        }));

        return res.json({
            success: true,
            acceptedRequests: chatRequests
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Helpers
function timeAgo(date) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
}

function buildDonationHistory(user) {
    // Placeholder: In production, pull from a Donation collection
    if (!user.lastDonationAt) {
        return [];
    }
    return [
        { date: new Date(user.lastDonationAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }), hospital: 'City General', status: 'Completed' }
    ];
}


