import userModel from "../models/userModel.js";
import requestModel from "../models/requestModel.js";

// Create a blood request
export const createBloodRequest = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        
        if (!user || user.role !== 'patient') {
            return res.json({ success: false, message: 'Patient not found or not a patient' });
        }

        const {
            bloodGroup,
            unitsNeeded,
            urgency,
            hospital,
            distanceKm,
            additionalInfo
        } = req.body;

        // Create new request
        const newRequest = new requestModel({
            patientName: user.name,
            bloodGroup,
            unitsNeeded,
            urgency: urgency || 'Medium',
            hospital,
            distanceKm: distanceKm || 1.0,
            status: 'open',
            createdBy: user._id,
            additionalInfo: additionalInfo || ''
        });

        await newRequest.save();

        return res.json({
            success: true,
            message: 'Blood request created successfully',
            request: newRequest
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get patient's own requests
export const getPatientRequests = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        
        if (!user || user.role !== 'patient') {
            return res.json({ success: false, message: 'Patient not found or not a patient' });
        }

        const requests = await requestModel.find({ createdBy: user._id })
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            requests
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Get patient dashboard data
export const getPatientDashboard = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);
        
        if (!user || user.role !== 'patient') {
            return res.json({ success: false, message: 'Patient not found or not a patient' });
        }

        // Get patient's requests
        const requests = await requestModel.find({ createdBy: user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        // Get accepted requests with donor info
        const acceptedRequests = await requestModel.find({ 
            createdBy: user._id, 
            status: 'accepted' 
        }).populate('acceptedBy', 'name phone bloodGroup');

        return res.json({
            success: true,
            data: {
                patientInfo: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    bloodGroup: user.bloodGroup || ''
                },
                requests,
                acceptedRequests
            }
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Update request status
export const updateRequestStatus = async (req, res) => {
    try {
        const userId = req.userId;
        const { requestId, status } = req.body;
        
        const user = await userModel.findById(userId);
        if (!user || user.role !== 'patient') {
            return res.json({ success: false, message: 'Patient not found or not a patient' });
        }

        const request = await requestModel.findOne({ 
            _id: requestId, 
            createdBy: user._id 
        });

        if (!request) {
            return res.json({ success: false, message: 'Request not found' });
        }

        request.status = status;
        await request.save();

        return res.json({
            success: true,
            message: 'Request status updated successfully'
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
