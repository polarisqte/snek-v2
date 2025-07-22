const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("game-score");
const highscoreElement = document.getElementById("game-highscore");

const overlayElement = document.getElementById("game-canvas-overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlaySubtilte = document.getElementById("overlay-subtitle");

let GRID_SIZE = 20;
let CANVAS_WIDTH = 600;
let CANVAS_HEIGHT = 600;

let FOOD_COUNT = 3;

let FOOD_COLOR = "red";
let SNAKE_COLOR = "#46fb73";
let SNAKE_HEAD = "#3fdb66";

let GAME_SPEED = 0.1;
let MOVE_INTERVAL = 120;

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
    overlayTitle.textContent = data.title ? data.title : "start the game";
    overlaySubtilte.textContent = data.subtitle
      ? data.subtitle
      : "press space to begin";
  } else {
    overlayElement.style.display = "none";
  }
}

function getHighscore() {
  return localStorage.getItem("highscore") || 0;
}

function saveHighscore() {
  if (score > getHighscore()) {
    localStorage.setItem("highscore", score);
  }
}

function increaseScore() {
  score++;
  scoreElement.textContent = `score: ${score}`;
}

function initGame() {
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  snake = [{ x: 10, y: 10 }];
  previousSnake = [];
  directionQueue = [];
  direction = { x: 1, y: 0 };
  score = 0;
  food = [];
  for (let i = 0; i < FOOD_COUNT; i++) spawnFood();
  scoreElement.textContent = `score: ${score}`;
  highscoreElement.textContent = `highscore: ${getHighscore()}`;
}

function spawnFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor((Math.random() * CANVAS_WIDTH) / GRID_SIZE),
      y: Math.floor((Math.random() * CANVAS_HEIGHT) / GRID_SIZE),
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

  if (
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= CANVAS_WIDTH / GRID_SIZE ||
    newHead.y >= CANVAS_HEIGHT / GRID_SIZE
  )
    return endGame();

  if (snake.some((s, i) => i && s.x === newHead.x && s.y === newHead.y))
    return endGame();

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
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const delta = (performance.now() - lastTime) / MOVE_INTERVAL;

  ctx.fillStyle = FOOD_COLOR;
  food.forEach((f) => {
    ctx.fillRect(f.x * GRID_SIZE, f.y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
  });

  for (let i = 0; i < snake.length; i++) {
    const curr = snake[i];
    const prev = previousSnake[i] || curr;

    const interpX = prev.x + (curr.x - prev.x) * delta;
    const interpY = prev.y + (curr.y - prev.y) * delta;

    ctx.fillStyle = i === 0 ? SNAKE_HEAD : SNAKE_COLOR;
    ctx.fillRect(
      interpX * GRID_SIZE,
      interpY * GRID_SIZE,
      GRID_SIZE,
      GRID_SIZE
    );
  }
}

function gameLoop(timestamp) {
  if (!gameRunning) return;

  if (!lastTime) lastTime = timestamp;

  if (timestamp - lastTime >= MOVE_INTERVAL) {
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
}

function endGame() {
  gameRunning = false;

  saveHighscore();
  toggleOverlay(true, {
    title: "game over",
    subtitle: "press space to try again",
  });
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    startGame();
    return;
  }

  let input = null;
  switch (e.key) {
    case "ArrowUp":
      input = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      input = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      input = { x: -1, y: 0 };
      break;
    case "ArrowRight":
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
