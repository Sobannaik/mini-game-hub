const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch("http://localhost:5000/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        message.textContent = data.message;

        if (data.message === "Login successful") {

            setTimeout(() => {

                window.location.href = "game.html";

            }, 1000);

        }

    } catch (error) {

        console.log(error);

        message.textContent = "Server connection failed";

    }

});