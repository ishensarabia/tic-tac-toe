function createPlayerNamePrompt(player) {
  return new Promise((resolve) => {
    // Create the UI for the prompt
    const prompt = document.createElement("div");
    prompt.style.position = "fixed";
    prompt.style.top = "50%";
    prompt.style.left = "50%";
    prompt.style.transform = "translate(-50%, -50%)";
    prompt.style.backgroundColor = "#333";
    prompt.style.color = "white";
    prompt.style.padding = "20px";
    prompt.style.borderRadius = "10px";
    prompt.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    prompt.style.textAlign = "center";
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

const Game = (
  playButton,
  restartButton,
  gameBoardElement,
  statusMessageElement
) => {
  let isGameStarted = false;
  let gameboard = null;
  let player1 = null;
  let player2 = null;
  let gameController = null;

  const startGame = async () => {
    if (isGameStarted) return;

    isGameStarted = true;

    // Hide the play button
    playButton.style.display = "none";

    // Initialize game components
    gameboard = Gameboard();
    player1 = Player("X");
    player2 = Player("O");

    // Prompt players for their names
    await promptPlayerNames();

    // Initialize the game controller
    gameController = GameController(gameboard, player1, player2);

    // Render the gameboard
    renderBoard();

    // Set the initial status message
    updateStatusMessage(`${player1.name}'s (${player1.marker}) turn`);

    // Show the restart button
    restartButton.style.display = "block";
  };

  const promptPlayerNames = async () => {
    await createPlayerNamePrompt(player1);
    await createPlayerNamePrompt(player2);
  };

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

  const handleCellClick = (cell, index) => {
    if (!gameController.gameboard.getBoard()[index]) {
      cell.textContent = gameController.getCurrentPlayer().marker;
      cell.style.color = "white";
      gameController.playTurn(index);

      // Check for winner or draw
      const winner = gameController.checkWinner();
      if (winner) {
        updateStatusMessage(`${winner.name} (${winner.marker}) wins!`);
        disableBoard();
      } else if (gameController.isDraw()) {
        updateStatusMessage("It's a draw!");
      } else {
        updateStatusMessage(
          `${gameController.getCurrentPlayer().name}'s (${
            gameController.getCurrentPlayer().marker
          }) turn`
        );
      }
    }
  };

  const restartGame = () => {
    if (!isGameStarted) return;

    isGameStarted = false;

    startGame();
  };

  const disableBoard = () => {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => (cell.style.pointerEvents = "none"));
  };

  const updateStatusMessage = (message) => {
    statusMessageElement.textContent = message;
  };

  // Attach event listeners
  playButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", restartGame);

  return {
    startGame,
    restartGame,
    renderBoard,
    disableBoard,
    updateStatusMessage,
  };
};

// Initialize the game
const playButton = document.getElementById("playButton");
const restartButton = document.getElementById("restart-button");
const gameBoardElement = document.getElementById("gameBoard");
const statusMessageElement = document.getElementById("statusMessage");

const game = Game(
  playButton,
  restartButton,
  gameBoardElement,
  statusMessageElement
);
