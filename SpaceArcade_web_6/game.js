const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

// --- Game States ---
let score = 0;
let highScore = 0;
let gameIsOn = true;

// --- Player Object ---
let player = {
    x: 375,
    y: 540,
    width: 50,
    height: 25,
    speed: 8,
    color: "#00ff66" 
};

// --- Arrays ---
let lasers = [];
let invaders = [];

// Invaders Configuration
let invaderWidth = 40;
let invaderHeight = 25;
let invaderPadding = 20;
let invaderCols = 8;
let invaderOffsetLeft = 80;

let invaderSpeedX = 2.0; 
let invaderSpeedY = 15;
let invaderDirection = 1; 

// --- Keyboard Listeners (For Laptop) ---
let keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        fireLaser();
    }
    if(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => keys[e.key] = false);

// --- TOUCH & CLICK CONTROLS (Only for Responsive Controls) ---

// Screen tap to shoot laser
canvas.addEventListener("click", (e) => {
    if (!gameIsOn) {
        handleMenuClick(e);
        return;
    }
    fireLaser(); 
});

// Touch Move for smooth ship translation on mobile
canvas.addEventListener("touchmove", (e) => {
    if (!gameIsOn) return;
    e.preventDefault(); 
    
    let touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    let touchX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    
    player.x = touchX - player.width / 2;

    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}, { passive: false });

// Mouse drag fallback
canvas.addEventListener("mousemove", (e) => {
    if (!gameIsOn) return;
    const rect = canvas.getBoundingClientRect();
    let mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    
    player.x = mouseX - player.width / 2;
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
});

function setupGame() {
    invaders = [];
    lasers = [];
    
    // Core Invaders Setup (Bunkers array aur extra top rows bilkul REMOVE kar di hain)
    for (let r = 0; r < 3; r++) {
        let colors = ["#ff00ff", "#00ffff", "#ffff00"];
        let rowColor = colors[r % colors.length];

        for (let c = 0; c < invaderCols; c++) {
            let invaderX = (c * (invaderWidth + invaderPadding)) + invaderOffsetLeft;
            invaders.push({
                x: invaderX,
                y: 100 + r * (invaderHeight + invaderPadding),
                width: invaderWidth,
                height: invaderHeight,
                color: rowColor
            });
        }
    }
}

function fireLaser() {
    if (!gameIsOn) return;
    if (lasers.length < 4) {
        lasers.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 15,
            speed: 9,
            color: "#ffff00"
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
    ctx.fillStyle = "#000000"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameIsOn) {
        handleInput();

        for (let i = lasers.length - 1; i >= 0; i--) {
            lasers[i].y -= lasers[i].speed;
            if (lasers[i].y < 0) {
                lasers.splice(i, 1);
            }
        }

        let shiftDown = false;
        invaders.forEach(inv => {
            inv.x += invaderSpeedX * invaderDirection;
            if (inv.x + inv.width > canvas.width - 20 || inv.x < 20) {
                shiftDown = true;
            }
        });

        if (shiftDown) {
            invaderDirection *= -1;
            invaders.forEach(inv => {
                inv.y += invaderSpeedY;
                if (inv.y + inv.height >= player.y) {
                    gameIsOn = false; 
                }
            });
        }

        // Laser Hit Matrix Collision
        for (let l = lasers.length - 1; l >= 0; l--) {
            let laserHit = false;

            for (let v = invaders.length - 1; v >= 0; v--) {
                let laser = lasers[l];
                let inv = invaders[v];

                if (laser.x < inv.x + inv.width &&
                    laser.x + laser.width > inv.x &&
                    laser.y < inv.y + inv.height &&
                    laser.y + laser.height > inv.y) {
                    
                    invaders.splice(v, 1);
                    lasers.splice(l, 1);
                    score += 10;
                    if (score > highScore) highScore = score;
                    laserHit = true;
                    break; 
                }
            }
            if (laserHit) continue;
        }

        if (invaders.length === 0) {
            invaderSpeedX += 0.3;
            setupGame();
        }

        drawObjects();
        requestAnimationFrame(gameLoop);
    } else {
        showGameOverMenu();
    }
}

function drawObjects() {
    // Score Dashboard
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(`SCORE: ${score}    HIGH SCORE: ${highScore}`, canvas.width / 2, 35);

    ctx.fillStyle = "#666666";
    ctx.font = "12px Courier New";
    ctx.fillText("Laptop: Use Arrows & Spacebar | Mobile: Drag ship & Tap screen to fire", canvas.width / 2, 55);

    // Green Spaceship Triangle
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.fill();
    ctx.closePath();

    // Yellow Lasers
    ctx.fillStyle = "#ffff00";
    lasers.forEach(l => {
        ctx.fillRect(l.x, l.y, l.width, l.height);
    });

    // Classic Custom Invaders
    invaders.forEach(inv => {
        ctx.fillStyle = inv.color;
        ctx.fillRect(inv.x, inv.y, inv.width, inv.height);
        ctx.fillStyle = "black";
        ctx.fillRect(inv.x + 8, inv.y + 6, 6, 6);
        ctx.fillRect(inv.x + inv.width - 14, inv.y + 6, 6, 6);
    });
}

function showGameOverMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff0055";
    ctx.font = "bold 32px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, 220);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Courier New";
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, 270);

    // RESTART Button
    ctx.fillStyle = "#00cc44";
    ctx.fillRect(290, 340, 100, 40);
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Courier New";
    ctx.fillText("RESTART", 340, 365);

    // CLOSE Button
    ctx.fillStyle = "#555555";
    ctx.fillRect(410, 340, 100, 40);
    ctx.fillStyle = "white";
    ctx.fillText("CLOSE", 460, 365);
}

function showExitScreen() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#00ff66"; 
    ctx.font = "bold 28px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("Game Closed Successfully", canvas.width / 2, canvas.height / 2);
}

function handleMenuClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    if (x > 290 && x < 390 && y > 340 && y < 380) {
        score = 0;
        player.x = 375;
        invaderSpeedX = 2.0;
        invaderDirection = 1;
        setupGame();
        gameIsOn = true;
        requestAnimationFrame(gameLoop);
    } 
    else if (x > 410 && x < 510 && y > 340 && y < 380) {
        showExitScreen();
    }
}

// Ignition
setupGame();
gameLoop();