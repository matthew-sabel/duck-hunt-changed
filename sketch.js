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

let cookingProgress = 0;
let isCooking = false;
let cookingResult = "";
let cookingMessageTimer = 0;
let cookingDone = false;
let cookedDuckStage = "";

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

    if (duck.state === "readyToCook" && !cookingDone) {
      drawCookingUI();
      drawDuck();
    } else if (duck.state === "readyToCook" && cookingDone) {
      drawCookingResult();
    } else {
      drawDuck();
    }

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

  cookingProgress = 0;
  isCooking = false;
  cookingResult = "";
  cookingMessageTimer = 0;
  cookingDone = false;
  cookedDuckStage = "";

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
  text("DUCK HUNT IMPROVED", width / 2, height / 2 - 70);

  textSize(22);
  text("Shoot all of ducks to score before time runs out.", width / 2, height / 2 - 12);
  text("Left Click Your Mouse to Shoot", width / 2, height / 2 + 22);
  text("Cook the ducks to stay alive!", width / 2, height / 2 + 56);

  fill(255, 230, 120);
  textSize(26);
  text("Press SPACE to start", width / 2, height / 2 + 90);
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
  cookingProgress = 0;
  isCooking = false;
  cookingResult = "";
  cookingMessageTimer = 0;
  cookingDone = false;
  cookedDuckStage = "";

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


function getCookedDuckColors() {
  if (cookingProgress < 41) {
    return {
      body: color(225, 140, 140),   // undercooked pink
      wing: color(200, 120, 120),
      head: color(210, 150, 150)
    };
  } else if (cookingProgress <= 59) {
    return {
      body: color(184, 122, 45),    // perfect golden brown
      wing: color(150, 95, 35),
      head: color(170, 110, 40)
    };
  } else {
    return {
      body: color(35, 35, 35),      // burnt black
      wing: color(20, 20, 20),
      head: color(28, 28, 28)
    };
  }
}

