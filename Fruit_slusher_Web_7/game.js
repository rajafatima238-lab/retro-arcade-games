// --- CANVAS INITIALIZATION WITH EXACT HTML ID ---
const canvas = document.getElementById("FruitSlusher"); 
const ctx = canvas.getContext("2d");

// --- Game Settings & States ---
let score = 0;
let highScore = 0;
let gameIsOn = true;  
let isClosed = false;   
let frameCount = 0;
let baseFallSpeed = 5.5; // Perfect thrust to jump high into mid-screen
let spawnRate = 40;     

// --- Interactive Dagger (Sword) Setup ---
let sword = {
    x: 300, 
    y: 300, 
    size: 35 
};

// --- Items & Particles Arrays ---
let items = [];
let juiceParticles = [];

// --- Professional Vector Paths for Fruit Outlines ---
const paths = {
    pineapple: "M 0,-25 L 6,-18 L 3,-10 L 8,-5 L 4,2 L 10,5 L 12,0 L 15,8 L 10,15 L 12,22 L 8,28 L 0,32 L -8,28 L -12,22 L -10,15 L -15,8 L -12,0 L -10,5 L -4,2 L -8,-5 L -3,-10 L -6,-18 Z",
    apple: "M 0,-18 C 8,-22 18,-18 20,-8 C 22,5 15,18 7,22 C 3,24 -3,24 -7,22 C -15,18 -22,5 -20,-8 C -18,-18 -8,-22 0,-18 Z",
    watermelon: "M -30,-12 C -18,-20 18,-20 30,-12 C 24,12 12,25 0,25 C -12,25 -24,12 -30,-12 Z",
    banana: "M -25,-18 C -8,-15 12,-8 22,8 C 15,18 2,18 -12,10 C -20,3 -22,-5 -25,-18 Z",
    strawberry: "M 0,-22 C 12,-22 22,-8 12,15 C 7,22 0,26 -7,15 C -22,-8 -12,-22 0,-22 Z",
    orange: "M 0,-20 C 12,-20 20,-12 20,0 C 20,12 12,20 0,20 C -12,20 -20,12 -20,0 C -20,-12 -12,-20 0,-20 Z",
    bomb: "M 0,-15 C 10,-15 18,-7 18,3 C 18,13 10,21 0,21 C -10,21 -18,13 -18,3 C -18,-7 -10,-15 0,-15 M 3,-17 L 8,-22 L 12,-20 L 6,-15 Z"
};

const shapes = {};
for (const key in paths) {
    shapes[key] = new Path2D(paths[key]);
}

const fruitPool = [
    { name: "pineapple", type: "fruit", color: "#ffaa00" },  
    { name: "apple", type: "fruit", color: "#ff0055" },      
    { name: "watermelon", type: "fruit", color: "#00ff66" }, 
    { name: "banana", type: "fruit", color: "#ffff00" },     
    { name: "strawberry", type: "fruit", color: "#ff00aa" }, 
    { name: "orange", type: "fruit", color: "#ff5500" },     
    { name: "bomb", type: "bomb", color: "#ff2222" }         
];

// --- INPUT HANDLERS ---
canvas.addEventListener("mousemove", (e) => {
    if (isClosed) return;
    const rect = canvas.getBoundingClientRect();
    sword.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    sword.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
});

canvas.addEventListener("click", handleInteractionClick);
canvas.addEventListener("touchstart", handleMobileTouch, { passive: false });
canvas.addEventListener("touchmove", handleMobileTouch, { passive: false });

function handleMobileTouch(e) {
    if (isClosed) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const touchY = ((touch.clientY - rect.top) / rect.height) * canvas.height;

    if (!gameIsOn) {
        checkButtonBounds(touchX, touchY);
        return;
    }

    sword.x = touchX;
    sword.y = touchY;
}

function handleInteractionClick(e) {
    if (gameIsOn || isClosed) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;
    checkButtonBounds(clickX, clickY);
}

function checkButtonBounds(x, y) {
    if (x > 120 && x < 280 && y > 330 && y < 380) {
        resetGame();
    } 
    else if (x > 320 && x < 480 && y > 330 && y < 380) {
        terminateGameSession();
    }
}

window.addEventListener("keydown", (e) => {
    if (isClosed) return;
    if (e.key === "r" || e.key === "R") resetGame();
    if (e.key === "c" || e.key === "C") terminateGameSession();
});

// --- GAME LOGIC ---
function spawnItem() {
    const itemConfig = fruitPool[Math.floor(Math.random() * fruitPool.length)];
    let speedBonus = Math.min(score * 0.1, 4); 

    // Fruits spawn below the screen and jump upwards
    items.push({
        x: Math.random() * (canvas.width - 160) + 80,
        y: canvas.height + 40, 
        shape: shapes[itemConfig.name],
        type: itemConfig.type,
        color: itemConfig.color,
        dx: (Math.random() - 0.5) * 3.5, 
        dy: -(baseFallSpeed + speedBonus + Math.random() * 3.5) 
    });
}

