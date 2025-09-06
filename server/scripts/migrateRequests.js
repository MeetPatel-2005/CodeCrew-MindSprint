import mongoose from 'mongoose';
import bloodRequestModel from '../models/bloodRequestModel.js';
import userModel from '../models/userModel.js';
import 'dotenv/config';

// Migration script to consolidate patient_request and request collections into blood_request
const migrateRequests = async () => {
    try {
        console.log('Starting migration...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        // Get all patient requests
        const patientRequests = await mongoose.connection.db.collection('patient_requests').find({}).toArray();
        console.log(`Found ${patientRequests.length} patient requests`);
        
        // Get all requests
        const requests = await mongoose.connection.db.collection('requests').find({}).toArray();
        console.log(`Found ${requests.length} requests`);
        
        // Migrate patient requests
        for (const req of patientRequests) {
            try {
                // Get patient details
                const patient = await userModel.findById(req.patientId);
                if (!patient) {
                    console.log(`Patient not found for request ${req._id}, skipping...`);
                    continue;
                }
                
                // Create new blood request
                const newRequest = new bloodRequestModel({
                    patientId: req.patientId,
                    patientName: patient.name,
                    bloodGroup: req.bloodGroup,
                    unitsNeeded: req.unitsNeeded,
                    urgency: req.urgency,
                    hospitalName: req.hospitalName,
                    hospitalAddress: req.hospitalAddress,
                    notes: req.notes || '',
                    status: req.status === 'Active' ? 'active' : 
                           req.status === 'Completed' ? 'fulfilled' : 
                           req.status === 'Cancelled' ? 'cancelled' : 'active',
                    totalRequiredDonors: req.unitsNeeded,
                    totalAcceptedDonors: req.acceptedDonors || 0,
                    createdAt: req.createdAt,
                    updatedAt: req.updatedAt
                });
                
                await newRequest.save();
                console.log(`Migrated patient request ${req._id}`);
            } catch (error) {
                console.error(`Error migrating patient request ${req._id}:`, error.message);
            }
        }
        
        // Migrate requests
        for (const req of requests) {
            try {
                // Find patient by name (this is a limitation of the old schema)
                const patient = await userModel.findOne({ name: req.patientName });
                if (!patient) {
                    console.log(`Patient not found for request ${req._id}, skipping...`);
                    continue;
                }
                
                // Create new blood request
                const newRequest = new bloodRequestModel({
                    patientId: patient._id,
                    patientName: req.patientName,
                    bloodGroup: req.bloodGroup,
                    unitsNeeded: req.unitsNeeded,
                    urgency: req.urgency.toLowerCase(),
                    hospitalName: req.hospital,
                    hospitalAddress: '', // Not available in old schema
                    notes: '',
                    status: req.status === 'open' ? 'active' : 
                           req.status === 'fulfilled' ? 'fulfilled' : 
                           req.status === 'cancelled' ? 'cancelled' : 'active',
                    totalRequiredDonors: req.unitsNeeded,
                    totalAcceptedDonors: req.acceptedBy ? 1 : 0,
                    city: '', // Not available in old schema
                    state: '', // Not available in old schema
                    createdAt: req.createdAt,
                    updatedAt: req.createdAt
                });
                
                // Add accepted donor if exists
                if (req.acceptedBy) {
                    newRequest.acceptedDonors.push({
                        donorId: req.acceptedBy,
                        acceptedAt: req.createdAt,
                        status: 'accepted'
                    });
                }
                
                await newRequest.save();
                console.log(`Migrated request ${req._id}`);
            } catch (error) {
                console.error(`Error migrating request ${req._id}:`, error.message);
            }
        }
        
        console.log('Migration completed successfully!');
        console.log(`Total blood requests created: ${await bloodRequestModel.countDocuments()}`);
        
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateRequests();
}

export default migrateRequests;

