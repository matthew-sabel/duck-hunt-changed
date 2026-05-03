//  DUCK HUNT - p5.js retro version
//  Version B: slow bullet mechanic


// game objects
let duck;
let dog;
let bullets = [];   // all bullets currently in the air

// how fast the bullet travels across the screen (pixels per frame)
// how fast the bullet shrinks each frame — controls how long it stays visible
const BULLET_DECAY = 0.92;


// score & round tracking
let score = 0;

let ducksPerRound = 10;
let ducksHit      = 0;
let ducksMissed   = 0;

let shotsFired = 0;
let shotsLeft  = 3;    // player gets 3 shots per duck

let roundOver        = false;
let roundResultTimer = 0;


// UI timers (count down each frame)
let hitMessageTimer  = 0;
let missMessageTimer = 0;


// game state machine
// possible states: "intro", "dogIntro", "playing", "gameOver"
let gameState = "intro";
let stateTimer = 0;   // general-purpose timer used inside states


// perfect round bonus
let perfectRound        = false;
let perfectMessageTimer = 0;


// metrics tracking
let duckSpawnTime  = 0;      // millis() when the current duck appeared
let firstShotFired = false;  // did the player fire at this duck yet?

let firstShotTimes = [];     // seconds between duck spawn and player's first shot (one per duck)
let survivalTimes  = [];     // seconds each duck was alive before hit or escape (one per duck)


// session-level data — persists across restarts until the page is refreshed
let allRounds = [];   // every completed round gets a row added here
let playNum   = 0;    // increments each time a round ends

//  SETUP & MAIN LOOP
function setup() {
  createCanvas(900, 500);
  pixelDensity(1);
  noSmooth();          
  textFont("monospace");
  setupIntro();
}

function draw() {
  // sky + clouds + bushes are always drawn first
  drawBackground();

  // then we branch depending on what state the game is in
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
    updateBullets();    // move bullets and check for hits
    drawGrass();
    drawDuck();
    drawBullets();      // draw all bullets currently in the air
    drawHUD();
    drawHitMessage();
    drawMissMessage();

  } else if (gameState === "gameOver") {
    drawGrass();
    drawHUD();
    drawGameOver();
    drawPerfectMessage();
  }

  // crosshair follows the mouse during all states except the title screen
  // hide it and show a pointer cursor when hovering the Download CSV button
  if (gameState !== "intro") {
    if (gameState === "gameOver" && isOverCSVButton()) {
      cursor(HAND);
    } else {
      cursor('default');
      drawCrosshair();
    }
  }

  // tick down timers every frame
  if (perfectMessageTimer > 0) perfectMessageTimer--;
  if (missMessageTimer > 0)    missMessageTimer--;
}

//  GAME STATE SETUP FUNCTIONS

// resets everything back to the very beginning (title screen)
function setupIntro() {
  gameState = "intro";
  score       = 0;
  shotsFired  = 0;
  ducksHit    = 0;
  ducksMissed = 0;
  shotsLeft   = 3;

  roundOver        = false;
  roundResultTimer = 0;
  hitMessageTimer  = 0;
  missMessageTimer = 0;
  perfectRound        = false;
  perfectMessageTimer = 0;
  stateTimer = 0;

  duckSpawnTime  = 0;
  firstShotFired = false;
  firstShotTimes = [];
  survivalTimes  = [];

  // start the dog off-screen to the left
  dog = {
    x:          -80,
    y:          height - 110,
    baseY:      height - 110,
    jumpOffset: 0,
    phase:      "run"
  };
}

// kicks off the dog animation before gameplay starts
function startDogIntro() {
  gameState = "dogIntro";
  stateTimer = 0;

  dog.x          = -80;
  dog.y          = height - 110;
  dog.baseY      = height - 110;
  dog.jumpOffset = 0;
  dog.phase      = "run";
}


// background and scenery

function drawBackground() {
  // sky
  background(134, 197, 247);

  // clouds
  noStroke();
  fill(255);
  drawCloud(150, 90, 1.0);
  drawCloud(690, 72, 0.9);

  // light green horizon strip
  fill(124, 199, 92);
  rect(0, height - 145, width, 55);

  // dark green bushes along the horizon
  fill(30, 140, 50);
  for (let x = 20; x < width; x += 90) {
    ellipse(x,      height - 95,  55, 35);
    ellipse(x + 22, height - 100, 50, 30);
    ellipse(x + 45, height - 95,  55, 35);
  }
}

