import mongoose from "mongoose";

const bloodRequestSchema = new mongoose.Schema({
    // Patient Information
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
        index: true
    },
    patientName: {
        type: String,
        required: true,
        trim: true
    },
    
    // Blood Requirements
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true,
        index: true
    },
    unitsNeeded: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
        default: 1
    },
    
    // Urgency and Priority
    urgency: {
        type: String,
        enum: ['critical', 'high', 'medium', 'low'],
        required: true,
        default: 'medium',
        index: true
    },
    priority: {
        type: Number,
        default: 0,
        index: true
    },
    
    // Hospital Information
    hospitalName: {
        type: String,
        required: true,
        trim: true
    },
    hospitalAddress: {
        type: String,
        required: true,
        trim: true
    },
    hospitalContact: {
        type: String,
        default: ''
    },
    
    // Location and Distance
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    city: {
        type: String,
        default: '',
        index: true
    },
    state: {
        type: String,
        default: '',
        index: true
    },
    
    // Request Details
    notes: {
        type: String,
        default: '',
        maxlength: 500
    },
    medicalCondition: {
        type: String,
        default: ''
    },
    doctorName: {
        type: String,
        default: ''
    },
    
    // Status Management
    status: {
        type: String,
        enum: ['active', 'fulfilled', 'cancelled', 'expired'],
        default: 'active',
        index: true
    },
    
    // Donor Management
    acceptedDonors: [{
        donorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        acceptedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['accepted', 'confirmed', 'completed', 'cancelled'],
            default: 'accepted'
        },
        notes: {
            type: String,
            default: ''
        }
    }],
    
    // Tracking
    totalAcceptedDonors: {
        type: Number,
        default: 0
    },
    totalRequiredDonors: {
        type: Number,
        default: 1
    },
    
    // Time Management
    expiresAt: {
        type: Date,
        default: function() {
            // Auto-expire after 7 days for critical, 14 days for others
            const days = this.urgency === 'critical' ? 7 : 14;
            return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        },
        index: true
    },
    
    // Completion Tracking
    completedAt: {
        type: Date,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    cancellationReason: {
        type: String,
        default: ''
    },
    
    // Analytics
    viewCount: {
        type: Number,
        default: 0
    },
    responseCount: {
        type: Number,
        default: 0
    },
    
    // Verification
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    },
    verifiedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
bloodRequestSchema.index({ patientId: 1, status: 1 });
bloodRequestSchema.index({ bloodGroup: 1, status: 1, urgency: 1 });
bloodRequestSchema.index({ city: 1, state: 1, status: 1 });
bloodRequestSchema.index({ createdAt: -1 });
bloodRequestSchema.index({ expiresAt: 1 });
bloodRequestSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual for checking if request is expired
bloodRequestSchema.virtual('isExpired').get(function() {
    return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if request is fulfilled
bloodRequestSchema.virtual('isFulfilled').get(function() {
    return this.totalAcceptedDonors >= this.totalRequiredDonors;
});

// Virtual for time remaining
bloodRequestSchema.virtual('timeRemaining').get(function() {
    if (!this.expiresAt) return null;
    const now = new Date();
    const remaining = this.expiresAt - now;
    return remaining > 0 ? Math.ceil(remaining / (1000 * 60 * 60 * 24)) : 0; // days
});

// Pre-save middleware to update priority based on urgency
bloodRequestSchema.pre('save', function(next) {
    const urgencyPriority = {
        'critical': 4,
        'high': 3,
        'medium': 2,
        'low': 1
    };
    this.priority = urgencyPriority[this.urgency] || 0;
    next();
});

// Pre-save middleware to update totalAcceptedDonors
bloodRequestSchema.pre('save', function(next) {
    this.totalAcceptedDonors = this.acceptedDonors.length;
    next();
});

// Static method to find nearby requests
bloodRequestSchema.statics.findNearby = function(coordinates, maxDistance = 50000) {
    return this.find({
        'location.coordinates': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: coordinates
                },
                $maxDistance: maxDistance
            }
        },
        status: 'active'
    });
};

// Static method to find requests by blood group and location
bloodRequestSchema.statics.findMatching = function(bloodGroup, city, state) {
    const query = {
        bloodGroup: bloodGroup,
        status: 'active'
    };
    
    if (city) query.city = new RegExp(city, 'i');
    if (state) query.state = new RegExp(state, 'i');
    
    return this.find(query).sort({ urgency: -1, createdAt: -1 });
};

// Instance method to add donor
bloodRequestSchema.methods.addDonor = function(donorId, notes = '') {
    // Check if donor already accepted
    const existingDonor = this.acceptedDonors.find(
        donor => donor.donorId.toString() === donorId.toString()
    );
    
    if (existingDonor) {
        throw new Error('Donor has already accepted this request');
    }
    
    this.acceptedDonors.push({
        donorId: donorId,
        notes: notes
    });
    
    return this.save();
};

// Instance method to remove donor
bloodRequestSchema.methods.removeDonor = function(donorId) {
    this.acceptedDonors = this.acceptedDonors.filter(
        donor => donor.donorId.toString() !== donorId.toString()
    );
    
    return this.save();
};

// Instance method to mark as fulfilled
bloodRequestSchema.methods.markFulfilled = function() {
    this.status = 'fulfilled';
    this.completedAt = new Date();
    return this.save();
};

// Instance method to cancel request
bloodRequestSchema.methods.cancel = function(cancelledBy, reason = '') {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    this.cancelledBy = cancelledBy;
    this.cancellationReason = reason;
    return this.save();
};

const bloodRequestModel = mongoose.models.blood_request || mongoose.model('blood_request', bloodRequestSchema);

export default bloodRequestModel;
