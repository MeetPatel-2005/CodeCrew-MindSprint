import express from 'express';
import userAuth from '../middleware/userAuth.js';
import { createRequest, getActiveRequests, getMatchingDonors, getRequestHistory, cancelRequest } from '../controllers/patientController.js';

const patientRouter = express.Router();

patientRouter.post('/requests', userAuth, createRequest);
patientRouter.get('/requests/active', userAuth, getActiveRequests);
patientRouter.get('/requests/history', userAuth, getRequestHistory);
patientRouter.get('/donors/matching', userAuth, getMatchingDonors);
patientRouter.put('/requests/:requestId/cancel', userAuth, cancelRequest);

export default patientRouter;