function drawBones() {
  stroke(245);
  strokeWeight(3);

  // left bone
  line(-30, 1, -42, 4);
  circle(-44, 2, 4);
  circle(-40, 6, 4);

  // right double bone
  line(18, -2, 34, -4);
  line(18, 3, 34, 5);
  circle(36, -5, 4);
  circle(39, 5, 4);

  noStroke();
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
    duck.state = "readyToCook";
    duck.x = width / 2 - 8;
    duck.y = height / 2 + 78;
    duck.speedX = 0;
    duck.speedY = 0;
    duck.fallSpeed = 0;
    duck.facing = 1;
  }

    if (hitMessageTimer > 0) hitMessageTimer--;
    if (cookingMessageTimer > 0) cookingMessageTimer--;
    return;
  }

  if (duck.state === "readyToCook") {
    if (cookingDone) {
      if (cookingMessageTimer > 0) {
        cookingMessageTimer--;
      } else {
        resetDuck();
      }
      return;
    }

    if (keyIsDown(67)) { // C key
      isCooking = true;
      cookingProgress += 4.5;
      cookingProgress = constrain(cookingProgress, 0, 100);
    } else {
      isCooking = false;
    }

    if (cookingProgress >= 100) {
      cookingProgress = 100;
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
  if (cookingMessageTimer > 0) cookingMessageTimer--;
}

function keyReleased() {
  if (
    gameState === "playing" &&
    duck &&
    duck.state === "readyToCook" &&
    (key === "c" || key === "C")
  ) {
    finishCooking();
    return false;
  }
}

function drawDuck() {
  push();
  translate(round(duck.x), round(duck.y));
  scale(duck.facing, 1);

  if (duck.state === "falling") {
    rotate(radians(90));
  }

  if (duck.state === "readyToCook") {
    rotate(radians(-6));
    scale(1.22, 1.22);
  }

  let bodyColor = color(112, 74, 31);
  let wingColor = color(86, 56, 24);
  let headColor = color(34, 122, 74);
  let showBones = false;

  if (duck.state === "readyToCook") {
    let cookedColors = getCookedDuckColors();
    bodyColor = cookedColors.body;
    wingColor = cookedColors.wing;
    headColor = cookedColors.head;

    // show bones for perfect and burnt
    if (cookingProgress >= 41) {
      showBones = true;
    }
  }

  noStroke();

  // wing
  fill(wingColor);
  rect(-2, -8 + round(duck.wingOffset * 0.3), 14, 8);
  rect(8, -14 + round(duck.wingOffset * 0.3), 8, 8);

  // tail
  fill(65, 40, 14);
  rect(18, -6, 8, 8);
  rect(26, -10, 6, 6);

  // body
  fill(bodyColor);
  rect(-16, -10, 30, 20);
  rect(10, -6, 8, 12);

  // chest highlight
  if (duck.state === "readyToCook") {
    if (cookingProgress < 41) {
      fill(245, 170, 170); // pink highlight
    } else if (cookingProgress <= 59) {
      fill(214, 160, 75); // golden highlight
    } else {
      fill(90, 90, 90); // burnt highlight
    }
  } else {
    fill(148, 103, 55);
  }
  rect(-10, -2, 10, 8);

  if (duck.state === "readyToCook") {
    // cooked bird front / breast area instead of full duck head
    fill(headColor);
    rect(-22, -10, 12, 10);
    rect(-28, -8, 8, 8);

    // little highlight on breast
    if (cookingProgress < 41) {
      fill(255, 190, 190);
    } else if (cookingProgress <= 59) {
      fill(232, 185, 95);
    } else {
      fill(120, 120, 120);
    }
    rect(-18, -6, 6, 5);

  } else {
    // normal flying duck head
    fill(headColor);
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
  }

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
  fill(255);
  text("SCORE", 700, hudY);

  let scoreText = score < 0 ? "-" + nf(abs(score), 6) : nf(score, 6);

  // change color based on score
  if (score < 0) {
    fill(255, 100, 100); // red
  } else {
    fill(255); // white
  }

  text(scoreText, 700, hudY + 22);
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

function finishCooking() {
  if (cookingProgress < 41) {
    score -= 1000;
    cookingResult = "EW!!! STILL RAW!! -1000";
    cookedDuckStage = "raw";

  } else if (cookingProgress <= 59) {
    score += 700;
    cookingResult = "PERFECT! +700";
    cookedDuckStage = "perfect";

  } else {
    score += 200;
    cookingResult = "BURNT... +200";
    cookedDuckStage = "burnt";
  }

  cookingMessageTimer = 150;
  cookingProgress = 0;
  isCooking = false;
  cookingDone = true;
}

function mousePressed() {
  if (gameState !== "playing") return;
  if (duck.state !== "flying") return;
  if (shotsLeft <= 0) return;

  shotsFired++;
  shotsLeft--;

  if (hitDuck(mouseX, mouseY)) {
    ducksHit++;

    hitMessageTimer = 20;
    missMessageTimer = 0;

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

function drawCookingUI() {
  // instruction text
  fill(255);
  textAlign(CENTER, CENTER);

  textSize(30);
  text("YOU'RE STARVING!! COOK THAT DUCK ASAP!", width / 2, height / 2 - 100);

  // sub-instruction
  textSize(18);
  fill(230);
  text("(Hold C to cook)", width / 2, height / 2 - 70);

  // cooking bar background
  let barX = width / 2 - 120;
  let barY = height / 2 - 50;
  let barW = 240;
  let barH = 20;

  noStroke();

  // tighter sweet spot
  let rawZone = 0.41;
  let perfectZone = 0.18;
  let burntZone = 0.41;

  fill(255, 120, 120); // undercooked
  rect(barX, barY, barW * rawZone, barH);

  fill(120, 255, 120); // perfect
  rect(barX + barW * rawZone, barY, barW * perfectZone, barH);

  fill(60); // burnt
  rect(barX + barW * (rawZone + perfectZone), barY, barW * burntZone, barH);

  // labels
  fill(255);
  textSize(14);
  text("Undercooked", barX + (barW * rawZone) / 2, barY + 35);
  text("Perfect", barX + barW * rawZone + (barW * perfectZone) / 2, barY + 35);
  text("Burnt", barX + barW * (rawZone + perfectZone) + (barW * burntZone) / 2, barY + 35);

  // progress marker
  let markerX = map(cookingProgress, 0, 100, barX, barX + barW);
  fill(255);
  rect(markerX - 3, barY - 4, 6, barH + 8);

  // cooking scene positions
  let centerX = width / 2;
  let panY = height / 2 + 55;
  let fireY = panY + 28;

  // back flame
  fill(255, 170, 30);
  beginShape();
  vertex(centerX - 52, fireY + 6);
  vertex(centerX - 44, fireY - 8);
  vertex(centerX - 34, fireY + 4);
  vertex(centerX - 24, fireY - 18);
  vertex(centerX - 12, fireY + 2);
  vertex(centerX, fireY - 24);
  vertex(centerX + 12, fireY + 2);
  vertex(centerX + 24, fireY - 18);
  vertex(centerX + 34, fireY + 4);
  vertex(centerX + 44, fireY - 8);
  vertex(centerX + 52, fireY + 6);
  vertex(centerX + 46, fireY + 18);
  vertex(centerX - 46, fireY + 18);
  endShape(CLOSE);

  // inner flame
  fill(255, 220, 120);
  beginShape();
  vertex(centerX - 34, fireY + 8);
  vertex(centerX - 26, fireY - 2);
  vertex(centerX - 16, fireY + 5);
  vertex(centerX - 8, fireY - 10);
  vertex(centerX, fireY + 2);
  vertex(centerX + 8, fireY - 12);
  vertex(centerX + 16, fireY + 4);
  vertex(centerX + 26, fireY - 2);
  vertex(centerX + 34, fireY + 8);
  vertex(centerX + 28, fireY + 16);
  vertex(centerX - 28, fireY + 16);
  endShape(CLOSE);

  // tiny hot center
  fill(255, 245, 190);
  triangle(centerX - 8, fireY + 12, centerX, fireY - 2, centerX + 8, fireY + 12);

  // crossed logs in front
  stroke(110, 66, 26);
  strokeWeight(9);
  line(centerX - 34, fireY + 24, centerX - 10, fireY + 2);
  line(centerX - 8, fireY + 24, centerX + 10, fireY + 2);
  line(centerX + 18, fireY + 24, centerX + 28, fireY + 6);
  noStroke();

  // pan base
  fill(30);
  ellipse(centerX, panY, 180, 45);

  fill(70);
  ellipse(centerX, panY - 5, 140, 30);

  // handle
  fill(40);
  rect(centerX + 90, panY - 6, 50, 12);
  ellipse(centerX + 145, panY, 14, 14);

  // enlarged original duck centered on pan
  push();
  translate(centerX, panY - 2);
  scale(1.55, 1.55);

  let cookedColors = getCookedDuckColors();
  let showBones = cookingProgress >= 41;

  // wing
  fill(cookedColors.wing);
  rect(-2, -8, 14, 8);
  rect(8, -14, 8, 8);

  // tail
  fill(65, 40, 14);
  rect(18, -6, 8, 8);
  rect(26, -10, 6, 6);

  // body
  fill(cookedColors.body);
  rect(-16, -10, 30, 20);
  rect(10, -6, 8, 12);

  // chest highlight
  if (cookingProgress < 41) {
    fill(245, 170, 170);
  } else if (cookingProgress <= 59) {
    fill(214, 160, 75);
  } else {
    fill(90, 90, 90);
  }
  rect(-10, -2, 10, 8);

  // front / cooked head area
  fill(cookedColors.head);
  rect(-22, -10, 12, 10);
  rect(-28, -8, 8, 8);

  if (cookingProgress < 41) {
    fill(255, 190, 190);
  } else if (cookingProgress <= 59) {
    fill(232, 185, 95);
  } else {
    fill(120, 120, 120);
  }
  rect(-18, -6, 6, 5);

  if (showBones) {
    drawBones();
  }

  pop();
}


function drawCookingResult() {
  if (!cookingDone || cookingMessageTimer <= 0) return;

  // dark overlay
  fill(0, 120);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);

  // message at top
  if (cookedDuckStage === "perfect") {
    fill(255, 230, 120);
    textSize(34);
  } else if (cookedDuckStage === "raw") {
    fill(255, 150, 150);
    textSize(32);
  } else {
    fill(190);
    textSize(32);
  }

  text(cookingResult, width / 2, 85);

  // wobble / rotation by state
  let wobbleX = 0;
  let wobbleY = 0;
  let wobbleRot = -4; // cleaner default for perfect/burnt

  if (cookedDuckStage === "raw") {
    wobbleX = sin(frameCount * 0.45) * 8;
    wobbleY = sin(frameCount * 0.5) * 4;
    wobbleRot = -12 + sin(frameCount * 0.35) * 4;
  }

  push();
  translate(width / 2 + wobbleX, height / 2 + 38 + wobbleY);
  rotate(radians(wobbleRot));
  scale(4.2, 4.2);

  let bodyColor;
  let wingColor;
  let headColor;
  let showBones = false;

  if (cookedDuckStage === "raw") {
    bodyColor = color(215, 135, 135);
    wingColor = color(195, 120, 120);
    headColor = color(205, 145, 145);
  } else if (cookedDuckStage === "perfect") {
    bodyColor = color(184, 122, 45);
    wingColor = color(150, 95, 35);
    headColor = color(170, 110, 40);
    showBones = true;
  } else {
    bodyColor = color(35, 35, 35);
    wingColor = color(20, 20, 20);
    headColor = color(28, 28, 28);
    showBones = true;
  }

  noStroke();

  // smaller, flatter plate for cooked states
  if (cookedDuckStage !== "raw") {
    fill(235);
    ellipse(0, 18, 62, 12);
    fill(210);
    ellipse(0, 19, 42, 5);
  }

  // outer roast shading
  fill(
    cookedDuckStage === "perfect" ? color(140, 85, 28) :
    cookedDuckStage === "burnt" ? color(15, 15, 15) :
    color(195, 118, 118)
  );
  rect(-20, -8, 34, 18);
  rect(-8, -14, 22, 10);

  // main body
  fill(bodyColor);
  rect(-16, -10, 30, 20);
  rect(-4, -15, 18, 10);

  // wing
  fill(wingColor);
  rect(-2, -8, 12, 7);

  // breast highlight
  if (cookedDuckStage === "raw") {
    fill(238, 182, 182);
  } else if (cookedDuckStage === "perfect") {
    fill(222, 170, 82);
  } else {
    fill(80, 80, 80);
  }
  rect(-4, -4, 10, 8);

  // front bump / shoulder
  fill(headColor);
  rect(-24, -8, 10, 9);
  rect(-29, -6, 7, 7);

  // raw face / cooked front highlight
  if (cookedDuckStage === "raw") {
    // sickly body patch
    fill(255, 215, 215);
    rect(-21, -7, 10, 7);

    // extra floppy bump
    fill(210, 135, 135);
    rect(-10, 8, 6, 4);

    // lower belly sag
    fill(205, 130, 130);
    rect(-13, 6, 16, 6);

    // cheek / jaw flap
    fill(198, 122, 122);
    rect(-17, 2, 7, 5);

    // uneven bulging eyes
    fill(255);
    rect(-31, -14, 6, 6);
    rect(-20, -12, 9, 8);

    // extra-crossed pupils
    fill(0);
    rect(-28, -12, 2, 2);
    rect(-16, -9, 2, 2);

    // wider droopy mouth
    fill(145, 68, 68);
    rect(-27, 0, 10, 2);

    // lip line
    fill(110, 50, 50);
    rect(-26, -1, 9, 1);

    // longer hanging tongue
    fill(255, 70, 110);
    rect(-19, 1, 11, 3);
    rect(-12, 4, 5, 5);

    // drool
    fill(170, 220, 255);
    rect(-8, 5, 2, 7);
  } else {
    if (cookedDuckStage === "perfect") {
      fill(240, 198, 110);
    } else {
      fill(110, 110, 110);
    }
    rect(-20, -5, 6, 5);

    // extra warm highlight for perfect
    if (cookedDuckStage === "perfect") {
      fill(245, 205, 120);
      rect(-8, -1, 5, 4);
    }
  }

  // smaller bones
  if (showBones) {
    stroke(240);
    strokeWeight(3);

    // left bone
    line(-18, 3, -26, 6);
    circle(-28, 5, 3);
    circle(-25, 8, 3);

    // right bone
    line(12, -1, 22, -2);
    line(12, 3, 22, 4);
    circle(24, -3, 3);
    circle(25, 5, 3);

    noStroke();
  }

  pop();
}


function drawGameOver() {
  fill(0, 180);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);

  let centerY = height / 2;

  // Title
  textSize(42);
  fill(255);
  text("Game Over", width / 2, centerY - 70);

  // Message (closer to title, properly spaced)
  textSize(30);
  if (score < 0) {
    fill(255, 120, 120);
    text("😂👉 I'm laughing at you", width / 2, centerY - 30);
  } else if (score === 0) {
    fill(200);
    text("😂👉 I'm laughing at you", width / 2, centerY - 30);
  } else {
    fill(120, 255, 120);
    text("Nice shooting! 🍗", width / 2, centerY - 30);
  }

  // Stats (even spacing)
  textSize(28);
  fill(255);
  text("Final Score: " + score, width / 2, centerY + 10);
  text("Ducks Missed: " + ducksMissed, width / 2, centerY + 45);

  let accuracy = shotsFired > 0 ? round((ducksHit / shotsFired) * 100) : 0;
  textSize(22);
  text("Accuracy: " + accuracy + "%", width / 2, centerY + 80);

  if (perfectRound) {
    fill(255, 215, 0);
    textSize(24);
    text("Perfect Round Bonus: 5000", width / 2, centerY + 115);
  }

  // Restart prompt (kept nicely below everything)
  fill(255);
  textSize(20);
  text("Press R to restart", width / 2, centerY + 160);
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
