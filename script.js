const board = document.getElementById('board');
const resetButton = document.getElementById('reset');
const scoreXDisplay = document.getElementById('scoreX');
const scoreODisplay = document.getElementById('scoreO');
const difficultySelect = document.getElementById('difficulty');

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let isGameActive = true;
let scoreX = 0;
let scoreO = 0;

// Winning combinations
const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

// Modal elements
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modal-message');
const closeModalButton = document.getElementById('close-modal');

// Show modal with the winner message
const showModal = (message) => {
    modalMessage.innerText = message;
    modal.style.display = "block"; // Show the modal
};

// Close modal
closeModalButton.addEventListener('click', () => {
    modal.style.display = "none"; // Hide the modal
});

// Close modal when clicking outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = "none"; // Hide the modal
    }
});

// Handle player moves
const handleCellClick = (index) => {
    if (gameBoard[index] !== '' || !isGameActive || currentPlayer === 'O') return;
    gameBoard[index] = currentPlayer;
    renderBoard();
    if (checkWinner()) {
        updateScore();
        return; // Stop further moves
    }
    currentPlayer = 'O';
    setTimeout(botMove, 500); // Delay for bot move
};

// Render the game board
const renderBoard = () => {
    board.innerHTML = '';
    gameBoard.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.innerText = cell;
        cellElement.addEventListener('click', () => handleCellClick(index));
        board.appendChild(cellElement);
    });
};

// Check for a winner
const checkWinner = () => {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            markWinningCells(combination);
            showModal(`${currentPlayer === 'X' ? 'Player X' : 'Player O'} wins!`); // Show modal instead of alert
            isGameActive = false; // Stop the game
            return true; // Return true if there is a winner
        }
    }
    if (!gameBoard.includes('')) {
        showModal("It's a draw!"); // Show modal for draw
        isGameActive = false; // Stop the game on draw
        return true; // Return true if it's a draw
    }
    return false; // Return false if no winner or draw
};

// Update score display
const updateScore = () => {
    if (currentPlayer === 'X') {
        scoreX++;
        scoreXDisplay.innerText = `Player X: ${scoreX}`;
    } else {
        scoreO++;
        scoreODisplay.innerText = `Player O: ${scoreO}`;
    }
};

// Mark winning cells with animation
const markWinningCells = (combination) => {
    combination.forEach(index => {
        const cell = board.children[index];
        cell.classList.add('winning');
    });
};

// Bot move based on difficulty level
const botMove = () => {
    const difficulty = difficultySelect.value;
    let move;

    if (difficulty === 'easy') {
        move = getRandomMove();
    } else if (difficulty === 'medium') {
        move = getMediumMove();
    } else {
        move = getBestMove(); // Hard difficulty
    }

    gameBoard[move] = currentPlayer;
    renderBoard();
    if (checkWinner()) return; // Stop if bot wins
    currentPlayer = 'X';
};

// Get a random move for easy difficulty
const getRandomMove = () => {
    let availableCells = gameBoard.map((cell, index) => cell === '' ? index : null).filter(v => v !== null);
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    return availableCells[randomIndex];
};

// Get a blocking move for medium difficulty
const getMediumMove = () => {
    // Check if the player can win in the next move
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameBoard[a] === 'X' && gameBoard[b] === 'X' && gameBoard[c] === '') return c;
        if (gameBoard[a] === 'X' && gameBoard[c] === 'X' && gameBoard[b] === '') return b;
        if (gameBoard[b] === 'X' && gameBoard[c] === 'X' && gameBoard[a] === '') return a;
    }

    // Check if the bot can win in the next move
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameBoard[a] === 'O' && gameBoard[b] === 'O' && gameBoard[c] === '') return c;
        if (gameBoard[a] === 'O' && gameBoard[c] === 'O' && gameBoard[b] === '') return b;
        if (gameBoard[b] === 'O' && gameBoard[c] === 'O' && gameBoard[a] === '') return a;
    }

    // If no immediate win/blocking move, choose random
    return getRandomMove();
};

// Get the best move using the Minimax algorithm
const getBestMove = () => {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            let score = minimax(gameBoard, 0, false);
            gameBoard[i] = ''; // Undo the move
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
};

// Minimax algorithm implementation
const minimax = (board, depth, isMaximizing) => {
    const winner = checkForWinner();
    if (winner === 'O') return 10 - depth; // Bot's win
    if (winner === 'X') return depth - 10; // Player's win
    if (board.every(cell => cell !== '')) return 0; // Draw

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, depth + 1, false);
                board[i] = ''; // Undo the move
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true);
                board[i] = ''; // Undo the move
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
};

// Check if there's a winner on the board
const checkForWinner = () => {
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameBoard[a] === 'O' && gameBoard[b] === 'O' && gameBoard[c] === 'O') return 'O';
        if (gameBoard[a] === 'X' && gameBoard[b] === 'X' && gameBoard[c] === 'X') return 'X';
    }
    return null; // No winner yet
};

// Reset the game
const resetGame = () => {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    isGameActive = true;
    currentPlayer = 'X';
    renderBoard();
};

resetButton.addEventListener('click', resetGame);
renderBoard();