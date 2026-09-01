const cells = document.querySelectorAll(".cell");
const turnText = document.getElementById("turnText");

const xScoreText = document.getElementById("xScore");
const oScoreText = document.getElementById("oScore");
const drawScoreText = document.getElementById("drawScore");

const restartBtn = document.getElementById("restartBtn");

let board = ["", "", "", "", "", "", "", "",""];
let currentPlayer = "X";

let xScore = 0;
let oScore = 0;
let drawScore = 0;

let gameActive = true;

// All possible winning combinations
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],

    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],

    [0, 4, 8],
    [2, 4, 6]
];


// Cell click
cells.forEach((cell) => {

    cell.addEventListener("click", () => {

        const index = cell.getAttribute("data-index");

        // Don't allow clicking an already filled cell
        if (board[index] !== "" || !gameActive) {
            return;
        }

        // Put X or O
        board[index] = currentPlayer;

        cell.textContent = currentPlayer;

        // Add styling
        cell.classList.add(currentPlayer.toLowerCase());

        // Check winner
        if (checkWinner()) {
            turnText.textContent = `Player ${currentPlayer} Wins!`;

            if (currentPlayer === "X") {
                xScore++;
                xScoreText.textContent = xScore;
            } else {
                oScore++;
                oScoreText.textContent = oScore;
            }

            gameActive = false;
            return;
        }

        // Check draw
        if (board.every(cell => cell !== "")) {

            turnText.textContent = "It's a Draw!";

            drawScore++;
            drawScoreText.textContent = drawScore;

            gameActive = false;
            return;
        }

        // Change player
        currentPlayer = currentPlayer === "X" ? "O" : "X";

        turnText.textContent = `Player ${currentPlayer}'s Turn`;
    });
});


// Winner checking function
function checkWinner() {

    for (let combination of winningCombinations) {

        const a = combination[0];
        const b = combination[1];
        const c = combination[2];

        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {

            // Highlight winning cells
            cells[a].classList.add("winner");
            cells[b].classList.add("winner");
            cells[c].classList.add("winner");

            return true;
        }
    }

    return false;
}

// Restart game
restartBtn.addEventListener("click", restartGame);

function restartGame() {

    board = ["", "", "", "", "", "", "", "",""];

    currentPlayer = "X";

    gameActive = true;

    turnText.textContent = "Player X's Turn";

    cells.forEach((cell) => {
        cell.textContent = "";
        cell.classList.remove("x", "o" , "winner");
    });
}