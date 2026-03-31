let duck;
let dog;

let score = 0;

let ducksPerRound = 10;
let ducksHit = 0;
let ducksMissed = 0;

let shotsFired = 0;
let shotsLeft = 3;  
let roundOver = false;
let roundResultTimer = 0;

let hitMessageTimer = 0;
let missMessageTimer = 0;

let gameState = "intro"; 
let stateTimer = 0;

let perfectRound = false;
let perfectMessageTimer = 0;

function setup() {
  createCanvas(900, 500);
  pixelDensity(1);
  noSmooth();
  textFont("monospace");
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
    drawGrass();
    drawDuck();
    drawHUD();
    drawHitMessage();
    drawMissMessage();
  } else if (gameState === "gameOver") {
    drawGrass();
    drawHUD();
    drawGameOver();
    drawPerfectMessage();
  }

  if (gameState !== "intro") {
    drawCrosshair();
  }

  if (perfectMessageTimer > 0) {
    perfectMessageTimer--;
  }

  if (missMessageTimer > 0) {
    missMessageTimer--;
  }
}

function setupIntro() {
  gameState = "intro";
  score = 0;
  shotsFired = 0;
  ducksHit = 0;
  ducksMissed = 0;
  shotsLeft = 3;
  roundOver = false;
  roundResultTimer = 0;

  hitMessageTimer = 0;
  missMessageTimer = 0;
  perfectRound = false;
  perfectMessageTimer = 0;
  stateTimer = 0;

  dog = {
    x: -80,
    y: height - 110,
    baseY: height - 110,
    jumpOffset: 0,
    phase: "run"
  };
}

function startDogIntro() {
  gameState = "dogIntro";
  stateTimer = 0;
  dog.x = -80;
  dog.y = height - 110;
  dog.baseY = height - 110;
  dog.jumpOffset = 0;
  dog.phase = "run";
}

function drawBackground() {
  background(134, 197, 247);

  // simple NES-style clouds
  noStroke();
  fill(255);
  drawCloud(150, 90, 1.0);
  drawCloud(690, 72, 0.9);

  // distant horizon
  fill(124, 199, 92);
  rect(0, height - 145, width, 55);

  // bushes
  fill(30, 140, 50);
  for (let x = 20; x < width; x += 90) {
    ellipse(x, height - 95, 55, 35);
    ellipse(x + 22, height - 100, 50, 30);
    ellipse(x + 45, height - 95, 55, 35);
  }
}

function drawCloud(x, y, s) {
  ellipse(x, y, 52 * s, 28 * s);
  ellipse(x + 22 * s, y - 8 * s, 40 * s, 30 * s);
  ellipse(x + 45 * s, y, 52 * s, 28 * s);
}

function drawGrass() {
  noStroke();
  fill(24, 120, 44);
  rect(0, height - 90, width, 90);

  fill(18, 100, 36);
  for (let x = 0; x < width; x += 16) {
    triangle(x, height - 90, x + 7, height - 115, x + 14, height - 90);
  }
}

function drawIntroText() {
  fill(0, 150);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(44);
  text("DUCK HUNT", width / 2, height / 2 - 70);

  textSize(22);
  text("Click ducks to score before time runs out.", width / 2, height / 2 - 12);
  text("Retro-inspired p5.js version", width / 2, height / 2 + 22);

  fill(255, 230, 120);
  textSize(26);
  text("Press SPACE to start", width / 2, height / 2 + 84);
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
      resetDuck();
    }
  }
}

function drawDog() {
  if (dog.phase === "hide") return;

  push();
  translate(round(dog.x), round(dog.baseY + dog.jumpOffset));
  scale(-1, 1);

  noStroke();

  //  body (bigger + longer)
  fill(142, 92, 50);
  rect(-30, -12, 60, 24);

  // snout (bigger white face)
  fill(255);
  rect(-45, -18, 28, 20);

  // head top
  fill(163, 110, 62);
  rect(-45, -26, 28, 10);

  // ears (bigger + floppy)
  fill(50, 30, 20);
  rect(-47, -30, 8, 16);
  rect(-27, -30, 8, 16);

  // nose
  fill(0);
  rect(-47, -12, 6, 4);

  // eyes
  fill(0);
  rect(-34, -14, 3, 3);
  rect(-25, -14, 3, 3);

  //  legs 
  fill(142, 92, 50);
  rect(-18, 12, 8, 14);
  rect(-2, 12, 8, 14);
  rect(14, 10, 8, 16);

  // tail
  fill(142, 92, 50);
  rect(30, -6, 12, 6);

  // sniff text
  if (dog.phase === "sniff") {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("sniffing around...", 0, -42);
  }

  pop();
}

