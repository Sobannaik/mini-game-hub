const gameArea = document.getElementById("game-area");
const startScreen = document.getElementById("start-screen");
const gameOver = document.getElementById("game-over");
const countdown = document.getElementById("countdown");

const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

const totalPoppedDisplay =
    document.getElementById("total-popped");

const bestTimeDisplay =
    document.getElementById("best-time");

const bestAverageDisplay =
    document.getElementById("best-average");

const finalScore =
    document.getElementById("final-score");

const finalAverage =
    document.getElementById("final-average");

const finalBest =
    document.getElementById("final-best");

const recordCelebration =
    document.getElementById("record-celebration");

const recordSymbol =
    document.getElementById("record-symbol");

const recordTitle =
    document.getElementById("record-title");

const recordType =
    document.getElementById("record-type");

const recordValue =
    document.getElementById("record-value");

const recordSubtitle =
    document.getElementById("record-subtitle");

const resetDataBtn =
    document.getElementById("reset-data-btn");

const resetConfirmation =
    document.getElementById("reset-confirmation");

const confirmReset =
    document.getElementById("confirm-reset");

const cancelReset =
    document.getElementById("cancel-reset");

let score = 0;
let reactionTimes = [];
let bubble = null;
let bubbleStartTime = 0;
let disappearTimer = null;
let countdownTimer = null;
let countdownDelayTimer = null;
let gameRunning = false;
let gameStarting = false;

let lifetime = 2500;

const minimumLifetime = 500;
const decreaseAmount = 150;

const storageKey = "reactionRushRecords";

let records = {
    totalPopped: 0,
    bestTime: null,
    bestAverage: null
};

function loadRecords() {
    const savedData =
        localStorage.getItem(storageKey);

    if (!savedData) {
        updateRecordDisplay();
        return;
    }

    try {
        const savedRecords =
            JSON.parse(savedData);

        records = {
            totalPopped:
                Number(savedRecords.totalPopped) || 0,

            bestTime:
                typeof savedRecords.bestTime === "number"
                    ? savedRecords.bestTime
                    : null,

            bestAverage:
                typeof savedRecords.bestAverage === "number"
                    ? savedRecords.bestAverage
                    : null
        };
    } catch {
        records = {
            totalPopped: 0,
            bestTime: null,
            bestAverage: null
        };
    }

    updateRecordDisplay();
}

function saveRecords() {
    localStorage.setItem(
        storageKey,
        JSON.stringify(records)
    );
}

function updateRecordDisplay() {
    totalPoppedDisplay.textContent =
        records.totalPopped;

    bestTimeDisplay.textContent =
        records.bestTime !== null
            ? Math.round(records.bestTime) + " ms"
            : "--";

    bestAverageDisplay.textContent =
        records.bestAverage !== null
            ? Math.round(records.bestAverage) + " ms"
            : "--";
}

function startGame() {
    if (gameRunning || gameStarting) {
        return;
    }

    clearCountdown();

    removeBubble();

    score = 0;
    reactionTimes = [];
    lifetime = 2500;

    gameRunning = false;
    gameStarting = true;

    finalScore.textContent = "0";
    finalAverage.textContent = "0 ms";
    finalBest.textContent = "0 ms";

    startScreen.style.display = "none";
    gameOver.style.display = "none";

    recordCelebration.classList.remove("active");

    runCountdown();
}

function runCountdown() {
    countdown.style.display = "flex";

    let number = 3;

    countdown.textContent = number;

    countdownTimer = setInterval(() => {
        number--;

        if (number > 0) {
            countdown.textContent = number;
            return;
        }

        clearInterval(countdownTimer);
        countdownTimer = null;

        countdown.textContent = "GO!";

        countdownDelayTimer = setTimeout(() => {
            countdownDelayTimer = null;

            countdown.style.display = "none";

            gameStarting = false;
            gameRunning = true;

            createBubble();
        }, 400);

    }, 700);
}

function clearCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }

    if (countdownDelayTimer) {
        clearTimeout(countdownDelayTimer);
        countdownDelayTimer = null;
    }

    countdown.style.display = "none";
}

function createBubble() {
    if (!gameRunning) {
        return;
    }

    removeBubble();

    bubble =
        document.createElement("div");

    bubble.className = "bubble";

    const size =
        Math.floor(Math.random() * 45) + 45;

    const maxX =
        Math.max(0, gameArea.clientWidth - size);

    const maxY =
        Math.max(0, gameArea.clientHeight - size);

    const x =
        Math.random() * maxX;

    const y =
        Math.random() * maxY;

    const colors = [
        "#ff4d6d",
        "#5865f2",
        "#00c2ff",
        "#9b5de5",
        "#00d68f",
        "#ff9f1c"
    ];

    const color =
        colors[
            Math.floor(
                Math.random() * colors.length
            )
        ];

    bubble.style.width =
        size + "px";

    bubble.style.height =
        size + "px";

    bubble.style.left =
        x + "px";

    bubble.style.top =
        y + "px";

    bubble.style.background =
        color;

    gameArea.appendChild(bubble);

    bubbleStartTime =
        performance.now();

    disappearTimer =
        setTimeout(() => {
            endGame();
        }, lifetime);

    bubble.addEventListener(
        "click",
        popBubble
    );
}

