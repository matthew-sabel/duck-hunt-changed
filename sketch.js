let duck;
let score = 0;
let shots = 0;
let misses = 0;
let escaped = 0;

let gameTime = 60 * 30; // 30 seconds at 60 FPS
let gameOver = false;

let hitMessageTimer = 0;

function setup() {
  createCanvas(900, 500);
  resetDuck();
  textFont("Arial");
}

function draw() {
  drawBackground();

  if (!gameOver) {
    updateDuck();
    drawDuck();
    drawHUD();
    drawHitMessage();

    gameTime--;

    if (gameTime <= 0) {
      gameOver = true;
    }
  } else {
    drawHUD();
    drawGameOver();
  }

  drawCrosshair();
}

function drawBackground() {
  background(135, 206, 235);

  noStroke();
  fill(70, 170, 70);
  rect(0, height - 90, width, 90);

  fill(255);
  ellipse(140, 90, 70, 45);
  ellipse(175, 90, 80, 55);
  ellipse(215, 90, 65, 40);
}

function resetDuck() {
  duck = {
    x: -60,
    y: random(80, height - 150),
    w: 50,
    h: 30,
    speedX: random(4, 6),
    speedY: random(-1.5, 1.5),
    wingOffset: 0
  };
}

function updateDuck() {
  duck.x += duck.speedX;
  duck.y += duck.speedY;
  duck.wingOffset = sin(frameCount * 0.35) * 8;

  if (duck.y < 60 || duck.y > height - 130) {
    duck.speedY *= -1;
  }

  if (duck.x > width + 40) {
    escaped++;
    resetDuck();
  }

  if (hitMessageTimer > 0) {
    hitMessageTimer--;
  }
}

function drawDuck() {
  push();
  translate(duck.x, duck.y);

  noStroke();

  // body
  fill(90, 60, 20);
  ellipse(0, 0, duck.w, duck.h);

  // head
  fill(70, 40, 10);
  ellipse(-18, -12, 22, 16);

  // beak
  fill(255, 220, 0);
  triangle(-28, -12, -40, -8, -28, -4);

  // wing
  fill(120, 80, 30);
  triangle(-5, 0, 18, -18 + duck.wingOffset, 12, 5);

  // eye
  fill(0);
  ellipse(-22, -14, 3, 3);

  pop();
}

function drawHUD() {
  fill(0);
  textSize(22);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 20);
  text("Shots: " + shots, 20, 50);
  text("Misses: " + misses, 20, 80);
  text("Escaped: " + escaped, 20, 110);

  let accuracy = shots > 0 ? round((score / shots) * 100) : 0;
  text("Accuracy: " + accuracy + "%", 20, 140);

  let secondsLeft = ceil(gameTime / 60);
  textAlign(RIGHT, TOP);
  text("Time: " + max(secondsLeft, 0), width - 20, 20);
}

function drawCrosshair() {
  stroke(255, 0, 0);
  strokeWeight(2);
  line(mouseX - 12, mouseY, mouseX + 12, mouseY);
  line(mouseX, mouseY - 12, mouseX, mouseY + 12);
  noFill();
  circle(mouseX, mouseY, 22);
}

function mousePressed() {
  if (gameOver) {
    return;
  }

  shots++;

  if (hitDuck(mouseX, mouseY)) {
    score++;
    hitMessageTimer = 20;
    resetDuck();
  } else {
    misses++;
  }
}

function hitDuck(px, py) {
  return (
    px > duck.x - duck.w / 2 &&
    px < duck.x + duck.w / 2 &&
    py > duck.y - duck.h / 2 - 10 &&
    py < duck.y + duck.h / 2 + 10
  );
}

function drawHitMessage() {
  if (hitMessageTimer > 0) {
    fill(255, 215, 0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("HIT!", width / 2, 50);
  }
}

function drawGameOver() {
  fill(0, 180);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(42);
  text("Game Over", width / 2, height / 2 - 60);

  textSize(28);
  text("Final Score: " + score, width / 2, height / 2 - 10);
  text("Ducks Escaped: " + escaped, width / 2, height / 2 + 25);

  let accuracy = shots > 0 ? round((score / shots) * 100) : 0;
  textSize(22);
  text("Accuracy: " + accuracy + "%", width / 2, height / 2 + 60);

  textSize(20);
  text("Press R to restart", width / 2, height / 2 + 100);
}

function keyPressed() {
  if ((key === "r" || key === "R") && gameOver) {
    restartGame();
  }
}

function restartGame() {
  score = 0;
  shots = 0;
  misses = 0;
  escaped = 0;
  gameTime = 60 * 30;
  gameOver = false;
  hitMessageTimer = 0;
  resetDuck();
}