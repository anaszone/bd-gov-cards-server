require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cardRoutes = require('./routes/cardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Optimized for Mobile & Image Generation
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5175", "http://localhost:3000"], // Tomar frontend ports
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true
}));

// Extra Security Header for Canvas/Image - Eita add koro
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.json());

// Routes
app.use('/api/cards', cardRoutes);

// MongoDB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => {
    console.log("❌ DB Connection Error: ", err.message);
  });

app.get('/', (req, res) => {
  res.send("BD Gov Card Server is running...");
});

// '0.0.0.0' listen logic
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server is running on:`);
//   console.log(`🏠 Local:   http://localhost:${PORT}`);
//   console.log(`🌐 Network: http://localhost:${PORT}`);
// });

app.listen(PORT, () => {
  console.log(`🚀 Server is running on: http://localhost:${PORT}`);
});