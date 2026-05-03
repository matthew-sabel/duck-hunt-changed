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

let dogRetrieveTimer = 0;
let dogRetrieveX = 0;
let dogPreDelayTimer = 0;
let deadDuckFacing = 1;

const DUCK_TIMEOUT_MS = 3500;

let audioCtx = null;

let duckSpawnTime  = 0;
let firstShotFired = false;
let firstShotTimes = [];
let survivalTimes  = [];
let shotTimestamps = [];
let allShotGaps    = [];
let allRounds = [];
let playNum   = 0;

let grassBack  = [];  // precomputed so randomSeed() never poisons duck spawns
let grassFront = [];

let gunBuffer = null;

async function loadGunSound() {
  try {
    let ctx  = getAudioCtx();
    let resp = await fetch("gunshot.mp3");
    let arr  = await resp.arrayBuffer();
    gunBuffer = await ctx.decodeAudioData(arr);
  } catch (e) {}
}

function setup() {
  createCanvas(900, 500);
  pixelDensity(1);
  noSmooth();
  textFont("monospace");
  precomputeGrass();
  setupIntro();
  loadGunSound();
}

function precomputeGrass() {
  grassBack  = [];
  grassFront = [];
  randomSeed(42);
  for (let x = 0; x < 900; x += 13) {
    grassBack.push({ x, h: random(32, 52) });
  }
  randomSeed(17);
  for (let x = -4; x < 900; x += 17) {
    grassFront.push({ x, h: random(55, 82) });
  }
  randomSeed();  // unseed — restore time-based RNG so duck spawns are truly random
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
    drawFlyAway();
  } else if (gameState === "dogDelay") {
    dogPreDelayTimer++;
    if (dogPreDelayTimer >= 12) startDogRetrieve();
    drawGrass();
    drawHUD();
    drawHitMessage();
  } else if (gameState === "dogRetrieve") {
    updateDogRetrieve();
    drawGrass();
    drawDogRetrieve();
    drawHUD();
    drawHitMessage();
  } else if (gameState === "gameOver") {
    drawGrass();
    drawHUD();
    drawGameOver();
    drawPerfectMessage();
  }

  if (gameState !== "intro") {
    if (gameState === "gameOver" && isOverCSVButton()) {
      cursor(HAND);
    } else {
      cursor("default");
      drawCrosshair();
    }
  }

  if (perfectMessageTimer > 0) perfectMessageTimer--;
  if (missMessageTimer > 0)    missMessageTimer--;
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

  duckSpawnTime  = 0;
  firstShotFired = false;
  firstShotTimes = [];
  survivalTimes  = [];
  shotTimestamps = [];
  allShotGaps    = [];

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
  fill(72, 168, 44);
  rect(0, height - 90, width, 90);

  fill(56, 148, 32);
  for (let b of grassBack) {
    triangle(b.x, height - 90, b.x + 5, height - 90 - b.h, b.x + 11, height - 90);
  }

  fill(24, 100, 18);
  for (let f of grassFront) {
    triangle(f.x, height - 90, f.x + 7, height - 90 - f.h, f.x + 15, height - 90);
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

  // wagging tail
  let tailWag = (dog.phase === "run" || dog.phase === "sniff")
    ? round(sin(frameCount * 0.55) * 6) : 0;
  fill(142, 92, 50);
  rect(28, -14 + tailWag, 14, 7);
  rect(38, -20 + tailWag, 10, 7);

  // body
  fill(142, 92, 50);
  rect(-28, -14, 58, 26);
  // chest highlight
  fill(163, 110, 62);
  rect(-16, -8, 20, 14);

  // animated running legs (alternating pairs)
  let runCycle = (dog.phase === "run") ? round(sin(frameCount * 0.42) * 5) : 0;
  fill(142, 92, 50);
  rect(-22, 12, 10, 14 + runCycle);
  rect(-8,  12, 10, 14 - runCycle);
  rect(8,   12, 10, 14 - runCycle);
  rect(22,  12, 10, 14 + runCycle);

  // white muzzle
  fill(255);
  rect(-50, -18, 26, 18);
  // head top
  fill(163, 110, 62);
  rect(-48, -28, 26, 12);
  // floppy ears with inner color
  fill(50, 30, 20);
  rect(-50, -38, 11, 22);
  rect(-31, -38, 11, 22);
  fill(160, 60, 60);
  rect(-48, -36, 7, 14);
  rect(-29, -36, 7, 14);
  // nose
  fill(0);
  rect(-52, -12, 8, 5);
  // eye with sparkle
  fill(0);
  rect(-38, -16, 5, 5);
  fill(255);
  rect(-37, -15, 2, 2);

  // sniff dots animation
  if (dog.phase === "sniff") {
    fill(255, 200);
    for (let i = 0; i < 3; i++) {
      rect(-62 - i * 10, -20 + round(sin(frameCount * 0.3 + i * 1.2) * 3), 6, 6);
    }
  }

  pop();
}

