const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// --- Game States ---
let scoreA = 0;
let scoreB = 0;
let highScore = 0;
let level = 1;
let gameIsOn = true;

// Speed 2.5x Fast Like Python Code
let baseSpeed = 3.5; 

// --- Game Objects ---
let paddleA = { x: 20, y: 250, width: 15, height: 100 };
let paddleB = { x: 765, y: 250, width: 15, height: 100 };
let ball = { x: 400, y: 300, radius: 10, dx: baseSpeed, dy: baseSpeed, color: "white" };

// --- Key State Tracker ---
let keys = {};

// Mobile touch state track flags
let touchA_Up = false;
let touchA_Down = false;
let touchB_Up = false;
let touchB_Down = false;

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault();
    }
});
window.addEventListener("keyup", (e) => keys[e.key] = false);

// --- ALL INPUT LISTENERS (MOUSE + MOBILE TOUCH) ---
canvas.addEventListener("click", handleCanvasClick);
canvas.addEventListener("touchstart", handleMobileTouch, { passive: false });
canvas.addEventListener("touchmove", handleMobileTouch, { passive: false });
canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

// MOBILE TOUCH CONTROLLER (SPLIT SCREEN FOR BOTH PADDLES)
function handleMobileTouch(e) {
    e.preventDefault();
    
    const rect = canvas.getBoundingClientRect();
    
    // IF GAME OVER: Handle RESTART and CLOSE buttons on touch with scaling
    if (!gameIsOn) {
        const touch = e.touches[0];
        const touchX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
        const touchY = ((touch.clientY - rect.top) / rect.height) * canvas.height;
        
        if (touchX > 290 && touchX < 390 && touchY > 340 && touchY < 380) {
            triggerRestart();
        } else if (touchX > 410 && touchX < 510 && touchY > 340 && touchY < 380) {
            canvas.removeEventListener("click", handleCanvasClick);
            canvas.removeEventListener("touchstart", handleMobileTouch);
            showExitScreen();
        }
        return;
    }

    // Reset touch flags before scanning current touches
    touchA_Up = false;
    touchA_Down = false;
    touchB_Up = false;
    touchB_Down = false;

    // Multi-touch logic loop to support both players touching simultaneously
    for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const relativeX = touch.clientX - rect.left;
        const relativeY = touch.clientY - rect.top;
        const canvasDisplayWidth = rect.width;
        const canvasDisplayHeight = rect.height;

        // Left Half of Screen -> Player A (Blue Paddle)
        if (relativeX < canvasDisplayWidth / 2) {
            if (relativeY < canvasDisplayHeight / 2) {
                touchA_Up = true;
            } else {
                touchA_Down = true;
            }
        } 
        // Right Half of Screen -> Player B (Red Paddle)
        else {
            if (relativeY < canvasDisplayHeight / 2) {
                touchB_Up = true;
            } else {
                touchB_Down = true;
            }
        }
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
    if (e.touches.length === 0) {
        touchA_Up = false;
        touchA_Down = false;
        touchB_Up = false;
        touchB_Down = false;
    }
}

function movePaddles() {
    // Player A Movement (Keys or Touch)
    if (keys["w"] || keys["W"] || touchA_Up) { if (paddleA.y > 0) paddleA.y -= 6; }
    if (keys["s"] || keys["S"] || touchA_Down) { if (paddleA.y < canvas.height - paddleA.height) paddleA.y += 6; }

    // Player B Movement (Keys or Touch)
    if (keys["ArrowUp"] || touchB_Up) { if (paddleB.y > 0) paddleB.y -= 6; }
    if (keys["ArrowDown"] || touchB_Down) { if (paddleB.y < canvas.height - paddleB.height) paddleB.y += 6; }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = -ball.dx;
    ball.dy = (Math.random() > 0.5 ? 1 : -1) * baseSpeed;

    if (scoreA >= 5 || scoreB >= 5) {
        if (scoreA > scoreB) ball.color = "#0000ff";
        else if (scoreB > scoreA) ball.color = "#ff0000";
        else ball.color = "white";
    } else {
        ball.color = "white";
    }
}

function checkWinCondition() {
    if (scoreA === 11 || scoreB === 11) {
        gameIsOn = false;
    }
}

function triggerRestart() {
    scoreA = 0;
    scoreB = 0;
    gameIsOn = true;
    paddleA.y = 250;
    paddleB.y = 250;
    resetBall();
    gameLoop();
}

function gameLoop() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameIsOn) {
        movePaddles();
        ball.x += ball.dx;
        ball.y += ball.dy;

        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.dy = -ball.dy;
        }
        if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.dy = -ball.dy;
        }

        if (ball.x < 0) {
            scoreB++;
            if (scoreB > highScore) highScore = scoreB;
            checkWinCondition();
            if (gameIsOn) resetBall();
        } else if (ball.x > canvas.width) {
            scoreA++;
            if (scoreA > highScore) highScore = scoreA;
            checkWinCondition();
            if (gameIsOn) resetBall();
        }

        if (ball.x - ball.radius < paddleA.x + paddleA.width && ball.x > paddleA.x) {
            if (ball.y > paddleA.y && ball.y < paddleA.y + paddleA.height) {
                ball.dx = Math.abs(ball.dx);
                ball.x = paddleA.x + paddleA.width + ball.radius;
            }
        }

        if (ball.x + ball.radius > paddleB.x && ball.x < paddleB.x + paddleB.width) {
            if (ball.y > paddleB.y && ball.y < paddleB.y + paddleB.height) {
                ball.dx = -Math.abs(ball.dx);
                ball.x = paddleB.x - ball.radius;
            }
        }

        drawObjects();
        requestAnimationFrame(gameLoop);
    } else {
        showGameOverMenu();
    }
}

function drawObjects() {
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(`Player A: ${scoreA}  Player B: ${scoreB}  Level: ${level}  High Score: ${highScore}`, canvas.width / 2, 40);

    ctx.fillStyle = "#0000ff";
    ctx.fillRect(paddleA.x, paddleA.y, paddleA.width, paddleA.height);

    ctx.fillStyle = "#ff0000";
    ctx.fillRect(paddleB.x, paddleB.y, paddleB.width, paddleB.height);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function showGameOverMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "yellow";
    ctx.font = "bold 26px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("🎉 CONGRATULATIONS! 🎉", canvas.width / 2, 220);

    let winner = scoreA === 11 ? "Player A (Blue)" : "Player B (Red)";
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Courier New";
    ctx.fillText(`${winner} Wins the Game!`, canvas.width / 2, 280);

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
    ctx.font = "bold 12px Arial";
    ctx.fillText("CLOSE", 460, 364);
}

function showExitScreen() {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ff4500"; 
    ctx.font = "bold 40px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("SESSION TERMINATED", canvas.width / 2, canvas.height / 2 - 60);

    ctx.fillStyle = "#00ff00"; 
    ctx.font = "bold 24px Courier New";
    ctx.fillText("Thank you for Playing!", canvas.width / 2, canvas.height / 2);

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
    
    // Formula to perfectly map current screen pixels to game matrix (800x600)
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // RESTART Button Click Check
    if (x > 290 && x < 390 && y > 340 && y < 380) {
        triggerRestart();
    } 
    // CLOSE Button Click Check
    else if (x > 410 && x < 510 && y > 340 && y < 380) {
        canvas.removeEventListener("click", handleCanvasClick);
        showExitScreen();
    }
}

// Start Rendering
gameLoop();