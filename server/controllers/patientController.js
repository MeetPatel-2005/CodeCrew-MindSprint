import bloodRequestModel from "../models/bloodRequestModel.js";
import userModel from "../models/userModel.js";

export const createRequest = async (req, res) => {
    try {
        const patientId = req.userId;
        const { 
            bloodGroup, 
            unitsNeeded, 
            urgency, 
            hospitalName, 
            hospitalAddress, 
            notes,
            medicalCondition,
            doctorName,
            hospitalContact,
            city,
            state,
            coordinates
        } = req.body;

        // Get patient details
        const patient = await userModel.findById(patientId);
        if (!patient) {
            return res.json({ success: false, message: 'Patient not found' });
        }

        if (!bloodGroup || !unitsNeeded || !urgency || !hospitalName || !hospitalAddress) {
            return res.json({ success: false, message: 'Missing required fields' });
        }

        const request = await bloodRequestModel.create({
            patientId,
            patientName: patient.name,
            bloodGroup,
            unitsNeeded,
            urgency,
            hospitalName,
            hospitalAddress,
            hospitalContact: hospitalContact || '',
            notes: notes || '',
            medicalCondition: medicalCondition || '',
            doctorName: doctorName || '',
            city: city || patient.location || '',
            state: state || '',
            location: coordinates ? {
                type: 'Point',
                coordinates: coordinates
            } : undefined,
            totalRequiredDonors: unitsNeeded
        });

        return res.json({ success: true, request });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const getActiveRequests = async (req, res) => {
    try {
        const patientId = req.userId;
        console.log('Getting active requests for patient:', patientId);
        
        const requests = await bloodRequestModel.find({ 
            patientId, 
            status: 'active' 
        }).sort({ createdAt: -1 });
        
        console.log('Found active requests:', requests.length);
        requests.forEach((request, index) => {
            console.log(`Request ${index + 1}:`, {
                id: request._id,
                idString: request._id.toString(),
                idLength: request._id.toString().length,
                bloodGroup: request.bloodGroup,
                status: request.status,
                acceptedDonors: request.acceptedDonors
            });
        });
        
        return res.json({ success: true, requests });
    } catch (error) {
        console.error('Error in getActiveRequests:', error);
        return res.json({ success: false, message: error.message });
    }
}

export const getRequestHistory = async (req, res) => {
    try {
        const patientId = req.userId;
        const requests = await bloodRequestModel.find({ 
            patientId, 
            status: { $in: ['fulfilled', 'cancelled', 'expired'] } 
        }).sort({ createdAt: -1 });
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
        const { reason } = req.body;

        const request = await bloodRequestModel.findOne({ 
            _id: requestId, 
            patientId, 
            status: 'active' 
        });
        
        if (!request) {
            return res.json({ success: false, message: 'Request not found or already cancelled' });
        }

        await request.cancel(patientId, reason || 'Cancelled by patient');

        return res.json({ success: true, message: 'Request cancelled successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const getDonorDetails = async (req, res) => {
    try {
        const { donorId } = req.params;
        
        const donor = await userModel.findById(donorId).select('-password -resetOtp -resetOtpExpiry');
        
        if (!donor) {
            return res.json({ success: false, message: 'Donor not found' });
        }

        return res.json({ success: true, donor });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Get nearby blood requests for donors
export const getNearbyRequests = async (req, res) => {
    try {
        const donorId = req.userId;
        const { bloodGroup, city, state, maxDistance = 50000 } = req.query;
        
        // Get donor details
        const donor = await userModel.findById(donorId);
        if (!donor) {
            return res.json({ success: false, message: 'Donor not found' });
        }

        let query = { status: 'active' };
        
        // Filter by blood group if provided
        if (bloodGroup) {
            query.bloodGroup = bloodGroup;
        }
        
        // Filter by location if provided
        if (city) query.city = new RegExp(city, 'i');
        if (state) query.state = new RegExp(state, 'i');
        
        // If donor has coordinates, find nearby requests
        if (donor.location && donor.location.coordinates) {
            const requests = await bloodRequestModel.findNearby(
                donor.location.coordinates, 
                parseInt(maxDistance)
            );
            return res.json({ success: true, requests });
        }
        
        // Otherwise, find by city/state
        const requests = await bloodRequestModel.findMatching(bloodGroup, city, state);
        return res.json({ success: true, requests });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Accept a blood request (for donors)
export const acceptRequest = async (req, res) => {
    try {
        const donorId = req.userId;
        const { requestId } = req.params;
        const { notes } = req.body;
        
        const request = await bloodRequestModel.findById(requestId);
        if (!request) {
            return res.json({ success: false, message: 'Request not found' });
        }
        
        if (request.status !== 'active') {
            return res.json({ success: false, message: 'Request is no longer active' });
        }
        
        // Check if donor already accepted
        const alreadyAccepted = request.acceptedDonors.some(
            donor => donor.donorId.toString() === donorId.toString()
        );
        
        if (alreadyAccepted) {
            return res.json({ success: false, message: 'You have already accepted this request' });
        }
        
        await request.addDonor(donorId, notes || '');
        
        return res.json({ success: true, message: 'Request accepted successfully' });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Get request details
export const getRequestDetails = async (req, res) => {
    try {
        const { requestId } = req.params;
        
        const request = await bloodRequestModel.findById(requestId)
            .populate('patientId', 'name email phone')
            .populate('acceptedDonors.donorId', 'name phone bloodGroup location');
        
        if (!request) {
            return res.json({ success: false, message: 'Request not found' });
        }
        
        return res.json({ success: true, request });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

// Get accepted donors for a patient's request (for chat)
export const getAcceptedDonors = async (req, res) => {
    try {
        const userId = req.userId;
        const { requestId } = req.params;
        
        console.log('Getting accepted donors for request:', requestId, 'user:', userId);
        
        const request = await bloodRequestModel.findById(requestId).populate('acceptedDonors.donorId', 'name phone bloodGroup');
        
        console.log('Found request:', request);
        
        if (!request) {
            console.log('Request not found');
            return res.json({ success: false, message: 'Request not found' });
        }
        
        if (request.patientId.toString() !== userId) {
            console.log('User not authorized for this request');
            return res.json({ success: false, message: 'Request not found' });
        }
        
        console.log('Accepted donors:', request.acceptedDonors);
        
        const acceptedDonors = request.acceptedDonors.map(donor => ({
            donorId: donor.donorId._id,
            donorName: donor.donorId.name,
            donorBloodGroup: donor.donorId.bloodGroup,
            donorPhone: donor.donorId.phone,
            acceptedAt: donor.acceptedAt,
            status: donor.status
        }));
        
        console.log('Mapped accepted donors:', acceptedDonors);
        
        return res.json({
            success: true,
            acceptedDonors
        });
    } catch (error) {
        console.error('Error in getAcceptedDonors:', error);
        return res.json({ success: false, message: error.message });
    }
}


