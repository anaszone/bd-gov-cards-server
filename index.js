require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cardRoutes = require('./routes/cardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware - CORS Fixed (Clean Version)
// ==========================================
const corsOptions = {
   origin: [
    "http://https://bd-gov-cards-client.vercel.app/", 
    "http://localhost:5176",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5176"
],
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    credentials: true,
    optionsSuccessStatus: 200 // Older browsers (IE11, various SmartTVs) support korbe
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/cards', cardRoutes);

// MongoDB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ DB Connection Error: ", err.message));

app.get('/', (req, res) => {
  res.send("BD Gov Card Server is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on: http://localhost:${PORT}`);
});