function resetDuck() {
  if (ducksHit + ducksMissed >= ducksPerRound) {
    if (ducksHit === ducksPerRound) {
      score += 5000;
      perfectRound = true;
      perfectMessageTimer = 150;
    }

    gameState = "gameOver";
    return;
  }

  shotsLeft = 3;
  let spawnFromGrass = random() < 0.5;
  let direction = random() < 0.5 ? 1 : -1;

  if (spawnFromGrass) {
    let isFast = random() < 0.15;
    let spawnX = random(160, width - 160);
    direction = spawnX < width / 2 ? 1 : -1;

    duck = {
      x: spawnX,
      y: height - 120,
      w: 46,
      h: 26,
      speedX: random(isFast ? 8 : 6, isFast ? 10 : 8) * direction,
      speedY: -5.2,
      wingOffset: 0,
      launchFrames: 24,
      state: "flying",
      gravity: 0.35,
      fallSpeed: 0,
      fallTimer: 0,
      facing: direction,
      isFast: isFast
    };
  } else {
    let isFast = random() < 0.15;

    duck = {
      x: direction === 1 ? -60 : width + 60,
      y: random(80, height - 210),
      w: 46,
      h: 26,
      speedX: random(isFast ? 8.5 : 6.5, isFast ? 11 : 9) * direction,
      speedY: random(-2, 2),
      wingOffset: 0,
      launchFrames: 0,
      state: "flying",
      gravity: 0.35,
      fallSpeed: 0,
      fallTimer: 0,
      facing: direction,
      isFast: isFast
    };
  }
}


function drawPerfectMessage() {
  if (perfectMessageTimer > 0) {
    fill(255, 215, 0);
    textAlign(CENTER, CENTER);
    textSize(36);
    text("PERFECT!", width / 2, 90);
  }
}

function updateDuck() {
  if (duck.state === "falling") {
    duck.y += duck.fallSpeed;
    duck.fallSpeed += duck.gravity;
    duck.wingOffset = 0;

    if (duck.y > height - 92) {
      resetDuck();
    }

    if (hitMessageTimer > 0) hitMessageTimer--;
    return;
  }

  duck.x += duck.speedX;
  duck.y += duck.speedY;
  duck.facing = duck.speedX >= 0 ? -1 : 1;
  duck.wingOffset = sin(frameCount * 0.45) * 8;

  if (duck.launchFrames > 0) {
    duck.launchFrames--;
    duck.speedY += 0.15;

    if (duck.launchFrames === 0) {
      duck.speedY = random(-2, 2);
    }
  }

  // small random flutter every frame
  duck.speedY += random(-0.18, 0.18);
  duck.speedY = constrain(duck.speedY, -3, 3);

  if (duck.y < 70) {
    duck.speedY = abs(duck.speedY);
  }

  if (duck.y > height - 150) {
    duck.speedY = -abs(duck.speedY);
  }

  if (duck.x > width + 80 || duck.x < -80) {
    ducksMissed++;
    resetDuck();
  }
  if (hitMessageTimer > 0) hitMessageTimer--;
}

