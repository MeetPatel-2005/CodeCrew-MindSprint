import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { 
    createRequest, 
    getActiveRequests, 
    getMatchingDonors, 
    getRequestHistory, 
    cancelRequest, 
    getDonorDetails,
    getNearbyRequests,
    acceptRequest,
    getRequestDetails,
    getAcceptedDonors
} from '../controllers/patientController.js';

const patientRouter = express.Router();

// Request management
patientRouter.post('/requests', userAuth, createRequest);
patientRouter.get('/requests/active', userAuth, getActiveRequests);
patientRouter.get('/requests/history', userAuth, getRequestHistory);
patientRouter.get('/requests/:requestId', userAuth, getRequestDetails);
patientRouter.put('/requests/:requestId/cancel', userAuth, cancelRequest);

// Donor management
patientRouter.get('/donors/matching', userAuth, getMatchingDonors);
patientRouter.get('/donors/nearby', userAuth, getNearbyRequests);
patientRouter.get('/donors/:donorId', userAuth, getDonorDetails);
patientRouter.get('/requests/:requestId/accepted-donors', userAuth, getAcceptedDonors);
patientRouter.post('/requests/:requestId/accept', userAuth, acceptRequest);

export default patientRouter;


