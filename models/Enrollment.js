const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    course: { type: String, required: true }
});

module.exports = mongoose.model("Enrollment", EnrollmentSchema);