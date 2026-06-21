import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js';

import { createShip } from './ship.js';
import { createPulsar } from './pulsar.js';
import { createStars } from './stars.js';

const scene =
    new THREE.Scene();

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        5000
    );

const renderer =
    new THREE.WebGLRenderer({
        antialias:true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(
    renderer.domElement
);

const ambient =
    new THREE.AmbientLight(
        0xffffff,
        0.5
    );

scene.add(ambient);

const pointLight =
    new THREE.PointLight(
        0xaaddff,
        30,
        500
    );

scene.add(pointLight);

const stars =
    createStars();

scene.add(stars);

const ship =
    createShip();

ship.position.set(
    0,
    0,
    0
);

scene.add(ship);

const pulsar =
    createPulsar();

pulsar.position.set(
    0,
    0,
    -300
);

scene.add(pulsar);

pointLight.position.copy(
    pulsar.position
);

camera.position.set(
    0,
    3,
    8
);

const keys = {};

window.addEventListener(
    "keydown",
    e => keys[e.key.toLowerCase()] = true
);

window.addEventListener(
    "keyup",
    e => keys[e.key.toLowerCase()] = false
);

let speed = 0;

function animate(){

    requestAnimationFrame(
        animate
    );

    if(keys["w"]){

        speed += 0.002;
    }

    if(keys["s"]){

        speed -= 0.002;
    }

    speed *= 0.99;

    if(keys["a"]){

        ship.rotation.y += 0.03;
    }

    if(keys["d"]){

        ship.rotation.y -= 0.03;
    }

    const forward =
        new THREE.Vector3(
            0,
            0,
            -1
        );

    forward.applyQuaternion(
        ship.quaternion
    );

    ship.position.add(
        forward.multiplyScalar(
            speed
        )
    );

    const cameraOffset =
        new THREE.Vector3(
            0,
            3,
            8
        );

    cameraOffset.applyQuaternion(
        ship.quaternion
    );

    camera.position.copy(
        ship.position
    ).add(
        cameraOffset
    );

    camera.lookAt(
        ship.position
    );

    pulsar.rotation.y += 0.2;
    pulsar.rotation.z += 0.05;

    const distance =
        ship.position.distanceTo(
            pulsar.position
        );

    if(distance < 12){

        document.getElementById(
            "ui"
        ).innerText =
        "Entrando al púlsar...";
    }

    renderer.render(
        scene,
        camera
    );
}

animate();

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);