function drawDuck() {
  push();
  translate(round(duck.x), round(duck.y));
  scale(duck.facing, 1);

  if (duck.state === "falling") {
    rotate(radians(90));
  }

  noStroke();

  // pixel-style wing
  fill(86, 56, 24);
  rect(-2, -8 + round(duck.wingOffset * 0.3), 14, 8);
  rect(8, -14 + round(duck.wingOffset * 0.3), 8, 8);

  // tail
  fill(65, 40, 14);
  rect(18, -6, 8, 8);
  rect(26, -10, 6, 6);

  // body
  fill(112, 74, 31);
  rect(-16, -10, 30, 20);
  rect(10, -6, 8, 12);

  // chest highlight
  fill(148, 103, 55);
  rect(-10, -2, 10, 8);

  // neck / head
  fill(34, 122, 74);
  rect(-24, -14, 10, 10);
  rect(-32, -14, 10, 10);
  rect(-24, -6, 8, 6);

  // beak
  fill(246, 182, 28);
  rect(-38, -12, 6, 4);
  rect(-44, -10, 6, 4);

  // eye
  fill(255);
  rect(-28, -12, 3, 3);
  fill(0);
  rect(-27, -11, 1, 1);

  pop();
}

function drawHUD() {
  let hudY = height - 70;

  // bottom panel
  fill(90, 60, 10);
  rect(0, height - 90, width, 90);

  stroke(255);
  noFill();

  // SHOT box
  rect(40, hudY - 10, 120, 50);
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textSize(18);
  text("SHOT", 55, hudY);

  fill(0, 150, 255);
  for (let i = 0; i < shotsLeft; i++) {
    rect(55 + i * 22, hudY + 24, 14, 10);
  }

  // HIT row box
  stroke(255);
  noFill();
  rect(250, hudY - 10, 330, 50);

  noStroke();
  fill(255);
  text("HIT", 265, hudY);

  for (let i = 0; i < ducksPerRound; i++) {
    if (i < ducksHit) {
      fill(255, 60, 60);
    } else if (i < ducksHit + ducksMissed) {
      fill(255);
    } else {
      fill(80);
    }
    rect(315 + i * 24, hudY + 18, 14, 14);
  }

  // Score box
  stroke(255);
  noFill();
  rect(680, hudY - 10, 170, 50);

  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  text("SCORE", 700, hudY);
  text(nf(score, 6), 700, hudY + 22);
}

function drawCrosshair() {
  stroke(220, 30, 30);
  strokeWeight(2);
  line(mouseX - 12, mouseY, mouseX + 12, mouseY);
  line(mouseX, mouseY - 12, mouseX, mouseY + 12);
  noFill();
  circle(mouseX, mouseY, 22);
}

function drawMissMessage() {
  if (missMessageTimer > 0) {
    fill(255, 80, 80);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("MISS!", width / 2, 85);
  }
}

function mousePressed() {
  if (gameState !== "playing") return;
  if (duck.state !== "flying") return;
  if (shotsLeft <= 0) return;

  shotsFired++;
  shotsLeft--;

  if (hitDuck(mouseX, mouseY)) {
    score += 500;
    ducksHit++;

    hitMessageTimer = 20;
    missMessageTimer = 0; // ✅ prevent overlap

    duck.state = "falling";
    duck.fallSpeed = 1.5;
    duck.speedX = 0;
    duck.speedY = 0;

  } else {
    missMessageTimer = 20;
    hitMessageTimer = 0; 

    if (shotsLeft === 0) {
      ducksMissed++;
      resetDuck();
    }
  }
}

function hitDuck(px, py) {
  return (
    px > duck.x - duck.w / 2 &&
    px < duck.x + duck.w / 2 &&
    py > duck.y - duck.h / 2 - 6 &&
    py < duck.y + duck.h / 2 + 6
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
  text("Ducks Missed: " + ducksMissed, width / 2, height / 2 + 25);

  let accuracy = shotsFired > 0 ? round((ducksHit / shotsFired) * 100) : 0;
  textSize(22);
  text("Accuracy: " + accuracy + "%", width / 2, height / 2 + 60);

  if (perfectRound) {
    fill(255, 215, 0);
    textSize(24);
    text("Perfect Round Bonus: 5000", width / 2, height / 2 + 95);
  }

  fill(255);
  textSize(20);
  text("Press R to restart", width / 2, height / 2 + 130);
}

function keyPressed() {
  if (keyCode === 32 && gameState === "intro") {
    startDogIntro();
    return false;
  }

  if ((key === "r" || key === "R") && gameState === "gameOver") {
    setupIntro();
    return false;
  }
}