function resetDuck() {
  if (duckSpawnTime > 0) {
    for (let i = 1; i < shotTimestamps.length; i++) {
      allShotGaps.push((shotTimestamps[i] - shotTimestamps[i - 1]) / 1000);
    }
  }
  shotTimestamps = [];

  if (ducksHit + ducksMissed >= ducksPerRound) {
    if (ducksHit === ducksPerRound) {
      score += 5000;
      perfectRound = true;
      perfectMessageTimer = 0;
    }
    logMetrics();
    gameState = "gameOver";
    return;
  }

  shotsLeft      = 3;
  duckSpawnTime  = millis();
  firstShotFired = false;

  let spawnFromGrass = random() < 0.7;
  let direction = random() < 0.5 ? 1 : -1;

  if (spawnFromGrass) {
    let isFast = random() < 0.40;
    let spawnX = random(80, width - 80);
    let dir    = random() < 0.5 ? 1 : -1;

    // Random launch angle: 8°–82° from horizontal — excludes near-vertical (85–90°) and near-horizontal (0–5°)
    let angleDeg = random(8, 82);
    let angleRad = angleDeg * PI / 180;
    let speed    = random(isFast ? 9.5 : 7.8, isFast ? 12.2 : 10.6);

    duck = {
      x: spawnX,
      y: height - 88,
      w: 46,
      h: 26,
      speedX: cos(angleRad) * speed * dir,
      speedY: -sin(angleRad) * speed,
      wingOffset: 0,
      launchFrames: 16,
      state: "flying",
      gravity: 0.35,
      fallSpeed: 0,
      fallTimer: 0,
      facing: dir > 0 ? -1 : 1,
      isFast: isFast,
      noiseT: random(1000),
      survivalRecorded: false
    };
  } else {
    let isFast = random() < 0.40;

    duck = {
      x: direction === 1 ? -60 : width + 60,
      y: random(80, height - 210),
      w: 46,
      h: 26,
      speedX: random(isFast ? 8.9 : 7.2, isFast ? 11.2 : 9.5) * direction,
      speedY: random(-2, 2),
      wingOffset: 0,
      launchFrames: 0,
      state: "flying",
      gravity: 0.35,
      fallSpeed: 0,
      fallTimer: 0,
      facing: direction,
      isFast: isFast,
      noiseT: random(1000),
      survivalRecorded: false
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
      gameState = "dogDelay";
      dogPreDelayTimer = 0;
      dogRetrieveX = constrain(round(duck.x), 60, width - 60);
      deadDuckFacing = duck.facing;
      return;
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
    duck.speedY += 0.28;
    if (duck.launchFrames === 0) {
      duck.speedY = random(-3, 0);
    }
  }

  // Flies mostly straight — occasional random direction kick like the original NES game
  // Speed is the challenge, not constant curving
  if (random() < 0.014) {
    duck.speedY = random(-3.5, 3.5);
  }
  duck.speedY += random(-0.06, 0.06);  // tiny flutter so it's not robotic
  duck.speedY = constrain(duck.speedY, -4, 4);

  if (duck.y < 70) {
    duck.speedY = abs(duck.speedY);
  }

  if (duck.y > height - 190) {
    duck.speedY = -abs(duck.speedY);
  }

  // Fly straight up off screen — skip all normal flight physics
  if (duck.state === "escaped") {
    duck.speedY = -9;
    duck.speedX *= 0.88;
    duck.escapeTimer--;
    if (duck.escapeTimer <= 0) resetDuck();
    return;
  }

  // Bounce off sides while actively flying
  if (duck.x > width - 40) duck.speedX = -abs(duck.speedX);
  if (duck.x < 40)          duck.speedX =  abs(duck.speedX);

  // Fixed-duration escape: every missed duck is on screen for exactly DUCK_TIMEOUT_MS
  if (millis() - duckSpawnTime > DUCK_TIMEOUT_MS) {
    if (!duck.survivalRecorded) {
      survivalTimes.push(DUCK_TIMEOUT_MS / 1000);
      duck.survivalRecorded = true;
    }
    hitMessageTimer  = 0;
    ducksMissed++;
    duck.state       = "escaped";
    duck.escapeTimer = 68;
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

  noStroke();
  fill(90, 60, 10);
  rect(0, height - 90, width, 90);

  drawGun();

  stroke(255);
  noFill();
  rect(65, hudY - 10, 120, 50);
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  textSize(18);
  text("SHOT", 80, hudY);

  fill(0, 150, 255);
  for (let i = 0; i < shotsLeft; i++) {
    rect(80 + i * 22, hudY + 24, 14, 10);
  }

  stroke(255);
  noFill();
  rect(250, hudY - 10, 330, 50);
  noStroke();
  fill(255);
  text("HIT", 265, hudY);

  for (let i = 0; i < ducksPerRound; i++) {
    if (i < ducksHit)                   fill(255, 60, 60);
    else if (i < ducksHit + ducksMissed) fill(255);
    else                                  fill(80);
    rect(315 + i * 24, hudY + 18, 14, 14);
  }

  stroke(255);
  noFill();
  rect(680, hudY - 10, 170, 50);
  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  text("SCORE",      700, hudY);
  text(nf(score, 6), 700, hudY + 22);
}

function drawGun() {
  push();
  translate(8, height - 52);
  noStroke();

  fill(50, 50, 55);
  rect(18, -3, 28, 5);       // barrel
  fill(35, 35, 40);
  rect(44, -5, 5, 9);        // muzzle tip
  fill(80, 80, 85);
  rect(8, -10, 24, 8);       // slide
  fill(60, 60, 65);
  rect(10, -9, 20, 2);       // slide detail
  fill(65, 65, 70);
  rect(6, -2, 22, 8);        // frame
  fill(55, 55, 60);
  rect(14, 5, 11, 2);        // trigger guard top
  rect(14, 5, 2, 6);
  rect(23, 5, 2, 6);
  fill(90, 52, 22);
  rect(6, 6, 13, 20);        // grip
  fill(65, 35, 10);
  rect(8,  9, 9, 2);         // grip texture
  rect(8, 13, 9, 2);
  rect(8, 17, 9, 2);
  rect(8, 21, 9, 2);

  pop();
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

function drawFlyAway() {
  if (!duck || duck.state !== "escaped") return;
  let bw = 210, bh = 40;
  let bx = width / 2 - bw / 2, by = 52;
  fill(0);
  noStroke();
  rect(bx, by, bw, bh);
  stroke(255);
  strokeWeight(2);
  noFill();
  rect(bx + 3, by + 3, bw - 6, bh - 6);
  noStroke();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("FLY  AWAY", width / 2, by + bh / 2);
}

function mousePressed() {
  if (gameState === "gameOver") {
    if (isOverCSVButton()) {
      downloadCSV();
      return false;
    }
    return;
  }

  if (gameState !== "playing") return;
  if (duck.state !== "flying") return;
  if (shotsLeft <= 0) return;

  shotsFired++;
  shotsLeft--;
  playGunShotSound();
  shotTimestamps.push(millis());

  if (!firstShotFired) {
    firstShotTimes.push((millis() - duckSpawnTime) / 1000);
    firstShotFired = true;
  }

  if (hitDuck(mouseX, mouseY)) {
    score += 500;
    ducksHit++;
    hitMessageTimer  = 20;
    missMessageTimer = 0;

    if (!duck.survivalRecorded) {
      survivalTimes.push((millis() - duckSpawnTime) / 1000);
      duck.survivalRecorded = true;
    }

    duck.state     = "falling";
    duck.fallSpeed = 1.5;
    duck.speedX    = 0;
    duck.speedY    = 0;

  } else {
    missMessageTimer = 20;
    hitMessageTimer  = 0;

    // shots exhausted — duck keeps flying until DUCK_TIMEOUT_MS fires in updateDuck
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
  fill(0, 190);
  rect(0, 0, width, height);

  let accuracy     = shotsFired > 0 ? round((ducksHit / shotsFired) * 100) : 0;
  let shotsPerKill = ducksHit > 0 ? (shotsFired / ducksHit).toFixed(2) : "--";
  let avgFirstShot = firstShotTimes.length > 0
    ? (firstShotTimes.reduce((a, b) => a + b, 0) / firstShotTimes.length).toFixed(2) + "s"
    : "--";
  let avgSurvival  = survivalTimes.length > 0
    ? (survivalTimes.reduce((a, b) => a + b, 0) / survivalTimes.length).toFixed(2) + "s"
    : "--";
  let avgShotGap = allShotGaps.length > 0
    ? (allShotGaps.reduce((a, b) => a + b, 0) / allShotGaps.length).toFixed(2) + "s"
    : "--";

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("GAME OVER", width / 2, 45);

  fill(160, 200, 255);
  textSize(16);
  text("Round " + playNum, width / 2, 74);

  if (perfectRound) {
    fill(255, 215, 0);
    textSize(17);
    text("PERFECT ROUND  +5000 pts", width / 2, 97);
  }

  let labelX = 280;
  let valueX = 620;
  let startY = 118;
  let rowH   = 30;

  let labels = [
    "Final Score", "Ducks Hit", "Ducks Missed", "Total Shots Used",
    "Accuracy", "Shots Per Kill", "Avg Time to First Shot", "Avg Duck Survival Time",
    "Avg Time Between Shots"
  ];
  let values = [
    nf(score, 6), ducksHit + " / " + ducksPerRound, ducksMissed, shotsFired,
    accuracy + "%", shotsPerKill, avgFirstShot, avgSurvival,
    avgShotGap
  ];

  for (let i = 0; i < labels.length; i++) {
    let y = startY + i * rowH;
    if (i % 2 === 0) {
      fill(255, 255, 255, 18);
      noStroke();
      rect(160, y - 14, 580, rowH);
    }
    textSize(17);
    textAlign(LEFT, CENTER);
    fill(180, 220, 255);
    text(labels[i], labelX, y);
    textAlign(RIGHT, CENTER);
    fill(255);
    text(values[i], valueX, y);
  }

  fill(200);
  textAlign(CENTER, CENTER);
  textSize(15);
  text("Press R to play again", width / 2, 408);

  fill(30, 120, 70);
  noStroke();
  rect(340, 426, 220, 36, 4);
  fill(255);
  textSize(15);
  text("Download CSV  (" + allRounds.length + " rounds)", 450, 444);
}

function isOverCSVButton() {
  return mouseX > 340 && mouseX < 560 && mouseY > 426 && mouseY < 462;
}

function logMetrics() {
  let accuracy     = shotsFired > 0 ? round((ducksHit / shotsFired) * 100) : 0;
  let shotsPerKill = ducksHit > 0 ? (shotsFired / ducksHit).toFixed(2) : "N/A";
  let avgFirstShot = firstShotTimes.length > 0
    ? (firstShotTimes.reduce((a, b) => a + b, 0) / firstShotTimes.length).toFixed(2) : "N/A";
  let avgSurvival  = survivalTimes.length > 0
    ? (survivalTimes.reduce((a, b) => a + b, 0) / survivalTimes.length).toFixed(2) : "N/A";
  let avgShotGap = allShotGaps.length > 0
    ? (allShotGaps.reduce((a, b) => a + b, 0) / allShotGaps.length).toFixed(2) : "N/A";

  playNum++;
  allRounds.push({
    play: playNum, score, ducksHit, ducksMissed, shotsFired,
    accuracy, shotsPerKill, avgFirstShot, avgSurvival, avgShotGap
  });
}

function downloadCSV() {
  if (allRounds.length === 0) return;

  let lines = [[
    "Round", "Score", "Ducks Hit", "Ducks Missed",
    "Total Shots", "Accuracy %", "Shots Per Kill",
    "Avg First Shot (s)", "Avg Survival (s)", "Avg Time Between Shots (s)"
  ].join(",")];

  for (let r of allRounds) {
    lines.push([
      r.play, r.score, r.ducksHit, r.ducksMissed, r.shotsFired,
      r.accuracy, r.shotsPerKill, r.avgFirstShot, r.avgSurvival, r.avgShotGap
    ].join(","));
  }

  saveStrings(lines, "duck_hunt_main", "csv");
}

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playGunShotSound() {
  try {
    let ctx = getAudioCtx();
    if (gunBuffer) {
      let src  = ctx.createBufferSource();
      src.buffer = gunBuffer;
      let gain = ctx.createGain();
      gain.gain.value = 0.7;
      src.connect(gain);
      gain.connect(ctx.destination);
      src.start(ctx.currentTime);
    }
  } catch (e) {}
}

function startDogRetrieve() {
  gameState = "dogRetrieve";
  dogRetrieveTimer = 0;
  dogRetrieveX = constrain(round(duck.x), 60, width - 60);
  deadDuckFacing = duck.facing;
  playRetrieveSound();
}

function updateDogRetrieve() {
  dogRetrieveTimer++;
  if (hitMessageTimer > 0) hitMessageTimer--;
  if (dogRetrieveTimer > 105) {
    gameState = "playing";
    resetDuck();
  }
}

function drawDogRetrieve() {
  let riseOffset;
  if (dogRetrieveTimer < 20) {
    riseOffset = map(dogRetrieveTimer, 0, 20, 80, 0);
  } else if (dogRetrieveTimer < 80) {
    riseOffset = 0;
  } else {
    riseOffset = map(dogRetrieveTimer, 80, 105, 0, 80);
  }

  let dogY = height - 90 + riseOffset;

  push();
  translate(round(dogRetrieveX), round(dogY));
  noStroke();

  // arms — darker than body so they read as separate limbs
  fill(108, 68, 30);
  rect(-30, -92, 14, 50);
  rect(16, -92, 14, 50);

  // dead duck held sideways — same sprite as drawDuck(), no rotation so it stays horizontal
  push();
  translate(0, -108);
  scale(deadDuckFacing, 1);
  fill(86, 56, 24);
  rect(-2, -8, 14, 8);
  rect(8, -14, 8, 8);
  fill(65, 40, 14);
  rect(18, -6, 8, 8);
  rect(26, -10, 6, 6);
  fill(112, 74, 31);
  rect(-16, -10, 30, 20);
  rect(10, -6, 8, 12);
  fill(148, 103, 55);
  rect(-10, -2, 10, 8);
  fill(34, 122, 74);
  rect(-24, -14, 10, 10);
  rect(-32, -14, 10, 10);
  rect(-24, -6, 8, 6);
  fill(246, 182, 28);
  rect(-38, -12, 6, 4);
  rect(-44, -10, 6, 4);
  fill(255);
  rect(-28, -12, 3, 3);
  fill(0);
  rect(-27, -11, 1, 1);
  pop();

  // body
  fill(142, 92, 50);
  rect(-18, -52, 36, 34);
  fill(163, 110, 62);
  rect(-10, -44, 20, 20);  // chest highlight

  // head — wider to match the broader body/arm span
  fill(163, 110, 62);
  rect(-19, -74, 38, 24);
  // floppy ears with inner color
  fill(50, 30, 20);
  rect(-23, -84, 13, 24);
  rect(10, -84, 13, 24);
  fill(160, 60, 60);
  rect(-21, -82, 8, 16);
  rect(12, -82, 8, 16);
  // white muzzle (centered)
  fill(255);
  rect(-11, -66, 22, 18);
  // nose
  fill(0);
  rect(-7, -66, 14, 5);
  // happy open mouth + teeth
  fill(0);
  rect(-9, -52, 18, 4);
  fill(255);
  rect(-8, -52, 7, 6);
  rect(1, -52, 7, 6);
  // squinting eyes with sparkle
  fill(0);
  rect(-14, -72, 10, 4);
  rect(4, -72, 10, 4);
  fill(255);
  rect(-13, -72, 3, 2);
  rect(5, -72, 3, 2);

  // legs (mostly hidden by grass)
  fill(142, 92, 50);
  rect(-12, -18, 12, 22);
  rect(2, -18, 12, 22);

  pop();
}

function playRetrieveSound() {
  try {
    let ctx = getAudioCtx();
    function bark(t) {
      let osc = ctx.createOscillator();
      let gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(380, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.13);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.16);
    }
    bark(ctx.currentTime);
    bark(ctx.currentTime + 0.22);
    bark(ctx.currentTime + 0.42);
  } catch (e) {}
}

function keyPressed() {
  if (keyCode === 32 && gameState === "intro") {
    // Play a zero-gain silent buffer — forces the audio pipeline to fully initialize
    // so the first real shot fires with zero delay (resume() alone is async)
    try {
      let ctx = getAudioCtx();
      let warmBuf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      let warmSrc = ctx.createBufferSource();
      warmSrc.buffer = warmBuf;
      let warmGain = ctx.createGain();
      warmGain.gain.value = 0;
      warmSrc.connect(warmGain);
      warmGain.connect(ctx.destination);
      warmSrc.start();
    } catch(e) {}
    startDogIntro();
    return false;
  }

  if ((key === "r" || key === "R") && gameState === "gameOver") {
    setupIntro();
    return false;
  }
}
