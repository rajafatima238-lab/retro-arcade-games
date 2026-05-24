const canvas = document.getElementById("raceCanvas");
const ctx = canvas.getContext("2d");

// --- Game States ---
let gameIsOn = false;      // Shuru mein false rahegi jab tak user select na kare
let gameState = "BETTING"; // Sates: BETTING, RACING, GAMEOVER
let playerBet = "";        // Player ki choice store karne ke liye
let winner = "";

const finishLineX = 720;

// --- Racers Objects ---
let racerA = { name: "Blue", x: 50, y: 130, size: 30, color: "#00bfff" };
let racerB = { name: "Red", x: 50, y: 230, size: 30, color: "#ff3333" };

canvas.addEventListener("click", handleCanvasClick);

function gameLoop() {
    // Clear track
    ctx.fillStyle = "#222222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === "BETTING") {
        showBettingMenu();
    } 
    else if (gameState === "RACING") {
        drawTrack();
        
        // Random steps mechanics
        let stepA = Math.floor(Math.random() * 10) + 1;
        let stepB = Math.floor(Math.random() * 10) + 1;

        racerA.x += stepA;
        racerB.x += stepB;

        // Check Winner
        if (racerA.x >= finishLineX || racerB.x >= finishLineX) {
            gameState = "GAMEOVER";
            gameIsOn = false;
            
            if (racerA.x >= finishLineX && racerB.x >= finishLineX) winner = "Tie";
            else winner = racerA.x >= finishLineX ? "Blue" : "Red";
        }

        drawRacers();
        setTimeout(() => { requestAnimationFrame(gameLoop); }, 30);
    } 
    else if (gameState === "GAMEOVER") {
        drawTrack();
        drawRacers();
        showGameOverMenu();
    }
}

function drawTrack() {
    ctx.strokeStyle = "#444444";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(30, 185);
    ctx.lineTo(finishLineX, 185);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(finishLineX, 50);
    ctx.lineTo(finishLineX, 330);
    ctx.stroke();

    ctx.fillStyle = "#ffaa00";
    ctx.font = "bold 12px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("FINISH", finishLineX, 40);
}

function drawRacers() {
    ctx.fillStyle = racerA.color;
    ctx.fillRect(racerA.x, racerA.y, racerA.size, racerA.size);
    ctx.fillStyle = "white";
    ctx.fillRect(racerA.x + racerA.size - 8, racerA.y + 10, 6, 10);

    ctx.fillStyle = racerB.color;
    ctx.fillRect(racerB.x, racerB.y, racerB.size, racerB.size);
    ctx.fillStyle = "white";
    ctx.fillRect(racerB.x + racerB.size - 8, racerB.y + 10, 6, 10);
}

// --- NEW FEATURE: MODERN BETTING SCREEN ---
function showBettingMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffaa00";
    ctx.font = "bold 24px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("PLACE YOUR BET!", canvas.width / 2, 120);
    
    ctx.fillStyle = "white";
    ctx.font = "16px Courier New";
    ctx.fillText("Which turtle will win the race?", canvas.width / 2, 160);

    // BLUE BUTTON
    ctx.fillStyle = "#00bfff";
    ctx.fillRect(220, 220, 150, 50);
    ctx.fillStyle = "black";
    ctx.font = "bold 16px Arial";
    ctx.fillText("BET BLUE", 295, 252);

    // RED BUTTON
    ctx.fillStyle = "#ff3333";
    ctx.fillRect(430, 220, 150, 50);
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.fillText("BET RED", 505, 252);
}

function showGameOverMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "yellow";
    ctx.font = "bold 28px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("🏁 RACE FINISHED 🏁", canvas.width / 2, 100);

    // Bet evaluation logic like Python
    ctx.font = "bold 20px Courier New";
    if (winner === "Tie") {
        ctx.fillStyle = "orange";
        ctx.fillText("It's a tie game!", canvas.width / 2, 150);
    } else if (playerBet === winner) {
        ctx.fillStyle = "#00ff00"; // Green for win
        ctx.fillText(`You Won! The ${winner} turtle finished first!`, canvas.width / 2, 150);
    } else {
        ctx.fillStyle = "#ff3333"; // Red for lose
        ctx.fillText(`You Lost! The ${winner} turtle finished first!`, canvas.width / 2, 150);
    }

    // RESTART Button
    ctx.fillStyle = "green";
    ctx.fillRect(290, 250, 100, 40);
    ctx.fillStyle = "white";
    ctx.font = "bold 12px Arial";
    ctx.fillText("RESTART", 340, 274);

    // CLOSE Button
    ctx.fillStyle = "gray";
    ctx.fillRect(410, 250, 100, 40);
    ctx.fillStyle = "white";
    ctx.fillText("CLOSE", 460, 274);
}

function showExitScreen() {
    ctx.fillStyle = "#0c0c0c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ff4500"; 
    ctx.font = "bold 36px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("SESSION TERMINATED", canvas.width / 2, canvas.height / 2 - 50);

    ctx.fillStyle = "#00ff00"; 
    ctx.font = "bold 22px Courier New";
    ctx.fillText("Thank you for playing Turtle Race!", canvas.width / 2, canvas.height / 2 + 10);

    ctx.fillStyle = "#aaaaaa";
    ctx.font = "16px Courier New";
    ctx.fillText("This game module is now inactive.", canvas.width / 2, canvas.height / 2 + 60);
    ctx.fillText("You can safely close this browser tab.", canvas.width / 2, canvas.height / 2 + 90);

    ctx.fillStyle = "#555555";
    ctx.font = "14px Courier New";
    ctx.fillText("Module developed by Ghulam Fatima.", canvas.width / 2, canvas.height / 2 + 140);
}

function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 1. Handle Clicks on BETTING Screen
    if (gameState === "BETTING") {
        // Blue Button Check (220 to 370 X, 220 to 270 Y)
        if (x > 220 && x < 370 && y > 220 && y < 270) {
            playerBet = "Blue";
            gameState = "RACING";
            gameIsOn = true;
            requestAnimationFrame(gameLoop);
        }
        // Red Button Check (430 to 580 X, 220 to 270 Y)
        else if (x > 430 && x < 580 && y > 220 && y < 270) {
            playerBet = "Red";
            gameState = "RACING";
            gameIsOn = true;
            requestAnimationFrame(gameLoop);
        }
    }
    // 2. Handle Clicks on GAMEOVER Screen
    else if (gameState === "GAMEOVER") {
        // RESTART Button Check
        if (x > 290 && x < 390 && y > 250 && y < 290) {
            racerA.x = 50;
            racerB.x = 50;
            winner = "";
            playerBet = "";
            gameState = "BETTING"; // Reset back to selection
            gameLoop();
        } 
        // CLOSE Button Check
        else if (x > 410 && x < 510 && y > 250 && y < 290) {
            canvas.removeEventListener("click", handleCanvasClick);
            showExitScreen();
        }
    }
}

// Start Engine
gameLoop();