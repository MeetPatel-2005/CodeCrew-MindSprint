import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
    unitsNeeded: { type: Number, required: true, min: 1 },
    urgency: { type: String, enum: ['Critical','High','Medium','Low'], default: 'Medium' },
    hospital: { type: String, required: true },
    distanceKm: { type: Number, default: 1.0 },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['open','accepted','declined','fulfilled','cancelled'], default: 'open' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', default: null },
    additionalInfo: { type: String, default: '' }
});

const requestModel = mongoose.models.request || mongoose.model('request', requestSchema);
export default requestModel;



