const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const messageEl = document.getElementById('message');

const box = 20;
const canvasSize = 400;

let snake, direction, food, score, highScore, gameLoop, gameStarted;
let obstacles = [];
let stage = 1;
let totalScore = 0;
let gameOver = false;
let stageClear = false;

const MAX_STAGE = 5;
const POINTS_PER_APPLE = 10;
const SCORE_TO_ADVANCE = 100;

const stageConfig = {
    1: { speed: 150, obstacleCount: 3,  color: '#0f3460', label: '🌿 Stage 1 — Beginner' },
    2: { speed: 130, obstacleCount: 6,  color: '#1a1a2e', label: '🌲 Stage 2 — Forest' },
    3: { speed: 110, obstacleCount: 10, color: '#2d0a0a', label: '🌋 Stage 3 — Volcano' },
    4: { speed: 90,  obstacleCount: 14, color: '#0a0a2d', label: '🌊 Stage 4 — Deep Sea' },
    5: { speed: 70,  obstacleCount: 18, color: '#1a0a2d', label: '👑 Stage 5 — Final Boss' },
};

// ─── Init ─────────────────────────────────────────────────

function init(keepStage = false) {
    clearInterval(gameLoop);
    gameLoop = null;
    if (!keepStage) {
        stage = 1;
        totalScore = 0;
    }
    snake = [
        { x: 10 * box, y: 10 * box },
        { x: 9  * box, y: 10 * box },
        { x: 8  * box, y: 10 * box }
    ];
    direction = null;
    score = 0;
    highScore = highScore || 0;
    gameStarted = false;
    gameOver = false;
    stageClear = false;
    scoreEl.textContent = totalScore;
    highScoreEl.textContent = highScore;
    generateObstacles();
    spawnFood();
    draw();
    updateStageDisplay();
}

function updateStageDisplay() {
    messageEl.innerHTML = `${stageConfig[stage].label} &nbsp;|&nbsp; Press any arrow key to start`;
}

// ─── Obstacles ────────────────────────────────────────────

function generateObstacles() {
    obstacles = [];
    const count = stageConfig[stage].obstacleCount;
    const safeZone = [
        { x: 7  * box, y: 10 * box },
        { x: 8  * box, y: 10 * box },
        { x: 9  * box, y: 10 * box },
        { x: 10 * box, y: 10 * box },
        { x: 11 * box, y: 10 * box },
        { x: 12 * box, y: 10 * box },
        { x: 7  * box, y: 9  * box },
        { x: 7  * box, y: 11 * box },
    ];
    let attempts = 0;
    while (obstacles.length < count && attempts < 500) {
        attempts++;
        const ox = Math.floor(Math.random() * (canvasSize / box)) * box;
        const oy = Math.floor(Math.random() * (canvasSize / box)) * box;
        const inSafe = safeZone.some(s => s.x === ox && s.y === oy);
        const duplicate = obstacles.some(o => o.x === ox && o.y === oy);
        if (!inSafe && !duplicate) obstacles.push({ x: ox, y: oy });
    }
}

// ─── Food ─────────────────────────────────────────────────

function spawnFood() {
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 500) {
        attempts++;
        food = {
            x: Math.floor(Math.random() * (canvasSize / box)) * box,
            y: Math.floor(Math.random() * (canvasSize / box)) * box
        };
        const onObstacle = obstacles.some(o => o.x === food.x && o.y === food.y);
        const onSnake    = snake.some(s => s.x === food.x && s.y === food.y);
        if (!onObstacle && !onSnake) valid = true;
    }
}

// ─── Draw Helpers ─────────────────────────────────────────

