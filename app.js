const Gameboard = () => {
  const board = Array(9).fill(null);

  const placeMarker = (index, marker) => {
    if (board[index] === null) {
      board[index] = marker;
      return true;
    }
    return false;
  };

  const getBoard = () => board;

  return { placeMarker, getBoard };
};

const Player = (name, marker) => {
  return { name, marker };
};

const GameController = (player1Name, player2Name) => {
  const gameboard = Gameboard();
  const player1 = Player(player1Name, 'X');
  const player2 = Player(player2Name, 'O');
  let currentPlayer = player1;

  const switchTurn = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const playTurn = (index) => {
    if (gameboard.placeMarker(index, currentPlayer.marker)) {
      switchTurn();
    }
  };

  const checkWinner = () => {
    const winningCombinations = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      if (
        gameboard.getBoard()[a] &&
        gameboard.getBoard()[a] === gameboard.getBoard()[b] &&
        gameboard.getBoard()[a] === gameboard.getBoard()[c]
      ) {
        return currentPlayer === player1 ? player2 : player1;
      }
    }

    return null;
  };

  const isDraw = () => {
    return gameboard.getBoard().every(cell => cell !== null);
  };

  const getCurrentPlayer = () => currentPlayer;


  return { playTurn, checkWinner, isDraw, getCurrentPlayer, gameboard };
};


// Initialize the game
function initializeGame() {
  // Get DOM elements
  const gameBoardElement = document.getElementById("gameBoard");
  const statusMessage = document.getElementById("statusMessage");
  const restartButton = document.getElementById("restartButton");

  // Create game components
  const gameboard = Gameboard();
  const player1 = Player("Player X", "X");
  const player2 = Player("Player O", "O");
  const gameController = GameController(player1.name, player2.name);

  // Helper function to render the gameboard
  const renderBoard = () => {
    gameBoardElement.innerHTML = ""; // Clear the board
    const board = gameController.gameboard.getBoard();

    board.forEach((_, index) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = index;

      // Add click event listener for each cell
      cell.addEventListener("click", () => handleCellClick(cell, index));
      gameBoardElement.appendChild(cell);
    });
  };

  statusMessage.textContent = `${player1.name}'s turn`;


  // Handle cell click
  const handleCellClick = (cell, index) => {
    if (!gameController.gameboard.getBoard()[index]) {
      gameController.playTurn(index);
      cell.textContent = gameController.getCurrentPlayer().marker;
      cell.style.color = "white";

      // Check for winner or draw
      const winner = gameController.checkWinner();
      if (winner) {
        statusMessage.textContent = `${winner.name} wins!`;
        disableBoard();
      } else if (gameController.isDraw()) {
        statusMessage.textContent = "It's a draw!";
      } else {
        statusMessage.textContent = `${gameController.getCurrentPlayer().name}'s turn`;
      }
    }
  };

  // Disable further clicks on the board
  const disableBoard = () => {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => (cell.style.pointerEvents = "none"));
  };

  // Restart the game
  const restartGame = () => {
    gameController.gameboard.board = Array(9).fill(null);
    initializeGame();
  };

  // Attach restart button event listener
  restartButton.addEventListener("click", restartGame);

  // Initialize the game
  statusMessage.textContent = `${player1.name}'s turn`;
  renderBoard();
}

function disableBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => (cell.style.pointerEvents = "none"));
}

function enableBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => (cell.style.pointerEvents = "auto"));
}

const playButton = document.getElementById("playButton");

playButton.addEventListener("click", () => {
  console.log("play button clicked");
  // Call initializeGame to start the game
  initializeGame();
});
