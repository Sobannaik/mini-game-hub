const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const API_URL = "http://localhost:5000";

if (signupForm) {

    signupForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim().toLowerCase();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        const message =
            document.getElementById("message");


        // Password check
        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match!";

            message.className = "error";

            return;
        }


        // Password length
        if (password.length < 6) {

            message.textContent =
                "Password must be at least 6 characters.";

            message.className = "error";

            return;
        }


        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, email, password })
            });

            const result = await response.json();
            message.textContent = result.message;
            message.className = response.ok ? "success" : "error";

            if (response.ok) {
                signupForm.reset();
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 800);
            }
        } catch (error) {
            message.textContent = "Cannot connect to the server.";
            message.className = "error";
        }

    });

}

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                alert(result.message);
                return;
            }

            localStorage.setItem("user", JSON.stringify(result.user));
            window.location.href = "OXgame/index.html";
        } catch (error) {
            alert("Cannot connect to the server.");
        }
    });
}