function drawApple(x, y) {
    const cx = x + box / 2;
    const cy = y + box / 2;
    ctx.fillStyle = '#ff3b30';
    ctx.beginPath(); ctx.arc(cx - 2, cy + 2, 7, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 2, cy + 2, 7, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#5c3d1e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 4);
    ctx.lineTo(cx + 3, cy - 9);
    ctx.stroke();
    ctx.fillStyle = '#34c759';
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 8, 4, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawObstacle(x, y) {
    const cx = x + box / 2;
    const cy = y + box / 2;
    if (stage === 1) {
        ctx.fillStyle = '#8e8e93';
        ctx.beginPath(); ctx.roundRect(x + 2, y + 3, box - 4, box - 5, 4); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.roundRect(x + 4, y + 4, 5, 3, 2); ctx.fill();
    } else if (stage === 2) {
        ctx.fillStyle = '#5c3d1e';
        ctx.fillRect(x + 6, y + 8, 8, 10);
        ctx.fillStyle = '#34c759';
        ctx.beginPath(); ctx.arc(cx, cy - 2, 7, 0, Math.PI * 2); ctx.fill();
    } else if (stage === 3) {
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath(); ctx.roundRect(x + 2, y + 2, box - 4, box - 4, 3); ctx.fill();
        ctx.fillStyle = '#ff3b00';
        ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();
    } else if (stage === 4) {
        ctx.fillStyle = '#ff6b9d';
        ctx.fillRect(x + 8, y + 4, 4, 14);
        ctx.beginPath(); ctx.arc(cx - 4, cy, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 4, cy - 2, 3, 0, Math.PI * 2); ctx.fill();
    } else if (stage === 5) {
        ctx.fillStyle = '#bf5af2';
        ctx.beginPath();
        ctx.moveTo(cx, y + 1);
        ctx.lineTo(x + box - 2, cy + 4);
        ctx.lineTo(cx, y + box - 1);
        ctx.lineTo(x + 2, cy + 4);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(cx, y + 3);
        ctx.lineTo(cx + 4, cy);
        ctx.lineTo(cx, cy - 1);
        ctx.closePath(); ctx.fill();
    }
}

function drawSnakeHead(x, y, dir) {
    const cx = x + box / 2;
    const cy = y + box / 2;
    ctx.fillStyle = '#00ff88';
    ctx.beginPath(); ctx.roundRect(x + 1, y + 1, box - 2, box - 2, 5); ctx.fill();
    let eye1, eye2;
    if (dir === 'RIGHT' || dir === null) {
        eye1 = { x: cx + 4, y: cy - 4 };
        eye2 = { x: cx + 4, y: cy + 4 };
    } else if (dir === 'LEFT') {
        eye1 = { x: cx - 4, y: cy - 4 };
        eye2 = { x: cx - 4, y: cy + 4 };
    } else if (dir === 'UP') {
        eye1 = { x: cx - 4, y: cy - 4 };
        eye2 = { x: cx + 4, y: cy - 4 };
    } else {
        eye1 = { x: cx - 4, y: cy + 4 };
        eye2 = { x: cx + 4, y: cy + 4 };
    }
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.arc(eye1.x, eye1.y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eye2.x, eye2.y, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(eye1.x, eye1.y, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(eye2.x, eye2.y, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#ff4757';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (dir === 'RIGHT' || dir === null) {
        ctx.moveTo(x + box, cy); ctx.lineTo(x + box + 5, cy);
        ctx.moveTo(x + box + 5, cy); ctx.lineTo(x + box + 8, cy - 3);
        ctx.moveTo(x + box + 5, cy); ctx.lineTo(x + box + 8, cy + 3);
    } else if (dir === 'LEFT') {
        ctx.moveTo(x, cy); ctx.lineTo(x - 5, cy);
        ctx.moveTo(x - 5, cy); ctx.lineTo(x - 8, cy - 3);
        ctx.moveTo(x - 5, cy); ctx.lineTo(x - 8, cy + 3);
    } else if (dir === 'UP') {
        ctx.moveTo(cx, y); ctx.lineTo(cx, y - 5);
        ctx.moveTo(cx, y - 5); ctx.lineTo(cx - 3, y - 8);
        ctx.moveTo(cx, y - 5); ctx.lineTo(cx + 3, y - 8);
    } else {
        ctx.moveTo(cx, y + box); ctx.lineTo(cx, y + box + 5);
        ctx.moveTo(cx, y + box + 5); ctx.lineTo(cx - 3, y + box + 8);
        ctx.moveTo(cx, y + box + 5); ctx.lineTo(cx + 3, y + box + 8);
    }
    ctx.stroke();
}

function drawSnakeBody(x, y) {
    ctx.fillStyle = '#00cc66';
    ctx.beginPath(); ctx.roundRect(x + 2, y + 2, box - 4, box - 4, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.roundRect(x + 4, y + 4, box - 10, box - 10, 3); ctx.fill();
}

function drawSnakeTail(x, y, prevX, prevY) {
    const cx = x + box / 2;
    const cy = y + box / 2;
    ctx.fillStyle = '#00aa55';
    ctx.beginPath();
    if      (prevX > x) ctx.ellipse(cx - 2, cy, box/2 - 4, box/2 - 5, 0, 0, Math.PI * 2);
    else if (prevX < x) ctx.ellipse(cx + 2, cy, box/2 - 4, box/2 - 5, 0, 0, Math.PI * 2);
    else if (prevY > y) ctx.ellipse(cx, cy - 2, box/2 - 5, box/2 - 4, 0, 0, Math.PI * 2);
    else                ctx.ellipse(cx, cy + 2, box/2 - 5, box/2 - 4, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawProgressBar() {
    const barW = canvasSize - 40;
    const barH = 6;
    const barX = 20;
    const barY = 8;
    const progress = Math.min((score / SCORE_TO_ADVANCE) * barW, barW);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 3); ctx.fill();
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, '#00ff88');
    grad.addColorStop(1, '#00ccff');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(barX, barY, progress, barH, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Stage ${stage}/${MAX_STAGE}`, canvasSize - 5, 22);
    ctx.textAlign = 'left';
}

function drawOverlay(title, titleColor, lines) {
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = titleColor;
    ctx.font = 'bold 34px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvasSize / 2, canvasSize / 2 - 50);
    lines.forEach((line, i) => {
        ctx.fillStyle = line.color || '#ffffff';
        ctx.font = line.font || '17px Arial';
        ctx.fillText(line.text, canvasSize / 2, canvasSize / 2 - 10 + i * 35);
    });
    ctx.textAlign = 'left';
}

// ─── Main Draw ────────────────────────────────────────────

function draw() {
    ctx.fillStyle = stageConfig[stage].color;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < canvasSize; i += box)
        for (let j = 0; j < canvasSize; j += box)
            ctx.fillRect(i + 9, j + 9, 2, 2);
    obstacles.forEach(o => drawObstacle(o.x, o.y));
    drawApple(food.x, food.y);
    snake.forEach((seg, idx) => {
        if (idx === 0) {
            drawSnakeHead(seg.x, seg.y, direction);
        } else if (idx === snake.length - 1 && snake.length > 1) {
            drawSnakeTail(seg.x, seg.y, snake[idx - 1].x, snake[idx - 1].y);
        } else {
            drawSnakeBody(seg.x, seg.y);
        }
    });
    drawProgressBar();
}

// ─── Game Logic ───────────────────────────────────────────

function update() {
    if (!direction || gameOver || stageClear) return;
    const head = { x: snake[0].x, y: snake[0].y };
    if (direction === 'UP')    head.y -= box;
    if (direction === 'DOWN')  head.y += box;
    if (direction === 'LEFT')  head.x -= box;
    if (direction === 'RIGHT') head.x += box;
    if (head.x < 0 || head.x >= canvasSize || head.y < 0 || head.y >= canvasSize) { endGame(); return; }
    if (snake.some(s => s.x === head.x && s.y === head.y))  { endGame(); return; }
    if (obstacles.some(o => o.x === head.x && o.y === head.y)) { endGame(); return; }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += POINTS_PER_APPLE;
        scoreEl.textContent = totalScore + score;
        if (score >= SCORE_TO_ADVANCE) { advanceStage(); return; }
        spawnFood();
    } else {
        snake.pop();
    }
    draw();
}

function endGame() {
    clearInterval(gameLoop);
    gameLoop = null;
    gameStarted = false;
    gameOver = true;
    totalScore += score;
    if (totalScore > (highScore || 0)) {
        highScore = totalScore;
        highScoreEl.textContent = highScore;
    }
    scoreEl.textContent = totalScore;
    let flashes = 0;
    const flash = setInterval(() => {
        flashes++;
        ctx.fillStyle = `rgba(255,0,0,${flashes % 2 === 0 ? 0.15 : 0.35})`;
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        if (flashes >= 5) {
            clearInterval(flash);
            draw();
            drawOverlay('GAME OVER', '#ff4757', [
                { text: `Stage: ${stage}` },
                { text: `Score: ${totalScore} pts`, color: '#ffd700' },
                { text: 'Press any arrow key to restart', color: '#00ff88', font: '14px Arial' },
            ]);
            messageEl.innerHTML = `💀 Game Over! Stage ${stage} — ${totalScore} pts`;
        }
    }, 150);
}

function advanceStage() {
    clearInterval(gameLoop);
    gameLoop = null;
    gameStarted = false;
    totalScore += score;
    scoreEl.textContent = totalScore;

    if (stage >= MAX_STAGE) {
        if (totalScore > (highScore || 0)) {
            highScore = totalScore;
            highScoreEl.textContent = highScore;
        }
        draw();
        drawOverlay('🏆 YOU WIN!', '#ffd700', [
            { text: `Total Score: ${totalScore} / 500`, color: '#ffd700' },
            { text: 'You conquered all 5 stages!', color: '#ffffff' },
            { text: 'Press any arrow key to play again', color: '#00ff88', font: '14px Arial' },
        ]);
        messageEl.innerHTML = `🏆 YOU WIN! Total: ${totalScore}/500 pts`;
        gameOver = true;
        return;
    }

    stage++;
    stageClear = true;
    draw();
    drawOverlay(`✅ Stage ${stage - 1} Clear!`, '#00ff88', [
        { text: `Total Score: ${totalScore}`, color: '#ffd700' },
        { text: `Next: ${stageConfig[stage].label}`, color: '#00ccff' },
        { text: 'Press any arrow key to continue', color: '#ffffff', font: '14px Arial' },
    ]);
    messageEl.innerHTML = `✅ Stage ${stage - 1} Complete! → ${stageConfig[stage].label}`;
}

// ─── Controls ─────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
    if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;

    if (gameOver) {
        gameOver = false;
        init(false);
        return;
    }

    if (stageClear) {
        stageClear = false;
        snake = [
            { x: 10 * box, y: 10 * box },
            { x: 9  * box, y: 10 * box },
            { x: 8  * box, y: 10 * box }
        ];
        direction = null;
        score = 0;
        gameStarted = false;
        generateObstacles();
        spawnFood();
        draw();
        updateStageDisplay();
        return;
    }

    if (e.key === 'ArrowUp'    && direction !== 'DOWN')  direction = 'UP';
    if (e.key === 'ArrowDown'  && direction !== 'UP')    direction = 'DOWN';
    if (e.key === 'ArrowLeft'  && direction !== 'RIGHT') direction = 'LEFT';
    if (e.key === 'ArrowRight' && direction !== 'LEFT')  direction = 'RIGHT';

    if (!gameStarted) {
        gameStarted = true;
        messageEl.textContent = 'Use arrow keys to control the snake';
        clearInterval(gameLoop);
        gameLoop = setInterval(update, stageConfig[stage].speed);
    }
});

// ─── Start ────────────────────────────────────────────────

init();

