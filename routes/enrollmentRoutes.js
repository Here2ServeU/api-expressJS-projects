const express = require("express");
const Enrollment = require("../models/Enrollment");

const router = express.Router();

// POST route to handle enrollments
router.post("/enroll", async (req, res) => {
    try {
        console.log("Incoming Request Data:", req.body); // Log the received data

        const { firstName, lastName, phone, email, course } = req.body;

        // Check if all fields are provided
        if (!firstName || !lastName || !phone || !email || !course) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Save to database
        const newEnrollment = new Enrollment({ firstName, lastName, phone, email, course });
        await newEnrollment.save();

        console.log("User Enrolled Successfully:", newEnrollment);
        res.status(201).json({ message: "Enrollment successful!" });

    } catch (error) {
        console.error("❌ Error enrolling user:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router;