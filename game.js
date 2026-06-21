const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const astronauta = {
    x: 100,
    y: canvas.height / 2,
    size: 20,
    speed: 5
};

const pulsar = {
    x: canvas.width - 200,
    y: canvas.height / 2,
    radius: 90
};

const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key] = false;
});

function estrellas() {
    for(let i=0;i<150;i++){
        ctx.fillStyle = "white";
        ctx.fillRect(
            Math.random()*canvas.width,
            Math.random()*canvas.height,
            2,
            2
        );
    }
}

const starMap = document.createElement("canvas");
starMap.width = canvas.width;
starMap.height = canvas.height;
const starCtx = starMap.getContext("2d");

for(let i=0;i<250;i++){
    starCtx.fillStyle = "white";
    starCtx.fillRect(
        Math.random()*canvas.width,
        Math.random()*canvas.height,
        2,
        2
    );
}

function drawAstronauta(){
    ctx.fillStyle="white";
    ctx.beginPath();
    ctx.arc(
        astronauta.x,
        astronauta.y,
        astronauta.size,
        0,
        Math.PI*2
    );
    ctx.fill();
}

function drawPulsar(){

    const glow = ctx.createRadialGradient(
        pulsar.x,
        pulsar.y,
        20,
        pulsar.x,
        pulsar.y,
        pulsar.radius
    );

    glow.addColorStop(0,"white");
    glow.addColorStop(0.4,"#88ccff");
    glow.addColorStop(1,"rgba(136,204,255,0)");

    ctx.fillStyle = glow;

    ctx.beginPath();
    ctx.arc(
        pulsar.x,
        pulsar.y,
        pulsar.radius,
        0,
        Math.PI*2
    );
    ctx.fill();
}

function update(){

    if(keys["ArrowUp"] || keys["w"])
        astronauta.y -= astronauta.speed;

    if(keys["ArrowDown"] || keys["s"])
        astronauta.y += astronauta.speed;

    if(keys["ArrowLeft"] || keys["a"])
        astronauta.x -= astronauta.speed;

    if(keys["ArrowRight"] || keys["d"])
        astronauta.x += astronauta.speed;

    const dx = astronauta.x - pulsar.x;
    const dy = astronauta.y - pulsar.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if(dist < pulsar.radius){

        document.getElementById("mensaje").innerText =
            "Has entrado al púlsar ✨";

        astronauta.speed = 0;
    }
}

function gameLoop(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.drawImage(starMap,0,0);

    update();
    drawPulsar();
    drawAstronauta();

    requestAnimationFrame(gameLoop);
}

gameLoop();
