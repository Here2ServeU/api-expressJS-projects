// Description: Main entry point for the application. 
// This file is responsible for setting up the server and connecting to the database.
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express(); // Initialize express

const cors = require("cors");
app.use(cors());  // Enable CORS for all routes

// Body parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware
app.use(express.json());
app.use(express.static("public")); // Serve static files

// Connect to MongoDB
connectDB();

// Route to serve `index.html`
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Route to serve `enrollment.html`
const enrollmentRoutes = require("./routes/enrollmentRoutes");
app.use("/api", express.urlencoded({ extended: true }), enrollmentRoutes);

// Route to serve `students.html`
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on http://127.0.0.1:${PORT}`));
