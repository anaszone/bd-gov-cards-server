// server/models/Application.js
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    applicantName: String,
    nid: String,
    phone: String,
    email: String,
    cardType: String,
    price: Number,
    transactionId: String,
    appliedDate: { type: Date, default: Date.now },
    // Notun field add koro
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    }
});

module.exports = mongoose.model('Application', applicationSchema);