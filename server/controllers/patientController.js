import patientRequestModel from "../models/patientRequestModel.js";
import userModel from "../models/userModel.js";

export const createRequest = async (req, res) => {
    try {
        const patientId = req.userId;
        const { bloodGroup, unitsNeeded, urgency, hospitalName, hospitalAddress, notes } = req.body;

        if (!bloodGroup || !unitsNeeded || !urgency || !hospitalName || !hospitalAddress) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        const request = await patientRequestModel.create({
            patientId,
            bloodGroup,
            unitsNeeded,
            urgency,
            hospitalName,
            hospitalAddress,
            notes: notes || ''
        });

        return res.json({ success: true, request });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const getActiveRequests = async (req, res) => {
    try {
        const patientId = req.userId;
        const requests = await patientRequestModel.find({ patientId, status: 'Active' }).sort({ createdAt: -1 });
        return res.json({ success: true, requests });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const getRequestHistory = async (req, res) => {
    try {
        const patientId = req.userId;
        const requests = await patientRequestModel.find({ patientId, status: { $ne: 'Active' } }).sort({ createdAt: -1 });
        return res.json({ success: true, requests });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Basic donor matching by blood group. Real-world matching would include location and availability.
export const getMatchingDonors = async (req, res) => {
    try {
        const patientId = req.userId;
        const { bloodGroup } = req.query;

        const group = bloodGroup || (await userModel.findById(patientId))?.bloodGroup || '';
        if (!group) {
            return res.json({ success: true, donors: [] });
        }

        const donors = await userModel.find({ role: 'donor', bloodGroup: group }).select('name bloodGroup phone lastDonationAt location');

        const formatted = donors.map(d => ({
            id: d._id,
            name: d.name,
            bloodGroup: d.bloodGroup,
            phone: d.phone ? `${d.phone.substring(0, 6)}***` : 'N/A',
            status: 'Accepted',
            lastDonation: d.lastDonationAt ? `${Math.max(0, Math.floor((Date.now() - d.lastDonationAt) / (1000*60*60*24)))} days ago` : 'Unknown',
            distance: d.location ? d.location : 'Nearby'
        }));

        return res.json({ success: true, donors: formatted });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const cancelRequest = async (req, res) => {
    try {
        const patientId = req.userId;
        const { requestId } = req.params;

        const request = await patientRequestModel.findOne({ _id: requestId, patientId, status: 'Active' });
        
        if (!request) {
            return res.json({ success: false, message: 'Request not found or already cancelled' });
        }

        request.status = 'Cancelled';
        await request.save();

        return res.json({ success: true, message: 'Request cancelled successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


