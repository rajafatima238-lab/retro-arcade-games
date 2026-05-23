const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

// --- Game States ---
let score = 0;
let highScore = 0;
let lives = 3;
let gameIsOn = true;

// --- Player Object (Defender Spaceship) ---
let player = {
    x: 375,
    y: 540,
    width: 50,
    height: 25,
    speed: 8,
    color: "#00ff66" // Neon Cyber Green
};

// --- Lasers & Invaders Dynamic Storage arrays ---
let lasers = [];
let invaders = [];

// Invaders Wave System Configuration
let invaderRows = 4;
let invaderCols = 8;
let invaderWidth = 40;
let invaderHeight = 25;
let invaderPadding = 20;
let invaderOffsetTop = 70;
let invaderOffsetLeft = 80;

let invaderSpeedX = 2;
let invaderSpeedY = 15;
let invaderDirection = 1; // 1 = Right, -1 = Left

// Keyboard Listeners
let keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    // Spacebar mapping to trigger lasers vector
    if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        fireLaser();
    }
    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => keys[e.key] = false);
canvas.addEventListener("click", handleCanvasClick);

// Core Grid Initializer
function setupInvaders() {
    invaders = [];
    for (let r = 0; r < invaderRows; r++) {
        for (let c = 0; c < invaderCols; c++) {
            let invaderX = (c * (invaderWidth + invaderPadding)) + invaderOffsetLeft;
            let invaderY = (r * (invaderHeight + invaderPadding)) + invaderOffsetTop;
            invaders.push({
                x: invaderX,
                y: invaderY,
                width: invaderWidth,
                height: invaderHeight,
                color: r % 2 === 0 ? "#ff00ff" : "#00ffff" // Alternate Pink/Cyan rows
            });
        }
    }
}

function fireLaser() {
    if (!gameIsOn) return;
    // Restricting excessive lasers on screen
    if (lasers.length < 4) {
        lasers.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 15,
            speed: 9,
            color: "#ffff00" // Glowing yellow laser rounds
        });
    }
}

function handleInput() {
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        if (player.x > 0) player.x -= player.speed;
    }
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        if (player.x < canvas.width - player.width) player.x += player.speed;
    }
}

function gameLoop() {
    ctx.fillStyle = "#020205";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameIsOn) {
        handleInput();

        // 1. Process Lasers Movement Engine
        for (let i = lasers.length - 1; i >= 0; i--) {
            lasers[i].y -= lasers[i].speed;
            if (lasers[i].y < 0) {
                lasers.splice(i, 1);
            }
        }

        // 2. Invaders Army Movement Logic
        let shiftDown = false;
        invaders.forEach(inv => {
            inv.x += invaderSpeedX * invaderDirection;
            // Check screen boundaries to shift down like original Python logic
            if (inv.x + inv.width > canvas.width - 20 || inv.x < 20) {
                shiftDown = true;
            }
        });

        if (shiftDown) {
            invaderDirection *= -1;
            invaders.forEach(inv => {
                inv.y += invaderSpeedY;
                // Game Over if invaders breach defense perimeter line
                if (inv.y + inv.height >= player.y) {
                    gameIsOn = false;
                }
            });
        }

        // 3. Collision Engine (Laser VS Invader Matrix)
        for (let l = lasers.length - 1; l >= 0; l--) {
            for (let v = invaders.length - 1; v >= 0; v--) {
                let laser = lasers[l];
                let inv = invaders[v];

                if (laser.x < inv.x + inv.width &&
                    laser.x + laser.width > inv.x &&
                    laser.y < inv.y + inv.height &&
                    laser.y + laser.height > inv.y) {
                    
                    // Collision confirmed
                    invaders.splice(v, 1);
                    lasers.splice(l, 1);
                    score += 10;
                    if (score > highScore) highScore = score;
                    break; 
                }
            }
        }

        // Respawn next wave if current fleet completely vaporized
        if (invaders.length === 0) {
            invaderSpeedX += 0.5; // Difficulty curve acceleration
            setupInvaders();
        }

        drawObjects();
        requestAnimationFrame(gameLoop);
    } else {
        showGameOverMenu();
    }
}

function drawObjects() {
    // Top Scoreboard
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(`SCORE: ${score}    HIGH SCORE: ${highScore}`, canvas.width / 2, 35);

    // Defender Spaceship (Classic Triangle Top Design)
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.fill();
    ctx.closePath();

    // Lasers
    ctx.fillStyle = "#ffff00";
    lasers.forEach(l => {
        ctx.fillRect(l.x, l.y, l.width, l.height);
    });

    // Invaders Army
    invaders.forEach(inv => {
        ctx.fillStyle = inv.color;
        ctx.fillRect(inv.x, inv.y, inv.width, inv.height);
        
        // Inner Alien Core eyes indicator
        ctx.fillStyle = "black";
        ctx.fillRect(inv.x + 8, inv.y + 6, 6, 6);
        ctx.fillRect(inv.x + inv.width - 14, inv.y + 6, 6, 6);
    });
}

function showGameOverMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff0055";
    ctx.font = "bold 32px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("INVASION SUCCESSFUL", canvas.width / 2, 220);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Courier New";
    ctx.fillText(`Final Defense Score: ${score}`, canvas.width / 2, 270);

    // RESTART Button Graphic Zone
    ctx.fillStyle = "green";
    ctx.fillRect(290, 340, 100, 40);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.fillText("RESTART", 340, 364);

    // CLOSE Button Graphic Zone
    ctx.fillStyle = "gray";
    ctx.fillRect(410, 340, 100, 40);
    ctx.fillStyle = "white";
    ctx.fillText("CLOSE", 460, 364);
}

function showExitScreen() {
    ctx.fillStyle = "#02020a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ff4500"; 
    ctx.font = "bold 40px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("SESSION TERMINATED", canvas.width / 2, canvas.height / 2 - 60);

    ctx.fillStyle = "#00ff66"; 
    ctx.font = "bold 24px Courier New";
    ctx.fillText("Thank you for defending the Galaxy!", canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "18px Courier New";
    ctx.fillText("This game module is now inactive.", canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText("You can safely close this browser tab.", canvas.width / 2, canvas.height / 2 + 80);

    ctx.fillStyle = "#555555";
    ctx.font = "14px Courier New";
    ctx.fillText("Module developed by Ghulam Fatima.", canvas.width / 2, canvas.height / 2 + 130);
}

function handleCanvasClick(e) {
    if (gameIsOn) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // RESTART Button Event Bound
    if (x > 290 && x < 390 && y > 340 && y < 380) {
        score = 0;
        lasers = [];
        invaderSpeedX = 2;
        invaderDirection = 1;
        player.x = 375;
        setupInvaders();
        gameIsOn = true;
        requestAnimationFrame(gameLoop);
    } 
    // CLOSE Button Event Bound
    else if (x > 410 && x < 510 && y > 340 && y < 380) {
        canvas.removeEventListener("click", handleCanvasClick);
        showExitScreen();
    }
}

// Initializing the fleet grid and launching core engine
setupInvaders();
gameLoop();