function popBubble() {
    if (!gameRunning || !bubble) {
        return;
    }

    const reactionTime =
        performance.now() -
        bubbleStartTime;

    reactionTimes.push(
        reactionTime
    );

    score++;

    records.totalPopped++;

    lifetime =
        Math.max(
            minimumLifetime,
            lifetime - decreaseAmount
        );

    saveRecords();
    updateRecordDisplay();

    removeBubble();

    createBubble();
}

function removeBubble() {
    if (bubble) {
        bubble.remove();
        bubble = null;
    }

    if (disappearTimer) {
        clearTimeout(disappearTimer);
        disappearTimer = null;
    }
}

function endGame() {
    if (!gameRunning) {
        return;
    }

    gameRunning = false;

    removeBubble();

    const average =
        reactionTimes.length > 0
            ? reactionTimes.reduce(
                (sum, time) =>
                    sum + time,
                0
            ) / reactionTimes.length
            : 0;

    const best =
        reactionTimes.length > 0
            ? Math.min(...reactionTimes)
            : 0;

    let newBestTime = false;
    let newBestAverage = false;

    if (
        reactionTimes.length > 0 &&
        (
            records.bestTime === null ||
            best < records.bestTime
        )
    ) {
        records.bestTime = best;
        newBestTime = true;
    }

    if (
        reactionTimes.length > 0 &&
        (
            records.bestAverage === null ||
            average < records.bestAverage
        )
    ) {
        records.bestAverage = average;
        newBestAverage = true;
    }

    saveRecords();
    updateRecordDisplay();

    finalScore.textContent =
        score;

    finalAverage.textContent =
        Math.round(average) + " ms";

    finalBest.textContent =
        Math.round(best) + " ms";

    gameOver.style.display = "flex";

    if (newBestTime && newBestAverage) {
        showRecordCelebration(
            "ϟ",
            "NEW RECORD",
            "FASTEST REACTION",
            Math.round(best) + " ms"
        );

        setTimeout(() => {
            if (!gameRunning) {
                showRecordCelebration(
                    "✦",
                    "NEW RECORD",
                    "BEST AVERAGE",
                    Math.round(average) + " ms"
                );
            }
        }, 3600);

    } else if (newBestTime) {
        showRecordCelebration(
            "ϟ",
            "NEW RECORD",
            "FASTEST REACTION",
            Math.round(best) + " ms"
        );

    } else if (newBestAverage) {
        showRecordCelebration(
            "✦",
            "NEW RECORD",
            "BEST AVERAGE",
            Math.round(average) + " ms"
        );
    }
}

function showRecordCelebration(
    symbol,
    title,
    type,
    value
) {
    recordSymbol.textContent =
        symbol;

    recordTitle.textContent =
        title;

    recordType.textContent =
        type;

    recordValue.textContent =
        value;

    recordSubtitle.textContent =
        "PERSONAL RECORD ESTABLISHED";

    recordCelebration.classList.remove(
        "active"
    );

    void recordCelebration.offsetWidth;

    recordCelebration.classList.add(
        "active"
    );

    setTimeout(() => {
        recordCelebration.classList.remove(
            "active"
        );
    }, 3300);
}

function openResetConfirmation() {
    if (gameStarting || gameRunning) {
        return;
    }

    resetConfirmation.classList.add(
        "active"
    );
}

function closeResetConfirmation() {
    resetConfirmation.classList.remove(
        "active"
    );
}

function resetAllData() {
    clearCountdown();
    removeBubble();

    localStorage.removeItem(
        storageKey
    );

    records = {
        totalPopped: 0,
        bestTime: null,
        bestAverage: null
    };

    updateRecordDisplay();

    closeResetConfirmation();

    score = 0;
    reactionTimes = [];
    lifetime = 2500;

    gameRunning = false;
    gameStarting = false;

    finalScore.textContent = "0";
    finalAverage.textContent = "0 ms";
    finalBest.textContent = "0 ms";

    gameOver.style.display = "none";
    startScreen.style.display = "flex";

    recordCelebration.classList.remove(
        "active"
    );
}

startBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    startGame
);

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
        if (
            event.target ===
            resetConfirmation
        ) {
            closeResetConfirmation();
        }
    }
);

loadRecords();