function createSplash(x, y, color) {
    for (let i = 0; i < 12; i++) {
        juiceParticles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 10,
            dy: (Math.random() - 0.6) * 8,
            color: color,
            radius: Math.random() * 2.5 + 1,
            life: 20
        });
    }
}

function resetGame() {
    score = 0;
    items = [];
    juiceParticles = [];
    frameCount = 0;
    gameIsOn = true;
    isClosed = false;
}

function terminateGameSession() {
    gameIsOn = false;
    isClosed = true;
    items = [];
    juiceParticles = [];

    // Draw Only the Clean Termination Message Screen
    ctx.fillStyle = "#0c0c1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#ff4500"; 
    ctx.font = "bold 32px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("SESSION TERMINATED", canvas.width / 2, canvas.height / 2 - 40);

    ctx.fillStyle = "#00ff66"; 
    ctx.font = "bold 20px 'Courier New'";
    ctx.fillText("Thank you for Playing Fruit Slusher!", canvas.width / 2, canvas.height / 2 + 10);
    
    ctx.fillStyle = "#aaaaaa";
    ctx.font = "16px 'Courier New'";
    ctx.fillText("This game module is now inactive.", canvas.width / 2, canvas.height / 2 + 60);
    ctx.fillText("You can safely close this browser tab.", canvas.width / 2, canvas.height / 2 + 90);

    ctx.fillStyle = "#555555";
    ctx.font = "14px 'Courier New'";
    ctx.fillText("Module developed by Ghulam Fatima.", canvas.width / 2, canvas.height / 2 + 150);
}

function gameLoop() {
    if (isClosed) return; 

    ctx.fillStyle = "#06060c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameIsOn) {
        frameCount++;
        if (frameCount % spawnRate === 0) {
            spawnItem();
        }

        // Particle dynamics
        for (let i = juiceParticles.length - 1; i >= 0; i--) {
            let p = juiceParticles[i];
            p.dy += 0.2;
            p.x += p.dx;
            p.y += p.dy;
            p.life--;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            if (p.life <= 0) juiceParticles.splice(i, 1);
        }

        // Natural Arc Fruit Physics (Jump up, fall down smoothly)
        for (let i = items.length - 1; i >= 0; i--) {
            let item = items[i];
            
            item.dy += 0.16; // Gravity factor pushing fruits down naturally
            item.x += item.dx;
            item.y += item.dy;

            // Delete item if it falls completely past the bottom edge
            if (item.y > canvas.height + 60 && item.dy > 0) {
                items.splice(i, 1);
                continue;
            }

            // Slicing collision logic
            let dx = sword.x - item.x;
            let dy = sword.y - item.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < sword.size) {
                createSplash(item.x, item.y, item.color);
                items.splice(i, 1);

                if (item.type === "bomb") {
                    gameIsOn = false;
                } else {
                    score++;
                    if (score > highScore) highScore = score;
                }
                continue;
            }
        }

        renderActiveObjects();
    } else {
        renderGameOverMenu();
    }

    requestAnimationFrame(gameLoop);
}

function renderActiveObjects() {
    ctx.fillStyle = "#00ffff";
    ctx.font = "bold 22px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText(`Score: ${score}   High Score: ${highScore}`, canvas.width / 2, 45);

    // Render Neon Fruits with Perfect 1.7x Scale Sizing
    items.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.scale(1.7, 1.7); 
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2; 

        ctx.shadowColor = item.color;
        ctx.shadowBlur = 8;
        ctx.stroke(item.shape);
        ctx.restore();
    });

    // Render Dagger
    ctx.fillStyle = "#ffffff";
    ctx.font = "26px Arial";
    ctx.textAlign = "center";
    ctx.fillText("🗡️", sword.x, sword.y + 8);
}

function renderGameOverMenu() {
    ctx.fillStyle = "rgba(4, 4, 10, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ff1155";
    ctx.font = "bold 26px 'Courier New'";
    ctx.textAlign = "center";
    ctx.fillText("💥 BOMB DETONATED 💥", canvas.width / 2, 180);

    ctx.fillStyle = "#ff3333";
    ctx.font = "bold 38px 'Courier New'";
    ctx.fillText("GAME OVER", canvas.width / 2, 240);

    // Restart Button Box
    ctx.strokeStyle = "#00ff66";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(120, 330, 160, 50);
    ctx.fillStyle = "#00ff66";
    ctx.font = "bold 14px 'Courier New'";
    ctx.fillText("⚡ RESTART [R]", 200, 360);

    // Close Button Box
    ctx.strokeStyle = "#00ffff";
    ctx.strokeRect(320, 330, 160, 50);
    ctx.fillStyle = "#00ffff";
    ctx.fillText("❌ CLOSE [C]", 400, 360);
}

gameLoop();