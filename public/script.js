document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("enrollmentForm");
    const successMessage = document.getElementById("successMessage");
    const errorMessage = document.getElementById("errorMessage");

    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent page reload

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const course = document.getElementById("course").value;

        // Hide messages initially
        successMessage.style.display = "none";
        errorMessage.style.display = "none";

        if (!firstName || !lastName || !phone || !email || !course) {
            errorMessage.innerText = "All fields are required.";
            errorMessage.style.display = "block";
            return;
        }

        const data = { firstName, lastName, phone, email, course };

        try {
            console.log("Submitting data:", data); // Debugging log

            const response = await fetch("http://127.0.0.1:5050/api/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json(); // Expecting JSON response

            if (response.ok) {
                successMessage.innerText = result.message || "Enrollment successful!";
                successMessage.style.display = "block";
                form.reset();
            } else {
                throw new Error(result.message || "Error submitting the form.");
            }
        } catch (error) {
            console.error("Form submission error:", error);
            errorMessage.innerText = error.message;
            errorMessage.style.display = "block";
        }
    });
});