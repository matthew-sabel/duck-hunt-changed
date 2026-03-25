let duck;
let dog;

let score = 0;
let shots = 0;
let misses = 0;
let escaped = 0;

let gameTime = 60 * 30; // 30 seconds
let gameOver = false;
let hitMessageTimer = 0;

let gameState = "intro"; // intro, dogIntro, playing, gameOver
let stateTimer = 0;

function setup() {
  createCanvas(900, 500);
  textFont("Arial");
  setupIntro();
}

function draw() {
  drawBackground();

  if (gameState === "intro") {
    drawGrass();
    drawIntroText();
  } else if (gameState === "dogIntro") {
    updateDogIntro();
    drawGrass();
    drawDog();
    drawIntroBanner();
  } else if (gameState === "playing") {
    updateDuck();
    drawDuck();
    drawGrass();
    drawHUD();
    drawHitMessage();

    gameTime--;
    if (gameTime <= 0) {
      gameState = "gameOver";
      gameOver = true;
    }
  } else if (gameState === "gameOver") {
    drawGrass();
    drawHUD();
    drawGameOver();
  }

  if (gameState !== "intro") {
    drawCrosshair();
  }
}

function setupIntro() {
  gameState = "intro";
  gameOver = false;
  score = 0;
  shots = 0;
  misses = 0;
  escaped = 0;
  gameTime = 60 * 30;
  hitMessageTimer = 0;
  stateTimer = 0;

  dog = {
    x: -80,
    y: height - 105,
    baseY: height - 105,
    jumpOffset: 0,
    phase: "run"
  };

  resetDuck(true);
}

function startDogIntro() {
  gameState = "dogIntro";
  stateTimer = 0;
  dog.x = -80;
  dog.y = height - 105;
  dog.baseY = height - 105;
  dog.jumpOffset = 0;
  dog.phase = "run";
  resetDuck(true);
}

function drawBackground() {
  background(135, 206, 235);

  noStroke();
  fill(255);
  ellipse(140, 90, 70, 45);
  ellipse(175, 90, 80, 55);
  ellipse(215, 90, 65, 40);

  ellipse(640, 70, 60, 38);
  ellipse(675, 70, 70, 44);
  ellipse(710, 70, 58, 34);

  fill(110, 190, 110);
  rect(0, height - 120, width, 120);
}

function drawGrass() {
  noStroke();
  fill(50, 150, 50);
  rect(0, height - 90, width, 90);

  fill(40, 130, 40);
  for (let x = 0; x < width; x += 18) {
    triangle(x, height - 90, x + 8, height - 115, x + 16, height - 90);
  }
}

function drawIntroText() {
  fill(0, 160);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(42);
  text("Duck Hunt", width / 2, height / 2 - 70);

  textSize(22);
  text("Click ducks to score points before time runs out.", width / 2, height / 2 - 15);
  text("Inspired by the NES classic.", width / 2, height / 2 + 20);

  fill(255, 230, 120);
  textSize(26);
  text("Press SPACE to start", width / 2, height / 2 + 80);
}

function drawIntroBanner() {
  fill(255);
  textAlign(CENTER, TOP);
  textSize(22);
  text("Get ready...", width / 2, 24);
}

function updateDogIntro() {
  stateTimer++;

  if (dog.phase === "run") {
    dog.x += 4.2;
    dog.jumpOffset = sin(frameCount * 0.5) * 4;

    if (dog.x >= width * 0.28) {
      dog.phase = "sniff";
      stateTimer = 0;
      dog.jumpOffset = 0;
    }
  } else if (dog.phase === "sniff") {
    if (stateTimer > 40) {
      dog.phase = "jump";
      stateTimer = 0;
    }
  } else if (dog.phase === "jump") {
    dog.jumpOffset = -sin((stateTimer / 35) * PI) * 55;
    if (stateTimer >= 35) {
      dog.phase = "hide";
      stateTimer = 0;
      dog.jumpOffset = 0;
    }
  } else if (dog.phase === "hide") {
    if (stateTimer > 20) {
      gameState = "playing";
      resetDuck(true);
    }
  }
}

