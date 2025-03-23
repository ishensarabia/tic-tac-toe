const playButton = document.getElementById("playButton");
let isGameStarted = false;

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

const Player = (marker) => {
  return { marker };
};

const GameController = (gameboard, player1, player2) => {
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
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
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
    return gameboard.getBoard().every((cell) => cell !== null);
  };

  const getCurrentPlayer = () => currentPlayer;

  // Disable further clicks on the board
  const disableBoard = () => {
    gameboard.board = Array(9).fill(null);

    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => (cell.style.pointerEvents = "none"));
  };

  return {
    disableBoard,
    playTurn,
    checkWinner,
    isDraw,
    getCurrentPlayer,
    gameboard,
  };
};

function createPlayerNamePrompt(player) {
  return new Promise((resolve) => {
    // Create the UI for the prompt
    const prompt = document.createElement("div");
    prompt.classList.add("prompt");

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Enter ${player.marker}'s name`;

    const button = document.createElement("button");
    button.textContent = "Submit";

    button.addEventListener("click", () => {
      const playerName = input.value.trim();
      if (playerName) {
        player.name = playerName;
        document.body.removeChild(prompt);
        resolve(); // Resolve the promise when the name is submitted
      }
    });

    prompt.appendChild(input);
    prompt.appendChild(button);
    document.body.appendChild(prompt);
  });
}

// Initialize the game
async function initializeGame() {
  // Get DOM elements
  const gameBoardElement = document.getElementById("gameBoard");
  const statusMessage = document.getElementById("statusMessage");
  const restartButton = document.getElementById("restartButton");

  // Create game components
  const gameboard = Gameboard();
  const player1 = Player("X");
  const player2 = Player("O");

  // Wait for players to enter their names
  await createPlayerNamePrompt(player1);
  await createPlayerNamePrompt(player2);

  const gameController = GameController(gameboard, player1, player2);

  // Helper function to render the gameboard
  const renderBoard = () => {
    gameBoardElement.innerHTML = ""; // Clear the board
    const board = gameboard.getBoard();

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
    // Check if the cell is already filled
    if (!gameController.gameboard.getBoard()[index]) {
      cell.textContent = gameController.getCurrentPlayer().marker;
      cell.style.color = "white";
      gameController.playTurn(index);

      // Check for winner or draw
      const winner = gameController.checkWinner();
      if (winner) {
        statusMessage.textContent = `${winner.name} wins!`;
        disableBoard();
      } else if (gameController.isDraw()) {
        statusMessage.textContent = "It's a draw!";
      } else {
        statusMessage.textContent = `${
          gameController.getCurrentPlayer().name
        }'s turn`;
      }
    }
  };

  // Restart the game
  const restartGame = () => {
    if (isGameStarted) {
      isGameStarted = false;
      gameController.disableBoard();
      initializeGame();
    }
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

playButton.addEventListener("click", () => {
  console.log("play button clicked");
  // Call initializeGame to start the game
  if (!isGameStarted) {
    isGameStarted = true;
    initializeGame();
  }
});
