import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js';

export function createStars() {

    const geometry = new THREE.BufferGeometry();

    const vertices = [];

    for (let i = 0; i < 10000; i++) {

        vertices.push(
            (Math.random() - 0.5) * 4000,
            (Math.random() - 0.5) * 4000,
            (Math.random() - 0.5) * 4000
        );
    }

    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3)
    );

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 3
    });

    return new THREE.Points(
        geometry,
        material
    );
}
