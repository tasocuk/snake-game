// yılan oyunu, canvas üzerine çiziyorum

const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");

const CELL = 20;                   // hücre boyutu (px)
const COLS = canvas.width / CELL;
const ROWS = canvas.height / CELL;
const SPEED = 120;                 // adım hızı (ms), düşük = daha hızlı

let snake, direction, nextDirection, food, score, best, timer, running;

best = Number(localStorage.getItem("snake.best") || 0);
bestEl.textContent = best;

function reset() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  placeFood();
}

function placeFood() {
  // Yılanın üstüne denk gelmeyen rastgele bir konum seç.
  do {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
}

function step() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  // Duvara veya kendine çarpma kontrolü.
  const hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
  const hitSelf = snake.some((s) => s.x === head.x && s.y === head.y);
  if (hitWall || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreEl.textContent = score;
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#161b22";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Yem
  ctx.fillStyle = "#e74c3c";
  ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);

  // Yılan
  snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? "#58d68d" : "#2ecc71";
    ctx.fillRect(seg.x * CELL, seg.y * CELL, CELL - 1, CELL - 1);
  });
}

function gameOver() {
  clearInterval(timer);
  running = false;

  if (score > best) {
    best = score;
    localStorage.setItem("snake.best", best);
    bestEl.textContent = best;
  }

  overlayText.innerHTML = `Oyun bitti! Skorun: <b>${score}</b><br />Tekrar oynamak için bir tuşa bas`;
  overlay.classList.remove("hidden");
}

function start() {
  reset();
  overlay.classList.add("hidden");
  running = true;
  clearInterval(timer);
  timer = setInterval(step, SPEED);
  draw();
}

const KEYS = {
  ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 },
};

document.addEventListener("keydown", (e) => {
  // Boşluk: duraklat / devam et
  if (e.key === " ") {
    if (!running) return;
    if (timer) {
      clearInterval(timer);
      timer = null;
      overlayText.textContent = "Duraklatıldı — devam için Boşluk";
      overlay.classList.remove("hidden");
    } else {
      overlay.classList.add("hidden");
      timer = setInterval(step, SPEED);
    }
    return;
  }

  const dir = KEYS[e.key];
  if (!dir) return;
  e.preventDefault();

  if (!running) {
    start();
    nextDirection = dir;
    return;
  }

  // 180 derece dönüşü engelle.
  if (dir.x !== -direction.x && dir.y !== -direction.y) {
    nextDirection = dir;
  }
});

reset();
draw();
