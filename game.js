const canvas = document.getElementById("starsCanvas");
const ctx = canvas.getContext("2d");

// --- Game States ---
let score = 0;
let highScore = 0;
let lives = 3; // Player has 3 lives against BOMBS!
let gameIsOn = true;
let animationTimer = 0;

// --- Player Object (The Catcher Basket) ---
let player = {
    x: 375,
    y: 530,
    width: 50, // Locked at 50px
    height: 20,
    speed: 11, 
    color: "#00ffcc" 
};

// --- Falling Objects Configuration ---
let items = []; 
let spawnRate = 32; 
let frameCount = 0;
let baseFallSpeed = 3.8;

// Keyboard input management
let keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => keys[e.key] = false);
canvas.addEventListener("click", handleCanvasClick);

function spawnItem() {
    let size = Math.random() * (14 - 9) + 9; 
    let xPos = Math.random() * (canvas.width - size * 2) + size;
    let speedBonus = Math.min(score * 0.22, 6);
    let isBomb = Math.random() < 0.28; 

    items.push({
        x: xPos,
        y: -20,
        size: size,
        speed: baseFallSpeed + speedBonus,
        type: isBomb ? "bomb" : "star"
    });
}

function movePlayer() {
    if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        if (player.x > 0) player.x -= player.speed;
    }
    if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        if (player.x < canvas.width - player.width) player.x += player.speed;
    }
}

// 5-Point Star Geometry
function drawStarShape(cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = "#ffd700";
    ctx.fill();
}

function gameLoop() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameIsOn) {
        movePlayer();

        frameCount++;
        if (frameCount % spawnRate === 0) {
            spawnItem();
        }

        animationTimer++; 

        // Items Loop
        for (let i = items.length - 1; i >= 0; i--) {
            let item = items[i];
            item.y += item.speed;

            // UNDERSTAND INTENT FIX: Star ya Bomb ground se takraye to aaram se delete ho jaye, koi life minus na ho!
            if (item.y - item.size > canvas.height) {
                items.splice(i, 1);
                continue;
            }

            // Collision Detection (Bar se takrana)
            let closestX = Math.max(player.x, Math.min(item.x, player.x + player.width));
            let closestY = Math.max(player.y, Math.min(item.y, player.y + player.height));
            let distX = item.x - closestX;
            let distY = item.y - closestY;
            let distSq = (distX * distX) + (distY * distY);

            if (distSq < (item.size * item.size)) {
                items.splice(i, 1);

                if (item.type === "star") {
                    score++;
                    if (score > highScore) highScore = score;
                } 
                // UNDERSTAND INTENT FIX: Bomb se takraate hi 1 Life minus hogi! 3 dafa takrane par Game Over!
                else if (item.type === "bomb") {
                    lives--;
                    if (lives <= 0) {
                        lives = 0;
                        gameIsOn = false; // 3 lives complete used, game finish!
                    }
                }
            }
        }

        drawObjects();
        requestAnimationFrame(gameLoop);
    } else {
        showGameOverMenu();
    }
}

function drawObjects() {
    // Top Scoreboard Layer
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(`Score: ${score}   High Score: ${highScore}   Bomb Lives: ${lives > 0 ? "❤️ ".repeat(lives) : "💀"}`, canvas.width / 2, 40);

    // 50px Basket
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    items.forEach(item => {
        if (item.type === "star") {
            ctx.shadowColor = "#ffd700";
            ctx.shadowBlur = 12;
            drawStarShape(item.x, item.y, 5, item.size, item.size / 2);
            ctx.shadowBlur = 0;
        } 
        else if (item.type === "bomb") {
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
            ctx.fillStyle = "#262626"; 
            ctx.fill();
            ctx.closePath();

            // Fuse
            ctx.beginPath();
            ctx.strokeStyle = "#8b5a2b"; 
            ctx.lineWidth = 3;
            ctx.moveTo(item.x, item.y - item.size);
            ctx.quadraticCurveTo(item.x + 8, item.y - item.size - 10, item.x + 5, item.y - item.size - 12);
            ctx.stroke();
            ctx.closePath();

            // Pulsing LED
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.size * 0.4, 0, Math.PI * 2);
            let pulse = Math.abs(Math.sin(animationTimer * 0.08));
            ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
            ctx.shadowColor = "red";
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.closePath();
        }
    });
}

function showGameOverMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "bold 26px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("💥 ALL LIVES DESTROYED 💥", canvas.width / 2, 220);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Courier New";
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, 270);

    // RESTART Button
    ctx.fillStyle = "green";
    ctx.fillRect(290, 340, 100, 40);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.fillText("RESTART", 340, 364);

    // CLOSE Button
    ctx.fillStyle = "gray";
    ctx.fillRect(410, 340, 100, 40);
    ctx.fillStyle = "white";
    ctx.fillText("CLOSE", 460, 364);
}

function showExitScreen() {
    ctx.fillStyle = "#060611";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ff4500"; 
    ctx.font = "bold 40px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("SESSION TERMINATED", canvas.width / 2, canvas.height / 2 - 60);

    ctx.fillStyle = "#00ff00"; 
    ctx.font = "bold 24px Courier New";
    ctx.fillText("Thank you for saving the stars!", canvas.width / 2, canvas.height / 2);

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

    // RESTART
    if (x > 290 && x < 390 && y > 340 && y < 380) {
        score = 0;
        lives = 3;
        items = [];
        frameCount = 0;
        player.x = 375;
        animationTimer = 0;
        gameIsOn = true;
        requestAnimationFrame(gameLoop);
    } 
    // CLOSE
    else if (x > 410 && x < 510 && y > 340 && y < 380) {
        canvas.removeEventListener("click", handleCanvasClick);
        showExitScreen();
    }
}

// Start Game
gameLoop();