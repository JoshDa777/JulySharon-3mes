import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js';

export function createStars(){

    const geometry = new THREE.BufferGeometry();

    const vertices = [];

    for(let i = 0; i < 5000; i++){

        vertices.push(
            (Math.random()-0.5)*2000,
            (Math.random()-0.5)*2000,
            (Math.random()-0.5)*2000
        );
    }

    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices,3)
    );

    const material = new THREE.PointsMaterial({
        color:0xffffff,
        size:1
    });

    return new THREE.Points(
        geometry,
        material
    );
}
