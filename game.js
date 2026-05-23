const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");

// Grid configuration (20x20 blocks inside 600x600 canvas)
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// --- Game States ---
let score = 0;
let highScore = 0;
let gameIsOn = true;

// Snake & Food Initial Setup
let snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
];
let food = { x: 15, y: 15 };

// Initial Moving Direction (Python Default)
let dx = 1;
let dy = 0;

// Listen for keyboard controls
window.addEventListener("keydown", handleKeyPress);
canvas.addEventListener("click", handleCanvasClick);

function handleKeyPress(e) {
    if(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
        e.preventDefault(); // Browser scroll lock
    }

    if (!gameIsOn) return;

    // Direction changes (Prevent snake from reversing into itself)
    if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && dy === 0) { dx = 0; dy = -1; }
    if ((e.key === "ArrowDown" || e.key === "s" || e.key === "S") && dy === 0) { dx = 0; dy = 1; }
    if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && dx === 0) { dx = -1; dy = 0; }
    if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && dx === 0) { dx = 1; dy = 0; }
}

function generateFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);

    // Ensure food doesn't spawn on top of snake body
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) {
            generateFood();
        }
    });
}

function main() {
    if (!gameIsOn) {
        showGameOverMenu();
        return;
    }

    // Snake movement speed controller (Approx 100ms lag)
    setTimeout(function onTick() {
        clearCanvas();
        drawFood();
        moveSnake();
        drawSnake();
        drawScore();
        checkCollision();
        main();
    }, 100);
}

function clearCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    snake.forEach((part, index) => {
        // Head is bright green, body segments are slightly darker green
        ctx.fillStyle = index === 0 ? "#00ff00" : "#00aa00";
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function moveSnake() {
    // Create new head based on direction offsets
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Check if snake ate the food
    if (snake[0].x === food.x && snake[0].y === food.y) {
        score += 1;
        if (score > highScore) highScore = score;
        generateFood();
    } else {
        snake.pop(); // Remove tail if it didn't eat
    }
}

function checkCollision() {
    // Wall Collisions
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) {
        gameIsOn = false;
    }

    // Self Body Collisions
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            gameIsOn = false;
        }
    }
}

function drawScore() {
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Courier New";
    ctx.textAlign = "center";
    ctx.fillText(`Score: ${score}   High Score: ${highScore}`, canvas.width / 2, 40);
}

function showGameOverMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "yellow";
    ctx.font = "bold 26px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("🎉 GAME OVER 🎉", canvas.width / 2, 220);

    ctx.fillStyle = "white";
    ctx.font = "bold 20px Courier New";
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, 270);

    // RESTART Button Graphic
    ctx.fillStyle = "green";
    ctx.fillRect(190, 340, 100, 40);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.fillText("RESTART", 240, 364);

    // CLOSE Button Graphic
    ctx.fillStyle = "gray";
    ctx.fillRect(310, 340, 100, 40);
    ctx.fillStyle = "white";
    ctx.fillText("CLOSE", 360, 364);
}

function showExitScreen() {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ff4500"; 
    ctx.font = "bold 32px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("SESSION TERMINATED", canvas.width / 2, canvas.height / 2 - 60);

    ctx.fillStyle = "#00ff00"; 
    ctx.font = "bold 22px Courier New";
    ctx.fillText("Thank you for Playing Snake!", canvas.width / 2, canvas.height / 2);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "16px Courier New";
    ctx.fillText("This game module is now inactive.", canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillText("You can safely close this browser tab.", canvas.width / 2, canvas.height / 2 + 70);

    ctx.fillStyle = "#555555";
    ctx.font = "14px Courier New";
    ctx.fillText("Module developed by Ghulam Fatima.", canvas.width / 2, canvas.height / 2 + 120);
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function handleCanvasClick(e) {
    if (gameIsOn) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // RESTART Button Area Check (190 to 290 X)
    if (x > 190 && x < 290 && y > 340 && y < 380) {
        score = 0;
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        dx = 1;
        dy = 0;
        gameIsOn = true;
        generateFood();
        main(); // Restart core interval execution
    } 
    // CLOSE Button Area Check (310 to 410 X)
    else if (x > 310 && x < 410 && y > 340 && y < 380) {
        canvas.removeEventListener("click", handleCanvasClick);
        showExitScreen();
    }
}

// Kickstart game logic
generateFood();
main();