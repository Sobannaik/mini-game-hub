const images = {
    R: "R.png",
    P: "P.png",
    S: "S.png"
};

const names = {
    R: "Rock",
    P: "Paper",
    S: "Scissors"
};

let wins = 0;
let draws = 0;
let losses = 0;

let allTime = {
    wins: 0,
    draws: 0,
    losses: 0
};

let isPlaying = false;
let round = 0;

const storageKey = "tronRPSRecords";

const choices = ["R", "P", "S"];

const computerImage = document.getElementById("computerImage");
const userImage = document.getElementById("userImage");
const result = document.getElementById("result");

const buttons = document.querySelectorAll(".buttons button");

const resetDataBtn = document.getElementById("reset-data-btn");
const resetConfirmation = document.getElementById("reset-confirmation");
const confirmReset = document.getElementById("confirm-reset");
const cancelReset = document.getElementById("cancel-reset");

function loadData() {
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
        updateAllTimeDisplay();
        return;
    }

    try {
        const data = JSON.parse(saved);

        allTime = {
            wins: Number(data.wins) || 0,
            draws: Number(data.draws) || 0,
            losses: Number(data.losses) || 0
        };
    } catch {
        allTime = {
            wins: 0,
            draws: 0,
            losses: 0
        };
    }

    updateAllTimeDisplay();
}

function saveData() {
    localStorage.setItem(storageKey, JSON.stringify(allTime));
}

function updateSessionDisplay() {
    document.getElementById("wins").textContent = wins;
    document.getElementById("draws").textContent = draws;
    document.getElementById("losses").textContent = losses;
}

function updateAllTimeDisplay() {
    document.getElementById("all-wins").textContent = allTime.wins;
    document.getElementById("all-draws").textContent = allTime.draws;
    document.getElementById("all-losses").textContent = allTime.losses;
}

function playGame(userChoice) {
    if (isPlaying) {
        return;
    }

    if (!choices.includes(userChoice)) {
        return;
    }

    isPlaying = true;

    buttons.forEach(button => {
        button.disabled = true;
    });

    result.innerHTML = "";
    result.className = "";

    const computerChoice =
        choices[Math.floor(Math.random() * choices.length)];

    let animationCount = 0;

    const animation = setInterval(() => {
        const randomUser =
            choices[Math.floor(Math.random() * choices.length)];

        const randomComputer =
            choices[Math.floor(Math.random() * choices.length)];

        userImage.src = images[randomUser];
        computerImage.src = images[randomComputer];

        animationCount++;

        if (animationCount >= 15) {
            clearInterval(animation);

            userImage.src = images[userChoice];
            computerImage.src = images[computerChoice];

            showResult(userChoice, computerChoice);

            isPlaying = false;

            buttons.forEach(button => {
                button.disabled = false;
            });
        }
    }, 100);
}

function showResult(userChoice, computerChoice) {
    if (userChoice === computerChoice) {
        draws++;
        allTime.draws++;

        result.innerHTML = "◇ DRAW // SYSTEMS MATCHED";
        result.classList.add("draw");
    } else if (
        (userChoice === "R" && computerChoice === "S") ||
        (userChoice === "P" && computerChoice === "R") ||
        (userChoice === "S" && computerChoice === "P")
    ) {
        wins++;
        allTime.wins++;

        result.innerHTML = "◆ VICTORY // YOU WIN";
        result.classList.add("win");
    } else {
        losses++;
        allTime.losses++;

        result.innerHTML = "◆ DEFEAT // SYSTEM WINS";
        result.classList.add("lose");
    }

    round++;

    document.getElementById("round-number").textContent =
        String(round).padStart(3, "0");

    updateSessionDisplay();
    updateAllTimeDisplay();
    saveData();
}

function openResetConfirmation() {
    resetConfirmation.classList.add("active");
}

function closeResetConfirmation() {
    resetConfirmation.classList.remove("active");
}

function resetAllData() {
    localStorage.removeItem(storageKey);

    allTime = {
        wins: 0,
        draws: 0,
        losses: 0
    };

    wins = 0;
    draws = 0;
    losses = 0;
    round = 0;

    updateSessionDisplay();
    updateAllTimeDisplay();

    document.getElementById("round-number").textContent = "001";

    result.innerHTML = "";
    result.className = "";

    closeResetConfirmation();
}

resetDataBtn.addEventListener(
    "click",
    openResetConfirmation
);

cancelReset.addEventListener(
    "click",
    closeResetConfirmation
);

confirmReset.addEventListener(
    "click",
    resetAllData
);

resetConfirmation.addEventListener(
    "click",
    event => {
        if (event.target === resetConfirmation) {
            closeResetConfirmation();
        }
    }
);

loadData();
updateSessionDisplay();