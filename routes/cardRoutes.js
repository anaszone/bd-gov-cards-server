const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const {
    applyForCard,
    paymentSuccess,
    getSingleApplication,
} = require("../controllers/cardController");

const Application = require("../models/Application");

// ==========================================
//      EMAIL CONFIGURATION (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Oboshshoi App Password thakte hobe
    },
});

// ==========================================
//           USER ROUTES
// ==========================================

router.post("/apply", applyForCard);

router.get("/user-applications/:email", async (req, res) => {
    try {
        const { email } = req.params;
        const applications = await Application.find({ email: email }).sort({
            appliedDate: -1,
        });
        res.status(200).json(applications);
    } catch (err) {
        res.status(500).json({ message: "Error fetching user data", error: err.message });
    }
});

router.get("/application/:tranId", getSingleApplication);
router.post("/payment/success/:tranId", paymentSuccess);

// ==========================================
//           ADMIN ROUTES
// ==========================================

// Sob application get kora
router.get("/admin/all-applications", async (req, res) => {
    try {
        const applications = await Application.find().sort({ appliedDate: -1 });
        res.status(200).json(applications);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// Update Status with Email Notification (PATCH Method)
router.patch("/admin/update-status/:id", async (req, res) => {
    const { status } = req.body;

    try {
        // 1. Database update kora
        const updated = await Application.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Application not found" });
        }

        // 2. Email Logic (Try-catch er bhetore jate email fail korle dashboard atke na jay)
        try {
            const mailOptions = {
                from: `"BD GOV CARDS" <${process.env.EMAIL_USER}>`,
                to: updated.email,
                subject: `Update: Your ${updated.cardType} Application is ${status.toUpperCase()}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
                        <h2 style="color: #15803d;">BD GOV CARDS</h2>
                        <p>Hello <strong>${updated.applicantName}</strong>,</p>
                        <p>Your application for <strong>${updated.cardType}</strong> has been updated to: 
                           <span style="font-weight: bold; color: ${status === "approved" ? "#16a34a" : "#dc2626"}">${status.toUpperCase()}</span>.
                        </p>
                        
                        ${status === "approved" ? `
                            <p>Great news! You can now view and download your digital card from your dashboard.</p>
                            <a href="http://https://bd-gov-cards-client.vercel.app//payment/success/${updated.transactionId}" 
                               style="display: inline-block; padding: 12px 25px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
                               Download My Card
                            </a>
                        ` : `
                            <p>Unfortunately, your application was not approved at this time. Please contact support for further clarification.</p>
                        `}
                        
                        <p style="margin-top: 30px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
                            Transaction ID: ${updated.transactionId}<br/>
                            &copy; 2026 BD GOV CARDS Team
                        </p>
                    </div>
                `,
            };

            // async bhabe email pathano
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("❌ Email notification failed:", error.message);
                } else {
                    console.log("✅ Email sent successfully to:", updated.email);
                }
            });
        } catch (mailErr) {
            console.log("Outer Mail Logic Error:", mailErr.message);
        }

        // 3. Status update success response (Eita oboshshoi pathate hobe)
        res.status(200).json(updated);

    } catch (err) {
        console.error("Update Failed:", err);
        res.status(500).json({ message: "Update Failed", error: err.message });
    }
});

// ==========================================
//      QR VERIFICATION ROUTE (PUBLIC)
// ==========================================
router.get('/verify-card/:tranId', async (req, res) => {
    try {
        const { tranId } = req.params;
        // Approved card verify kora
        const card = await Application.findOne({ 
            transactionId: tranId, 
            status: 'approved' 
        });

        if (!card) {
            return res.status(404).json({ 
                success: false, 
                message: "Invalid or Unverified Card!" 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: {
                name: card.applicantName,
                type: card.cardType,
                nid: card.nid,
                issueDate: card.appliedDate
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

module.exports = router;