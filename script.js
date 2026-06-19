let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; 
let isGameActive = true;
let isAiMode = false;

const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('statusMessage');
const resetBtn = document.getElementById('resetBtn');
const pvpBtn = document.getElementById('pvpBtn');
const aiBtn = document.getElementById('aiBtn');

const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (boardState[clickedIndex] !== "" || !isGameActive) return;

    makeMove(clickedIndex, currentPlayer);
    
    if (!checkGameResult()) {
        if (isAiMode) {
            isGameActive = false;
            setTimeout(executeAiMove, 250); 
        } else {
            switchPlayer();
        }
    }
}

function makeMove(index, player) {
    boardState[index] = player;
    cells[index].textContent = player;
    cells[index].classList.add(player === "X" ? "x-marker" : "o-marker", "filled");
}

function switchPlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusMessage.innerHTML = currentPlayer === "X" 
        ? `Player <span class="x-turn">X</span>'s Turn` 
        : `Player <span class="o-turn">O</span>'s Turn`;
}

function checkGameResult() {
    let roundWon = false;
    let winningCombo = [];
    let winner = null;

    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            roundWon = true;
            winningCombo = combo;
            winner = boardState[a];
            break;
        }
    }

    if (roundWon) {
        const isAiWinner = isAiMode && winner === "O";
        const label = isAiWinner ? "AI" : `Player ${winner}`;
        statusMessage.innerHTML = winner === "X"
            ? `<span class="x-turn">${label} Dominates!</span>`
            : `<span class="o-turn">${label} Triumphs!</span>`;

        winningCombo.forEach(index => cells[index].classList.add('winner-node'));
        isGameActive = false;
        return true;
    }

    if (!boardState.includes("")) {
        statusMessage.innerHTML = `<span style="color: var(--text-gray)">Grid Standoff! It's a Draw.</span>`;
        isGameActive = false;
        return true;
    }

    return false;
}

function executeAiMove() {
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < boardState.length; i++) {
        if (boardState[i] === "") {
            boardState[i] = "O";
            let score = minimax(boardState, 0, false);
            boardState[i] = "";
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }

    makeMove(bestMove, "O");
    isGameActive = true; 
    if (!checkGameResult()) {
        currentPlayer = "X";
        statusMessage.innerHTML = `Player <span class="x-turn">X</span>'s Turn`;
    }
}

function minimax(state, depth, isMaximizing) {
    let result = evaluateBoardStateForAi(state);
    if (result !== null) return result;

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < state.length; i++) {
            if (state[i] === "") {
                state[i] = "O";
                let score = minimax(state, depth + 1, false);
                state[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < state.length; i++) {
            if (state[i] === "") {
                state[i] = "X";
                let score = minimax(state, depth + 1, true);
                state[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function evaluateBoardStateForAi(state) {
    for (let combo of winningCombinations) {
        const [a, b, c] = combo;
        if (state[a] && state[a] === state[b] && state[a] === state[c]) {
            return state[a] === "O" ? 10 : -10;
        }
    }
    if (!state.includes("")) return 0;
    return null; 
}

function resetGame() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusMessage.innerHTML = `Player <span class="x-turn">X</span>'s Turn`;
    cells.forEach(cell => {
        cell.textContent = "";
        cell.className = "cell";
    });
}

pvpBtn.addEventListener('click', () => {
    if (!isAiMode) return;
    isAiMode = false;
    pvpBtn.classList.add('active');
    aiBtn.classList.remove('active');
    resetGame();
});

aiBtn.addEventListener('click', () => {
    if (isAiMode) return;
    isAiMode = true;
    aiBtn.classList.add('active');
    pvpBtn.classList.remove('active');
    resetGame();
});

board.addEventListener('click', handleCellClick);
resetBtn.addEventListener('click', resetGame);