function drawDog() {
  if (dog.phase === "hide") {
    return;
  }

  push();
  translate(dog.x, dog.baseY + dog.jumpOffset);

  noStroke();

  fill(125, 80, 45);
  ellipse(0, 0, 55, 32);

  fill(145, 95, 55);
  ellipse(-28, -12, 28, 24);

  fill(90, 55, 30);
  ellipse(-35, -22, 10, 18);
  ellipse(-22, -22, 10, 18);

  fill(0);
  ellipse(-34, -12, 3, 3);
  ellipse(-44, -10, 5, 4);

  fill(125, 80, 45);
  rect(-12, 10, 6, 20, 2);
  rect(4, 10, 6, 20, 2);
  rect(18, 8, 6, 22, 2);

  stroke(125, 80, 45);
  strokeWeight(4);
  noFill();
  arc(28, -6, 24, 24, -0.6, 1.1);

  if (dog.phase === "sniff") {
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(16);
    text("sniff...", 5, -38);
  }

  pop();
}

function resetDuck() {

  // decide spawn type
  let spawnFromGrass = random() < 0.5;

  // decide horizontal direction
  let direction = random() < 0.5 ? 1 : -1;

  if (spawnFromGrass) {

    // grass launch spawn
    duck = {
      x: random(100, width - 100),
      y: height - 120,

      w: 50,
      h: 30,

      speedX: random(3, 5) * (random() < 0.5 ? 1 : -1),
      speedY: -5,

      wingOffset: 0,
      launchFrames: 25
    };

  } else {

    // off screen spawn
    duck = {
      x: direction === 1 ? -60 : width + 60,
      y: random(80, height - 200),

      w: 50,
      h: 30,

      speedX: random(3.5, 6) * direction,
      speedY: random(-2, 2),

      wingOffset: 0,
      launchFrames: 0
    };
  }
}

function updateDuck() {

  duck.x += duck.speedX;
  duck.y += duck.speedY;

  duck.wingOffset = sin(frameCount * 0.45) * 8;

  // launch upward from grass
  if (duck.launchFrames > 0) {
    duck.launchFrames--;
    duck.speedY += 0.15;

    if (duck.launchFrames === 0) {
      duck.speedY = random(-2, 2);
    }
  }

  // add slight random motion every frame
  duck.speedY += random(-0.2, 0.2);

  // limit vertical speed so it doesn't go crazy
  duck.speedY = constrain(duck.speedY, -3, 3);

  // bounce off top and bottom
  if (duck.y < 70) {
    duck.speedY = abs(duck.speedY);
  }

  if (duck.y > height - 150) {
    duck.speedY = -abs(duck.speedY);
  }

  // if duck escapes
  if (duck.x > width + 40) {
    escaped++;
    resetDuck(true);
  }

  if (hitMessageTimer > 0) {
    hitMessageTimer--;
  }
}

function drawDuck() {
  push();
  translate(duck.x, duck.y);

  noStroke();
  fill(90, 60, 20);
  ellipse(0, 0, duck.w, duck.h);

  fill(70, 40, 10);
  ellipse(-18, -12, 22, 16);

  fill(255, 220, 0);
  triangle(-28, -12, -40, -8, -28, -4);

  fill(120, 80, 30);
  triangle(-5, 0, 18, -18 + duck.wingOffset, 12, 5);

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
  if (gameState !== "playing") {
    return;
  }

  shots++;

  if (hitDuck(mouseX, mouseY)) {
    score++;
    hitMessageTimer = 20;
    resetDuck(true);
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
  if (key === " " && gameState === "intro") {
    startDogIntro();
  }

  if ((key === "r" || key === "R") && gameState === "gameOver") {
    setupIntro();
  }
}