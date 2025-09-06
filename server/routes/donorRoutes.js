import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { acceptRequest, declineRequest, getDonorDashboard, updateAvailability, saveDonorProfile, getDonorProfile, getPatientDetails, getAcceptedRequests } from '../controllers/donorController.js';

const donorRouter = express.Router();

donorRouter.get('/profile', userAuth, getDonorProfile);
donorRouter.post('/profile', userAuth, saveDonorProfile);
donorRouter.get('/dashboard', userAuth, getDonorDashboard);
donorRouter.get('/accepted-requests', userAuth, getAcceptedRequests);
donorRouter.post('/availability', userAuth, updateAvailability);
donorRouter.post('/accept', userAuth, acceptRequest);
donorRouter.post('/decline', userAuth, declineRequest);
donorRouter.get('/patients/:patientId', userAuth, getPatientDetails);

export default donorRouter;


