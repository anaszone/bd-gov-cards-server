const SSLCommerzPayment = require('sslcommerz-lts');
const Application = require('../models/Application');
const { v4: uuidv4 } = require('uuid');

const applyForCard = async (req, res) => {
    try {
        const transactionId = uuidv4();
        const { applicantName, nid, phone, email, cardType, price } = req.body;

        const newApplication = new Application({
            applicantName,
            nid,
            phone,
            email,
            cardType,
            price,
            transactionId: transactionId,
            status: 'pending',
            paymentStatus: 'paid'
        });

        await newApplication.save();

        // Response format fixed for frontend
        return res.status(200).json({ 
            success: true, 
            url: `http://https://bd-gov-cards-client.vercel.app//payment/success/${transactionId}` 
        });

    } catch (error) {
        console.error("❌ Backend Error:", error.message);
        return res.status(500).json({ message: error.message });
    }
};

const paymentSuccess = async (req, res) => {
    const { tranId } = req.params;
    try {
        const result = await Application.updateOne(
            { transactionId: tranId },
            { $set: { paymentStatus: 'paid' } } 
        );
        
        if (result.modifiedCount > 0) {
            res.redirect(`http://https://bd-gov-cards-client.vercel.app//payment/success/${tranId}`);
        } else {
            res.status(404).json({ message: "Transaction not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSingleApplication = async (req, res) => {
    try {
        const application = await Application.findOne({ transactionId: req.params.tranId });
        if (application) {
            res.json(application);
        } else {
            res.status(404).json({ message: "Application not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    applyForCard, 
    paymentSuccess, 
    getSingleApplication 
};