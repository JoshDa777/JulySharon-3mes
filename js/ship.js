import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js';

export function createShip() {

    const geometry = new THREE.ConeGeometry(
        0.5,
        1.5,
        3
    );

    const material = new THREE.MeshStandardMaterial({
        color: 0x66aaff,
        emissive: 0x2255ff,
        emissiveIntensity: 2
    });

    const ship = new THREE.Mesh(
        geometry,
        material
    );

    ship.rotation.z = Math.PI / 2;

    return ship;
}
