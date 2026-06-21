import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js';

import { createShip } from './ship.js';
import { createPulsar } from './pulsar.js';
import { createStars } from './stars.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    5000
);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(
    renderer.domElement
);

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        1
    )
);

const stars = createStars();
scene.add(stars);

const ship = createShip();
scene.add(ship);

const pulsar = createPulsar();

pulsar.position.set(
    0,
    0,
    -50
);

scene.add(pulsar);

const light = new THREE.PointLight(
    0xaaddff,
    100,
    500
);

light.position.copy(
    pulsar.position
);

scene.add(light);

camera.position.set(
    0,
    3,
    12
);

const keys = {};

window.addEventListener("keydown", e => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
    keys[e.key.toLowerCase()] = false;
});

let speed = 0;

function animate() {

    requestAnimationFrame(animate);

    if (keys["w"]) speed += 0.005;
    if (keys["s"]) speed -= 0.005;

    speed *= 0.99;

    if (keys["a"]) ship.rotation.y += 0.03;
    if (keys["d"]) ship.rotation.y -= 0.03;

    const direction =
        new THREE.Vector3(0, 0, -1);

    direction.applyQuaternion(
        ship.quaternion
    );

    ship.position.add(
        direction.multiplyScalar(speed)
    );

    camera.position.copy(ship.position);

    camera.position.add(
        new THREE.Vector3(
            0,
            3,
            12
        )
    );

    camera.lookAt(ship.position);

    pulsar.rotation.y += 0.05;

    renderer.render(
        scene,
        camera
    );
}

animate();
