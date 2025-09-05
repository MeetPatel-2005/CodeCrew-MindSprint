import userModel from "../models/userModel.js";
import requestModel from "../models/requestModel.js";

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

        // Seed a few demo requests if DB empty (dev convenience)
        const totalRequests = await requestModel.countDocuments();
        if (totalRequests === 0) {
            const seed = [
                { patientName: 'Emergency Patient #1247', bloodGroup: user.bloodGroup, unitsNeeded: 2, urgency: 'Critical', hospital: 'City General Hospital', distanceKm: 1.2 },
                { patientName: 'Emergency Patient #1248', bloodGroup: user.bloodGroup, unitsNeeded: 1, urgency: 'High', hospital: 'Medical Center East', distanceKm: 2.8 },
                { patientName: 'Emergency Patient #1249', bloodGroup: user.bloodGroup, unitsNeeded: 3, urgency: 'Medium', hospital: 'Regional Hospital', distanceKm: 4.1 }
            ];
            await requestModel.insertMany(seed);
        }

        // Always add a test request for the current user's blood group if none exist
        const userRequests = await requestModel.find({
            bloodGroup: user.bloodGroup,
            status: 'open'
        });
        
        if (userRequests.length === 0) {
            const testRequest = new requestModel({
                patientName: 'Test Patient #9999',
                bloodGroup: user.bloodGroup,
                unitsNeeded: 1,
                urgency: 'High',
                hospital: 'Test Hospital',
                distanceKm: 0.5,
                status: 'open'
            });
            await testRequest.save();
        }

        // Nearby open requests for donor's blood group
        const requests = await requestModel.find({
            bloodGroup: user.bloodGroup,
            status: 'open'
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
            hospital: r.hospital,
            distance: `${r.distanceKm?.toFixed(1) || '1.0'} km`,
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
        const user = await userModel.findById(userId);
        if (!user || user.role !== 'donor') {
            return res.json({ success: false, message: 'Donor not found or not a donor' });
        }

        const reqDoc = await requestModel.findById(requestId);
        if (!reqDoc || reqDoc.status !== 'open') {
            return res.json({ success: false, message: 'Request not available' });
        }
        
        // Update request status
        reqDoc.status = 'accepted';
        reqDoc.acceptedBy = user._id;
        await reqDoc.save();
        
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

        const reqDoc = await requestModel.findById(requestId);
        if (!reqDoc || reqDoc.status !== 'open') {
            return res.json({ success: false, message: 'Request not available' });
        }
        reqDoc.status = 'declined';
        await reqDoc.save();
        return res.json({ success: true });
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