// draws one cloud made of three overlapping ellipses
// s = scale factor so we can make slightly different sized clouds
function drawCloud(x, y, s) {
  ellipse(x,           y,           52 * s, 28 * s);
  ellipse(x + 22 * s,  y - 8 * s,  40 * s, 30 * s);
  ellipse(x + 45 * s,  y,           52 * s, 28 * s);
}

function drawGrass() {
  // solid grass fill at the bottom
  noStroke();
  fill(24, 120, 44);
  rect(0, height - 90, width, 90);

  // little triangles to look like grass blades
  fill(18, 100, 36);
  for (let x = 0; x < width; x += 16) {
    triangle(x, height - 90,  x + 7, height - 115,  x + 14, height - 90);
  }
}

//  intro and title screen
function drawIntroText() {
  // dark overlay so text is readable over the background
  fill(0, 150);
  rect(0, 0, width, height);

  fill(255);
  textAlign(CENTER, CENTER);
  textSize(44);
  text("DUCK HUNT", width / 2, height / 2 - 70);

  textSize(22);
  text("Click ducks to score before time runs out.", width / 2, height / 2 - 12);
  text("Retro-inspired p5.js version",              width / 2, height / 2 + 22);

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

//  dog animation
// runs the dog through its phases: run then he sniffs then he jumps then he hides
function updateDogIntro() {
  stateTimer++;

  if (dog.phase === "run") {
    dog.x += 4.2;
    dog.jumpOffset = sin(frameCount * 0.5) * 4;   // little bounce while running

    if (dog.x >= width * 0.28) {
      dog.phase  = "sniff";
      stateTimer = 0;
      dog.jumpOffset = 0;
    }

  } else if (dog.phase === "sniff") {
    // just wait a bit before jumping
    if (stateTimer > 40) {
      dog.phase  = "jump";
      stateTimer = 0;
    }

  } else if (dog.phase === "jump") {
    // arc up and back down using a sine curve
    dog.jumpOffset = -sin((stateTimer / 35) * PI) * 55;

    if (stateTimer >= 35) {
      dog.phase  = "hide";
      stateTimer = 0;
      dog.jumpOffset = 0;
    }

  } else if (dog.phase === "hide") {
    // short pause, then start the actual game
    if (stateTimer > 20) {
      gameState = "playing";
      resetDuck();
    }
  }
}

function drawDog() {
  if (dog.phase === "hide") return;   // dog is in the grass, don't draw it

  push();
  translate(round(dog.x), round(dog.baseY + dog.jumpOffset));
  scale(-1, 1);   // flip horizontally so the dog faces right
  noStroke();

  // body
  fill(142, 92, 50);
  rect(-30, -12, 60, 24);

  // white snout / face
  fill(255);
  rect(-45, -18, 28, 20);

  // top of head
  fill(163, 110, 62);
  rect(-45, -26, 28, 10);

  // ears
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

  // legs
  fill(142, 92, 50);
  rect(-18, 12, 8, 14);
  rect(-2,  12, 8, 14);
  rect(14,  10, 8, 16);

  // tail
  fill(142, 92, 50);
  rect(30, -6, 12, 6);

  // little label during the sniff phase
  // we counter-scale here because the outer scale(-1,1) would mirror the text
  if (dog.phase === "sniff") {
    push();
    scale(-1, 1);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text("sniffing around...", 0, -42);
    pop();
  }

  pop();
}

// duck spawning and movement
// called after each duck dies or escapes — spawns the next one
// also checks if the round is over
function resetDuck() {
  bullets = [];   // clear any bullets that are still in the air

  // check if we've gone through all 10 ducks
  if (ducksHit + ducksMissed >= ducksPerRound) {
    if (ducksHit === ducksPerRound) {
      score += 5000;          // perfect round bonus!
      perfectRound        = true;
      perfectMessageTimer = 150;
    }
    logMetrics();
    gameState = "gameOver";
    return;
  }

  // reset shots and timing for the new duck
  shotsLeft      = 3;
  duckSpawnTime  = millis();
  firstShotFired = false;

  let spawnFromGrass = random() < 0.5;   // 50% chance duck bursts up from the grass
  let direction      = random() < 0.5 ? 1 : -1;

  if (spawnFromGrass) {
    // duck launches upward from a random spot along the ground
    let isFast  = random() < 0.15;   // 15% chance of a fast duck
    let spawnX  = random(160, width - 160);
    direction   = spawnX < width / 2 ? 1 : -1;   // fly away from center

    duck = {
      x:           spawnX,
      y:           height - 120,
      w:           46,
      h:           26,
      speedX:      random(isFast ? 8 : 6, isFast ? 10 : 8) * direction,
      speedY:      -5.2,      // shoots upward on spawn
      wingOffset:  0,
      launchFrames: 24,       // frames where the duck is still rising steeply
      state:            "flying",
      gravity:          0.35,
      fallSpeed:        0,
      fallTimer:        0,
      facing:           direction,
      isFast:           isFast,
      survivalRecorded: false    // prevents double-recording survival time
    };

  } else {
    // duck flies in from off the left or right edge
    let isFast = random() < 0.15;

    duck = {
      x:           direction === 1 ? -60 : width + 60,
      y:           random(80, height - 210),
      w:           46,
      h:           26,
      speedX:      random(isFast ? 8.5 : 6.5, isFast ? 11 : 9) * direction,
      speedY:      random(-2, 2),
      wingOffset:  0,
      launchFrames: 0,
      state:            "flying",
      gravity:          0.35,
      fallSpeed:        0,
      fallTimer:        0,
      facing:           direction,
      isFast:           isFast,
      survivalRecorded: false    // prevents double-recording survival time
    };
  }
}

function updateDuck() {
  // if the duck was shot, just let it fall to the ground
  if (duck.state === "falling") {
    duck.y         += duck.fallSpeed;
    duck.fallSpeed += duck.gravity;
    duck.wingOffset = 0;

    if (duck.y > height - 92) {
      resetDuck();   // landed, move on to next duck
    }

    if (hitMessageTimer > 0) hitMessageTimer--;
    return;
  }

  // normal flying movement
  duck.x += duck.speedX;
  duck.y += duck.speedY;

  // face the direction it's moving
  duck.facing     = duck.speedX >= 0 ? -1 : 1;
  duck.wingOffset = sin(frameCount * 0.45) * 8;   // flapping wings

  // slow down the steep upward launch over 24 frames
  if (duck.launchFrames > 0) {
    duck.launchFrames--;
    duck.speedY += 0.15;

    if (duck.launchFrames === 0) {
      duck.speedY = random(-2, 2);   // settle into normal erratic flying
    }
  }

  // random flutter to make the path feel natural
  duck.speedY += random(-0.18, 0.18);
  duck.speedY  = constrain(duck.speedY, -3, 3);

  // bounce off top and bottom boundaries
  if (duck.y < 70)            duck.speedY =  abs(duck.speedY);
  if (duck.y > height - 150)  duck.speedY = -abs(duck.speedY);

  // duck flew off the side — counts as a miss
  if (duck.x > width + 80 || duck.x < -80) {
    if (!duck.survivalRecorded) {
      survivalTimes.push((millis() - duckSpawnTime) / 1000);
      duck.survivalRecorded = true;
    }
    ducksMissed++;
    resetDuck();
  }

  if (hitMessageTimer > 0) hitMessageTimer--;
}

function drawDuck() {
  push();
  translate(round(duck.x), round(duck.y));
  scale(duck.facing, 1);

  // rotate sideways when falling after being shot
  if (duck.state === "falling") {
    rotate(radians(90));
  }

  noStroke();

  // wing (flaps up and down using wingOffset)
  fill(86, 56, 24);
  rect(-2,  -8  + round(duck.wingOffset * 0.3), 14, 8);
  rect( 8,  -14 + round(duck.wingOffset * 0.3),  8, 8);

  // tail feathers
  fill(65, 40, 14);
  rect(18, -6, 8, 8);
  rect(26, -10, 6, 6);

  // body
  fill(112, 74, 31);
  rect(-16, -10, 30, 20);
  rect( 10,  -6,  8, 12);

  // chest highlight
  fill(148, 103, 55);
  rect(-10, -2, 10, 8);

  // neck and head (green mallard color)
  fill(34, 122, 74);
  rect(-24, -14, 10, 10);
  rect(-32, -14, 10, 10);
  rect(-24,  -6,  8,  6);

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

//  bullet system
// bullet starts just to the left and slightly below the aim point,
// then travels diagonally right toward where the player clicked
// it also shrinks as it moves — giving a 3D depth look
function mousePressed() {
  // handle game over screen buttons first
  if (gameState === "gameOver") {
    // Download CSV button (rect 340,426 → 560,462)
    if (mouseX > 340 && mouseX < 560 && mouseY > 426 && mouseY < 462) {
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

  // record how long the player waited before firing at this duck
  if (!firstShotFired) {
    firstShotTimes.push((millis() - duckSpawnTime) / 1000);
    firstShotFired = true;
  }

  bullets.push({
    x:           mouseX - 65,  // start to the left of the cursor
    y:           mouseY + 18,  // slightly below (like from behind the player's shoulder)
    targetX:     mouseX,       // where the player actually aimed — hit check waits until here
    vx:          4,            // moving right
    vy:          -1.4,         // moving slightly upward
    bulletScale: 3.2           // starts larger, shrinks as it travels
  });
}

// moves each bullet diagonally and shrinks it — hit is checked at the
// bullet's current position each frame as it travels through the scene
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let b = bullets[i];
    b.x           += b.vx;
    b.y           += b.vy;
    b.bulletScale *= BULLET_DECAY;   // shrink each frame for the depth effect

    // only check for a hit once the bullet has traveled to the aimed position —
    // this way the click itself doesn't register the hit, the bullet has to get there
    if (b.x < b.targetX) continue;

    if (duck.state === "flying" && hitDuck(b.x, b.y)) {
      score        += 500;
      ducksHit++;
      hitMessageTimer  = 20;
      missMessageTimer = 0;

      // record how long this duck survived before being hit
      if (!duck.survivalRecorded) {
        survivalTimes.push((millis() - duckSpawnTime) / 1000);
        duck.survivalRecorded = true;
      }

      duck.state     = "falling";
      duck.fallSpeed = 1.5;
      duck.speedX    = 0;
      duck.speedY    = 0;

      bullets = [];
      break;
    }

    // remove bullet once it's too small to see or flies off screen
    if (b.bulletScale < 0.1 || b.x > width + 20 || b.y < -20) {
      bullets.splice(i, 1);

      if (bullets.length === 0 && shotsLeft === 0 && duck.state === "flying") {
        // all shots used and all bullets missed — record survival and move on
        if (!duck.survivalRecorded) {
          survivalTimes.push((millis() - duckSpawnTime) / 1000);
          duck.survivalRecorded = true;
        }
        missMessageTimer = 20;
        hitMessageTimer  = 0;
        ducksMissed++;
        resetDuck();
      }
    }
  }
}

// draws each bullet as a side-view pixel-art casing, rotated to face its
// travel direction and scaled down as it moves deeper into the scene
function drawBullets() {
  for (let b of bullets) {
    push();
    translate(round(b.x), round(b.y));
    rotate(atan2(b.vy, b.vx) + HALF_PI);  // point in the direction it's traveling
    scale(b.bulletScale);                  // gets smaller as it "moves away"
    noStroke();

    // bright tip
    fill(255, 235, 80);
    rect(-1, -9, 2, 2);

    // upper tip
    fill(245, 200, 50);
    rect(-2, -7, 4, 3);

    // lower tip / shoulder
    fill(220, 165, 30);
    rect(-3, -4, 6, 3);

    // amber casing body
    fill(195, 115, 15);
    rect(-3, -1, 6, 7);

    // highlight stripe
    fill(225, 150, 35);
    rect(-1, 0, 2, 5);

    // dark base rim
    fill(110, 55, 8);
    rect(-3, 6, 6, 3);

    pop();
  }
}

// simple bounding-box check — did point (px, py) land inside the duck?
function hitDuck(px, py) {
  return (
    px > duck.x - duck.w / 2 &&
    px < duck.x + duck.w / 2 &&
    py > duck.y - duck.h / 2 - 6 &&
    py < duck.y + duck.h / 2 + 6
  );
}


//  hud and feedback messages
function drawHUD() {
  let hudY = height - 70;

  // dark brown bottom panel
  noStroke();
  fill(90, 60, 10);
  rect(0, height - 90, width, 90);

  // decorative gun on the far left
  drawGun();

  // shots remaining
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

  // HIT row (red = hit, white = missed, dark = not yet)
  stroke(255);
  noFill();
  rect(250, hudY - 10, 330, 50);

  noStroke();
  fill(255);
  text("HIT", 265, hudY);

  for (let i = 0; i < ducksPerRound; i++) {
    if (i < ducksHit) {
      fill(255, 60, 60);   // red = killed
    } else if (i < ducksHit + ducksMissed) {
      fill(255);            // white = escaped
    } else {
      fill(80);             // dark = not yet
    }
    rect(315 + i * 24, hudY + 18, 14, 14);
  }

  // --- SCORE ---
  stroke(255);
  noFill();
  rect(680, hudY - 10, 170, 50);

  noStroke();
  fill(255);
  textAlign(LEFT, TOP);
  text("SCORE",       700, hudY);
  text(nf(score, 6),  700, hudY + 22);   // nf pads with leading zeros
}

// pixel-art handgun sitting in the bottom-left of the HUD, pointing right
function drawGun() {
  push();
  translate(8, height - 52);
  noStroke();

  // barrel
  fill(50, 50, 55);
  rect(18, -3, 28, 5);

  // muzzle tip
  fill(35, 35, 40);
  rect(44, -5, 5, 9);

  // slide (top of the gun)
  fill(80, 80, 85);
  rect(8, -10, 24, 8);

  // slide detail line
  fill(60, 60, 65);
  rect(10, -9, 20, 2);

  // frame (lower body)
  fill(65, 65, 70);
  rect(6, -2, 22, 8);

  // trigger guard
  fill(55, 55, 60);
  rect(14, 5, 11, 2);
  rect(14, 5, 2,  6);
  rect(23, 5, 2,  6);

  // grip
  fill(90, 52, 22);
  rect(6, 6, 13, 20);

  // grip texture lines
  fill(65, 35, 10);
  rect(8,  9, 9, 2);
  rect(8, 13, 9, 2);
  rect(8, 17, 9, 2);
  rect(8, 21, 9, 2);

  pop();
}

function isOverCSVButton() {
  return mouseX > 340 && mouseX < 560 && mouseY > 426 && mouseY < 462;
}

function drawCrosshair() {
  stroke(220, 30, 30);
  strokeWeight(2);
  line(mouseX - 12, mouseY,      mouseX + 12, mouseY);
  line(mouseX,      mouseY - 12, mouseX,      mouseY + 12);
  noFill();
  circle(mouseX, mouseY, 22);
}

function drawHitMessage() {
  if (hitMessageTimer > 0) {
    fill(255, 215, 0);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("HIT!", width / 2, 50);
  }
}

function drawMissMessage() {
  if (missMessageTimer > 0) {
    fill(255, 80, 80);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("MISS!", width / 2, 85);
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


//  game over screen
function drawGameOver() {
  // dark overlay
  fill(0, 190);
  rect(0, 0, width, height);

  let avgFirstShot = firstShotTimes.length > 0
    ? (firstShotTimes.reduce((a, b) => a + b, 0) / firstShotTimes.length).toFixed(2) + "s"
    : "--";
  let avgSurvival  = survivalTimes.length > 0
    ? (survivalTimes.reduce((a, b) => a + b, 0) / survivalTimes.length).toFixed(2) + "s"
    : "--";
  let accuracy     = shotsFired > 0 ? round((ducksHit / shotsFired) * 100) : 0;
  let shotsPerKill = ducksHit > 0 ? (shotsFired / ducksHit).toFixed(2) : "--";

  // title
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("GAME OVER", width / 2, 45);

  // round counter
  fill(160, 200, 255);
  textSize(16);
  text("Round " + playNum, width / 2, 74);

  if (perfectRound) {
    fill(255, 215, 0);
    textSize(17);
    text("PERFECT ROUND  +5000 pts", width / 2, 97);
  }

  // two-column metrics table
  let labelX = 280;
  let valueX = 620;
  let startY = 122;
  let rowH   = 34;

  let labels = [
    "Final Score",
    "Ducks Hit",
    "Ducks Missed",
    "Total Shots Used",
    "Accuracy",
    "Shots Per Kill",
    "Avg Time to First Shot",
    "Avg Duck Survival Time"
  ];
  let values = [
    nf(score, 6),
    ducksHit + " / " + ducksPerRound,
    ducksMissed,
    shotsFired,
    accuracy + "%",
    shotsPerKill,
    avgFirstShot,
    avgSurvival
  ];

  for (let i = 0; i < labels.length; i++) {
    let y = startY + i * rowH;

    // alternating row tint for readability
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

  // press R hint
  fill(200);
  textAlign(CENTER, CENTER);
  textSize(15);
  text("Press R to play again", width / 2, 408);

  // --- Download CSV button ---
  fill(30, 120, 70);
  noStroke();
  rect(340, 426, 220, 36, 4);
  fill(255);
  textSize(15);
  text("Download CSV  (" + allRounds.length + " rounds)", 450, 444);
}

// called once when a round ends — saves the row and logs to console
function logMetrics() {
  let accuracy     = shotsFired > 0 ? round((ducksHit / shotsFired) * 100) : 0;
  let shotsPerKill = ducksHit > 0 ? (shotsFired / ducksHit).toFixed(2) : "N/A";
  let avgFirstShot = firstShotTimes.length > 0
    ? (firstShotTimes.reduce((a, b) => a + b, 0) / firstShotTimes.length).toFixed(2)
    : "N/A";
  let avgSurvival  = survivalTimes.length > 0
    ? (survivalTimes.reduce((a, b) => a + b, 0) / survivalTimes.length).toFixed(2)
    : "N/A";

  // append this round to the session record
  playNum++;
  allRounds.push({
    play:         playNum,
    score:        score,
    ducksHit:     ducksHit,
    ducksMissed:  ducksMissed,
    shotsFired:   shotsFired,
    accuracy:     accuracy,
    shotsPerKill: shotsPerKill,
    avgFirstShot: avgFirstShot,
    avgSurvival:  avgSurvival,
    firstShotArr: [...firstShotTimes],
    survivalArr:  [...survivalTimes]
  });

  console.log("=== DUCK HUNT — ROUND " + playNum + " RESULTS ===");
  console.log("Score:                  ", score);
  console.log("Ducks Hit:              ", ducksHit, "/ 10");
  console.log("Ducks Missed:           ", ducksMissed);
  console.log("Total Shots Used:       ", shotsFired);
  console.log("Accuracy:               ", accuracy + "%");
  console.log("Shots Per Kill:         ", shotsPerKill);
  console.log("Avg Time to First Shot: ", avgFirstShot + "s");
  console.log("Avg Duck Survival Time: ", avgSurvival + "s");
  console.log("--- raw arrays ---");
  console.log("First shot times (s):  ", firstShotTimes);
  console.log("Survival times (s):    ", survivalTimes);
  console.log("Total rounds recorded this session:", allRounds.length);
  console.log("=================================");
}

// builds a CSV from allRounds and triggers a browser download
function downloadCSV() {
  if (allRounds.length === 0) {
    console.log("No data to download yet.");
    return;
  }

  let lines = [];

  // build per-duck column headers (Duck 1 through Duck 10)
  let firstShotHeaders = [];
  let survivalHeaders  = [];
  for (let i = 1; i <= ducksPerRound; i++) {
    firstShotHeaders.push("First Shot Time Duck " + i + " (s)");
    survivalHeaders.push("Survival Length Duck " + i + " (s)");
  }

  // header row
  lines.push([
    "Round", "Score", "Ducks Hit", "Ducks Missed",
    "Total Shots", "Accuracy %", "Shots Per Kill",
    "Avg First Shot (s)", "Avg Survival (s)",
    ...firstShotHeaders,
    ...survivalHeaders
  ].join(","));

  // one row per round
  for (let r of allRounds) {
    // pad each per-duck array to 10 entries so columns always line up
    let firstShotCols = [];
    let survivalCols  = [];
    for (let i = 0; i < ducksPerRound; i++) {
      firstShotCols.push(r.firstShotArr[i] !== undefined ? r.firstShotArr[i].toFixed(3) : "");
      survivalCols.push(r.survivalArr[i]   !== undefined ? r.survivalArr[i].toFixed(3)  : "");
    }

    lines.push([
      r.play,
      r.score,
      r.ducksHit,
      r.ducksMissed,
      r.shotsFired,
      r.accuracy,
      r.shotsPerKill,
      r.avgFirstShot,
      r.avgSurvival,
      ...firstShotCols,
      ...survivalCols
    ].join(","));
  }

  saveStrings(lines, "duck_hunt_slow_bullet_version", "csv");
}


//  keyboard input
function keyPressed() {
  // SPACE on the title screen starts the dog intro
  if (keyCode === 32 && gameState === "intro") {
    startDogIntro();
    return false;
  }

  // R on the game over screen restarts everything
  if ((key === "r" || key === "R") && gameState === "gameOver") {
    setupIntro();
    return false;
  }
}
