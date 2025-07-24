const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("game-score");
const highscoreElement = document.getElementById("game-highscore");

const overlayElement = document.getElementById("game-canvas-overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlaySubtilte = document.getElementById("overlay-subtitle");

const settingsLock = document.getElementById("settings-lock");

let gameRunning = false;
let directionQueue = [];

let snake,
  previousSnake,
  direction,
  food,
  score,
  gameInterval,
  lastTime = 0;

function toggleOverlay(state, data) {
  if (state) {
    overlayElement.style.display = "flex";
    overlayTitle.textContent = data.title || "start the game";
    overlaySubtilte.textContent = data.subtitle || "press space to begin";
  } else {
    overlayElement.style.display = "none";
  }
}

function getHighscore() {
  return localStorage.getItem("highscore") || 0;
}

highscoreElement.textContent = `highscore: ${getHighscore()}`;

function saveHighscore() {
  if (score > getHighscore()) {
    localStorage.setItem("highscore", score);
    highscoreElement.textContent = `NEW! highscore: ${getHighscore()}`;
    highscoreElement.classList.add("highlight");
  }
}

function increaseScore() {
  score++;
  scoreElement.textContent = `score: ${score}`;
  scoreElement.classList.add("bump");
  scoreElement.addEventListener(
    "animationend",
    () => scoreElement.classList.remove("bump"),
    { once: true }
  );
}

function initGame() {
  const width = parseInt(GameSettings.get("CANVAS_WIDTH"));
  const height = parseInt(GameSettings.get("CANVAS_HEIGHT"));

  canvas.width = width;
  canvas.height = height;

  const gridSize = parseInt(GameSettings.get("GRID_SIZE"));
  const startX = Math.floor(width / gridSize / 2);
  const startY = Math.floor(height / gridSize / 2);

  snake = [{ x: startX, y: startY }];
  previousSnake = [];
  directionQueue = [];
  direction = { x: 1, y: 0 };
  score = 0;
  food = [];

  const foodCount = parseInt(GameSettings.get("FOOD_COUNT"));
  for (let i = 0; i < foodCount; i++) spawnFood();

  scoreElement.textContent = `score: ${score}`;
  highscoreElement.textContent = `highscore: ${getHighscore()}`;
  highscoreElement.classList.remove("highlight");
}

function spawnFood() {
  const gridSize = parseInt(GameSettings.get("GRID_SIZE"));
  const width = parseInt(GameSettings.get("CANVAS_WIDTH"));
  const height = parseInt(GameSettings.get("CANVAS_HEIGHT"));

  let newFood;
  do {
    newFood = {
      x: Math.floor((Math.random() * width) / gridSize),
      y: Math.floor((Math.random() * height) / gridSize),
    };
  } while (
    snake.some((s) => s.x === newFood.x && s.y === newFood.y) ||
    food.some((f) => f.x === newFood.x && f.y === newFood.y)
  );

  food.push(newFood);
}

function updateSnakePosition() {
  previousSnake = snake.map((seg) => ({ ...seg }));

  while (directionQueue.length) {
    const next = directionQueue.shift();
    const isOpposite = next.x === -direction.x && next.y === -direction.y;
    if (!isOpposite) {
      direction = next;
      break;
    }
  }

  const newHead = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const gridSize = parseInt(GameSettings.get("GRID_SIZE"));
  const width = parseInt(GameSettings.get("CANVAS_WIDTH"));
  const height = parseInt(GameSettings.get("CANVAS_HEIGHT"));

  if (
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= width / gridSize ||
    newHead.y >= height / gridSize
  ) {
    return endGame();
  }

  if (snake.some((s, i) => i && s.x === newHead.x && s.y === newHead.y)) {
    return endGame();
  }

  snake.unshift(newHead);

  const eatenIndex = food.findIndex(
    (f) => f.x === newHead.x && f.y === newHead.y
  );

  if (eatenIndex > -1) {
    increaseScore();
    food.splice(eatenIndex, 1);
    spawnFood();
  } else {
    snake.pop();
  }
}

function drawGame() {
  const gridSize = parseInt(GameSettings.get("GRID_SIZE"));
  const moveInterval = parseInt(GameSettings.get("MOVE_INTERVAL"));
  const foodColor = GameSettings.get("FOOD_COLOR");
  const snakeColor = GameSettings.get("SNAKE_COLOR");
  const snakeHead = GameSettings.get("SNAKE_HEAD_COLOR");

  ctx.clearRect(
    0,
    0,
    parseInt(GameSettings.get("CANVAS_WIDTH")),
    parseInt(GameSettings.get("CANVAS_HEIGHT"))
  );

  const delta = (performance.now() - lastTime) / moveInterval;

  ctx.fillStyle = foodColor;
  food.forEach((f) => {
    ctx.fillRect(f.x * gridSize, f.y * gridSize, gridSize, gridSize);
  });

  for (let i = 0; i < snake.length; i++) {
    const curr = snake[i];
    const prev = previousSnake[i] || curr;

    const interpX = prev.x + (curr.x - prev.x) * delta;
    const interpY = prev.y + (curr.y - prev.y) * delta;

    ctx.fillStyle = i === 0 ? snakeHead : snakeColor;
    ctx.fillRect(interpX * gridSize, interpY * gridSize, gridSize, gridSize);
  }
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  const moveInterval = parseInt(GameSettings.get("MOVE_INTERVAL"));

  if (!lastTime) lastTime = timestamp;

  if (timestamp - lastTime >= moveInterval) {
    updateSnakePosition();
    lastTime = timestamp;
  }

  drawGame();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  toggleOverlay(false);
  initGame();
  requestAnimationFrame(gameLoop);
  settingsLock.style.display = "flex";
}

function endGame() {
  gameRunning = false;
  saveHighscore();
  toggleOverlay(true, {
    title: "game over",
    subtitle: "press space to try again",
  });

  settingsLock.style.display = "none";
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    startGame();
    return;
  }

  let input = null;
  switch (e.key) {
    case "ArrowUp":
    case "w":
      input = { x: 0, y: -1 };
      break;
    case "ArrowDown":
    case "s":
      input = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
    case "a":
      input = { x: -1, y: 0 };
      break;
    case "ArrowRight":
    case "d":
      input = { x: 1, y: 0 };
      break;
  }

  if (input) {
    const lastQueued = directionQueue[directionQueue.length - 1] || direction;
    if (input.x !== lastQueued.x || input.y !== lastQueued.y) {
      if (directionQueue.length < 2) {
        directionQueue.push(input);
      }
    }
  }
});
