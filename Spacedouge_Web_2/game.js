const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

// --- Game States ---
let score = 0;
let highScore = 0;
let gameIsOn = true;
let startTime = Date.now();

// --- Player Object (Spaceship/Doge representation) ---
let player = {
    x: 375,
    y: 520,
    width: 50,
    height: 40,
    speed: 8,
    color: "#00ffff" // Cyan colored ship
};

// --- Obstacles (Falling Stars/Asteroids) ---
let obstacles = [];
let obstacleSpawnRate = 30; // Spawns every 30 frames
let frameCount = 0;
let baseFallSpeed = 4;

// Control Flags for smooth touch/keyboard coordination
let keys = {};
let touchMoveLeft = false;
let touchMoveRight = false;

// Listen for keyboard controls
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => keys[e.key] = false);

// --- NEW MOBILE TOUCH SENSORS (Invisible Split Controls) ---
canvas.addEventListener("touchstart", handleMobileTouch, { passive: false });
canvas.addEventListener("touchmove", handleMobileTouch, { passive: false });
canvas.addEventListener("touchend", () => {
    touchMoveLeft = false;
    touchMoveRight = false;
}, { passive: false });

canvas.addEventListener("click", handleCanvasClick);

function handleMobileTouch(e) {
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    
    // --- FIXED TOUCH BUTTONS WITH RESPONSIVE SCALING ---
    if (!gameIsOn) {
        const touch = e.touches[0];
        const touchX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
        const touchY = ((touch.clientY - rect.top) / rect.height) * canvas.height;
        
        if (touchX > 290 && touchX < 390 && touchY > 340 && touchY < 380) {
            triggerRestart();
        } else if (touchX > 410 && touchX < 510 && touchY > 340 && touchY < 380) {
            canvas.removeEventListener("click", handleCanvasClick);
            showExitScreen();
        }
        return;
    }

    // Split screen detection for movement
    const touchX = e.touches[0].clientX - rect.left;
    const canvasDisplayWidth = rect.width;

    if (touchX < canvasDisplayWidth / 2) {
        touchMoveLeft = true;
        touchMoveRight = false;
    } else {
        touchMoveRight = true;
        touchMoveLeft = false;
    }
}

function spawnObstacle() {
    let size = Math.random() * (40 - 15) + 15; // Random sizes
    let xPos = Math.random() * (canvas.width - size);
    
    // Dynamic Speed increment based on current score/time
    let speedBonus = Math.min(score / 5, 6); 

    obstacles.push({
        x: xPos,
        y: -size,
        width: size,
        height: size,
        speed: baseFallSpeed + speedBonus,
        color: "#ff3333" // Red obstacles
    });
}

function movePlayer() {
    // Left controls (ArrowLeft or 'a' or Mobile Touch Left)
    if (keys["ArrowLeft"] || keys["a"] || keys["A"] || touchMoveLeft) {
        if (player.x > 0) player.x -= player.speed;
    }
    // Right controls (ArrowRight or 'd' or Mobile Touch Right)
    if (keys["ArrowRight"] || keys["d"] || keys["D"] || touchMoveRight) {
        if (player.x < canvas.width - player.width) player.x += player.speed;
    }
}

function triggerRestart() {
    score = 0;
    obstacles = [];
    frameCount = 0;
    player.x = 375;
    gameIsOn = true;
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    // Clear Screen
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameIsOn) {
        movePlayer();

        // Manage Obstacle Spawning
        frameCount++;
        if (frameCount % obstacleSpawnRate === 0) {
            spawnObstacle();
        }

        // Move and Check Obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.y += obs.speed;

            // Point scored if obstacle passes bottom screen successfully
            if (obs.y > canvas.height) {
                obstacles.splice(i, 1);
                score++;
                if (score > highScore) highScore = score;
                continue;
            }

            // Box Collision Detection (AABB)
            if (obs.x < player.x + player.width &&
                obs.x + obs.width > player.x &&
                obs.y < player.y + player.height &&
                obs.y + obs.height > player.y) {
                gameIsOn = false; // Crash!
            }
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
    ctx.fillText(`Dodge Score: ${score}   High Score: ${highScore}`, canvas.width / 2, 40);

    // Draw Player Ship (Triangle/Rectangle hybrid shape)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y + 15, player.width, player.height - 15);
    ctx.beginPath();
    ctx.moveTo(player.x, player.y + 15);
    ctx.lineTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x + player.width, player.y + 15);
    ctx.fill();

    // Draw Falling Obstacles
    obstacles.forEach(obs => {
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });
}

function showGameOverMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "yellow";
    ctx.font = "bold 26px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("🚀 SHIP DESTROYED 🚀", canvas.width / 2, 220);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Courier New";
    ctx.fillText(`Survivals: ${score} Obstacles`, canvas.width / 2, 270);

    // RESTART Button Graphic
    ctx.fillStyle = "green";
    ctx.fillRect(290, 340, 100, 40);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.fillText("RESTART", 340, 364);

    // CLOSE Button Graphic
    ctx.fillStyle = "gray";
    ctx.fillRect(410, 340, 100, 40);
    ctx.fillStyle = "white";
    ctx.fillText("CLOSE", 460, 364);
}

function showExitScreen() {
    ctx.fillStyle = "#05050a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ff4500"; 
    ctx.font = "bold 40px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("SESSION TERMINATED", canvas.width / 2, canvas.height / 2 - 60);

    ctx.fillStyle = "#00ff00"; 
    ctx.font = "bold 24px Courier New";
    ctx.fillText("Thank you for playing Space Dodge!", canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "18px Courier New";
    ctx.fillText("This game module is now inactive.", canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText("You can safely close this browser tab.", canvas.width / 2, canvas.height / 2 + 80);

    ctx.fillStyle = "#555555";
    ctx.font = "14px Courier New";
    ctx.fillText("Module developed by Ghulam Fatima.", canvas.width / 2, canvas.height / 2 + 130);
}

// --- FIXED LAPTOP MOUSE CLICK WITH RESPONSIVE SCALING ---
function handleCanvasClick(e) {
    if (gameIsOn) return;

    const rect = canvas.getBoundingClientRect();
    
    // Scaling calculations to map mouse clicks directly to the game's coordinate system
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // RESTART Button Area Check (290 to 390 X, 340 to 380 Y)
    if (x > 290 && x < 390 && y > 340 && y < 380) {
        triggerRestart();
    } 
    // CLOSE Button Area Check (410 to 510 X, 340 to 380 Y)
    else if (x > 410 && x < 510 && y > 340 && y < 380) {
        canvas.removeEventListener("click", handleCanvasClick);
        showExitScreen();
    }
}

// Kickstart game rendering
gameLoop();