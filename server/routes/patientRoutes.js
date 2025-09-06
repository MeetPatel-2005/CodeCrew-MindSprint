import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { createBloodRequest, getPatientRequests, getPatientDashboard, updateRequestStatus } from '../controllers/patientController.js';

const patientRouter = express.Router();

patientRouter.get('/dashboard', userAuth, getPatientDashboard);
patientRouter.post('/create-request', userAuth, createBloodRequest);
patientRouter.get('/requests', userAuth, getPatientRequests);
patientRouter.post('/update-request', userAuth, updateRequestStatus);

export default patientRouter;
