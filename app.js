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

class Gameboard {
  constructor() {
    this.board = Array(9).fill(null);
  }

  placeMarker(index, marker) {
    if (this.board[index] === null) {
      this.board[index] = marker;
      return true;
    }
    return false;
  }

  getBoard() {
    return this.board;
  }

  resetBoard() {
    this.board = Array(9).fill(null);
  }
}

class Player {
  constructor(name, marker) {
    this.name = name;
    this.marker = marker;
  }
}

class GameController {
  constructor(gameboard, player1, player2) {
    this.gameboard = gameboard;
    this.player1 = player1;
    this.player2 = player2;
    this.currentPlayer = player1;
  }

  switchTurn() {
    this.currentPlayer =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;
  }

  playTurn(index) {
    if (this.gameboard.placeMarker(index, this.currentPlayer.marker)) {
      this.switchTurn();
    }
  }

  checkWinner() {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    for (const combo of winningCombinations) {
      const [a, b, c] = combo;
      const board = this.gameboard.getBoard();
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return this.currentPlayer === this.player1
          ? this.player2
          : this.player1; // Return the winner
      }
    }

    return null;
  }

  isDraw() {
    return this.gameboard.getBoard().every((cell) => cell !== null);
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  resetGame() {
    this.gameboard.resetBoard();
    this.currentPlayer = this.player1;
  }
}

class Game {
  constructor() {
    const playButton = document.getElementById("playButton");
    const restartButton = document.getElementById("restart-button");
    const gameBoardElement = document.getElementById("gameBoard");
    const statusMessageElement = document.getElementById("statusMessage");
    this.playButton = playButton;
    this.restartButton = restartButton;
    this.gameBoardElement = gameBoardElement;
    this.statusMessageElement = statusMessageElement;
    this.isGameStarted = false;
    this.gameboard = null;
    this.player1 = null;
    this.player2 = null;
    this.gameController = null;

    // Attach event listeners
    this.playButton.addEventListener("click", () => this.startGame());
    this.restartButton.addEventListener("click", () => this.restartGame());
  }

  async startGame() {
    if (this.isGameStarted) return;

    this.isGameStarted = true;

    // Hide the play button
    this.playButton.style.display = "none";

    // Initialize game components
    this.gameboard = new Gameboard();
    this.player1 = new Player("Player X", "X");
    this.player2 = new Player("Player O", "O");

    // Prompt players for their names
    await this.promptPlayerNames();

    // Initialize the game controller
    this.gameController = new GameController(
      this.gameboard,
      this.player1,
      this.player2
    );

    // Render the gameboard
    this.renderBoard();

    // Set the initial status message
    this.updateStatusMessage(
      `${this.player1.name}'s (${this.player1.marker}) turn`
    );
  }

  async promptPlayerNames() {
    await createPlayerNamePrompt(this.player1);
    await createPlayerNamePrompt(this.player2);
    // Show the restart button
    this.restartButton.style.display = "block";
  }

  renderBoard() {
    this.gameBoardElement.innerHTML = ""; // Clear the board
    const board = this.gameboard.getBoard();

    board.forEach((_, index) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.index = index;

      // Add click event listener for each cell
      cell.addEventListener("click", () => this.handleCellClick(cell, index));
      this.gameBoardElement.appendChild(cell);
    });
  }

  handleCellClick(cell, index) {
    if (!this.gameController.gameboard.getBoard()[index]) {
      cell.textContent = this.gameController.getCurrentPlayer().marker;
      cell.style.color = "white";
      this.gameController.playTurn(index);

      // Check for winner or draw
      const winner = this.gameController.checkWinner();
      if (winner) {
        this.updateStatusMessage(`${winner.name} (${winner.marker}) wins!`);
        this.disableBoard();
      } else if (this.gameController.isDraw()) {
        this.updateStatusMessage("It's a draw!");
      } else {
        this.updateStatusMessage(
          `${this.gameController.getCurrentPlayer().name}'s (${
            this.gameController.getCurrentPlayer().marker
          }) turn`
        );
      }
    }
  }

  restartGame() {
    if (!this.isGameStarted) return;

    this.isGameStarted = false;
    this.disableBoard();
    this.startGame();
  }

  disableBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => (cell.style.pointerEvents = "none"));
  }

  updateStatusMessage(message) {
    this.statusMessageElement.textContent = message;
  }
}

// Initialize the game
const game = new Game();
