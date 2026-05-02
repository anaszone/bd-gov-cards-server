const SSLCommerzPayment = require('sslcommerz-lts');
const Application = require('../models/Application');
const { v4: uuidv4 } = require('uuid');

const applyForCard = async (req, res) => {
    try {
        const transactionId = uuidv4();
        const { applicantName, nid, phone, email, cardType, price } = req.body;

        // Ekhane status 'pending' thakbe, jate Admin approve na kora porjonto card na dekhay
        const newApplication = new Application({
            applicantName,
            nid,
            phone,
            email,
            cardType,
            price,
            transactionId: transactionId,
            status: 'pending', // <--- ETA 'pending' HOBE
            paymentStatus: 'paid' // Payment bypass logic thakle 'paid' thakte pare
        });

        await newApplication.save();

        // IP Address update kora holo (localhost)
        res.send({ 
            success: true, 
            url: `http://localhost:5173/payment/success/${transactionId}` 
        });

    } catch (error) {
        console.error("❌ Backend Error:", error.message);
        res.status(500).send({ message: error.message });
    }
};

const paymentSuccess = async (req, res) => {
    const { tranId } = req.params;
    try {
        // Payment success hole shudhu paymentStatus 'paid' hobe, status 'pending'-i thakbe
        const result = await Application.updateOne(
            { transactionId: tranId },
            { $set: { paymentStatus: 'paid' } } 
        );
        
        if (result.modifiedCount > 0) {
            res.redirect(`http://localhost:5173/payment/success/${tranId}`);
        } else {
            res.status(404).send("Transaction not found in database");
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

const getSingleApplication = async (req, res) => {
    try {
        const application = await Application.findOne({ transactionId: req.params.tranId });
        if (application) {
            res.send(application);
        } else {
            res.status(404).send({ message: "Application not found" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

module.exports = { 
    applyForCard, 
    paymentSuccess, 
    getSingleApplication 
};