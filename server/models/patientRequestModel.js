import mongoose from "mongoose";

const patientRequestSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    bloodGroup: {
        type: String,
        required: true
    },
    unitsNeeded: {
        type: Number,
        required: true,
        min: 1
    },
    urgency: {
        type: String,
        enum: ['critical', 'high', 'medium'],
        required: true
    },
    hospitalName: {
        type: String,
        required: true
    },
    hospitalAddress: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Cancelled'],
        default: 'Active'
    },
    acceptedDonors: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const patientRequestModel = mongoose.models.patient_request || mongoose.model('patient_request', patientRequestSchema);
export default patientRequestModel;


