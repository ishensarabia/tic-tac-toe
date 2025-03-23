class Gameboard {
  constructor() {
    this.board = Array(9).fill(null); // Initialize a 3x3 board as a flat array
  }

  placeMarker(index, marker) {
    if (this.board[index] === null) {
      this.board[index] = marker;
      return true;
    }
    return false;
  }

  resetBoard() {
    this.board.fill(null);
  }

  getBoard() {
    return this.board;
  }
}

class Player {
  constructor(name, marker) {
    this.name = name;
    this.marker = marker;
  }
}

class GameController {
  constructor(player1, player2, gameboard) {
    this.player1 = player1;
    this.player2 = player2;
    this.gameboard = gameboard;
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
      if (
        this.gameboard.board[a] &&
        this.gameboard.board[a] === this.gameboard.board[b] &&
        this.gameboard.board[a] === this.gameboard.board[c]
      ) {
        return this.gameboard.board[a];
      }
    }

    return null;
  }

  isDraw() {
    return (
      this.gameboard.board.every((cell) => cell !== null) && !this.checkWinner()
    );
  }

  endGame() {
    this.gameboard.resetBoard();
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      cell.textContent = "";
      cell.style.color = "black";
    });
  }
}

// Initialize the game
function initializeGame() {
  // Get the gameboard element
  const gameBoardElement = document.getElementById("gameBoard");
  const statusMessage = document.getElementById("statusMessage");
  const restartButton = document.getElementById("restartButton");
  const gameboard = new Gameboard();
  const player1 = new Player("Player X", "X");
  const player2 = new Player("Player O", "O");
  const gameController = new GameController(player1, player2, gameboard);

  // Clear the gameboard
  gameBoardElement.innerHTML = "";
  gameController.gameboard.board = Array(9).fill(null);

  // Render the cells
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;

    // Add click event listener for each cell
    cell.addEventListener("click", () => {
      console.log(
        i,
        gameController.gameboard.board[i],
        gameController.gameboard.board
      );
      if (!gameController.gameboard.board[i]) {
        gameController.playTurn(i);
        cell.style.color = "white";
        cell.textContent = gameController.currentPlayer.marker;

        // Check for winner or draw
        const winner = gameController.checkWinner();
        if (winner) {
          statusMessage.textContent = `${gameController.currentPlayer.name} wins!`;
          disableBoard();
        } else if (gameController.isDraw()) {
          statusMessage.textContent = "It's a draw!";
        } else {
          console.log("switching turn");
          statusMessage.textContent = `${gameController.currentPlayer.name}'s turn`;
        }
      }
    });

    gameBoardElement.appendChild(cell);
  }

  // Set initial status
  statusMessage.textContent = `${gameController.currentPlayer.name}'s turn`;

  // Add click event listener for the restart button
  restartButton.addEventListener("click", () => {
    gameController.endGame();
    statusMessage.textContent = `${gameController.currentPlayer.name}'s turn`;
    enableBoard();
    initializeGame();
  });
}

function disableBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => (cell.style.pointerEvents = "none"));
}

function enableBoard() {
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => (cell.style.pointerEvents = "auto"));
}

// Call initializeGame to start the game
initializeGame();
