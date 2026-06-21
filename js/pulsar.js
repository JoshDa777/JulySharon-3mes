import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.179/build/three.module.js';

export function createPulsar(){

    const group = new THREE.Group();

    const starGeometry =
        new THREE.SphereGeometry(4,64,64);

    const starMaterial =
        new THREE.MeshStandardMaterial({

            color:0xffffff,

            emissive:0xaaddff,

            emissiveIntensity:8
        });

    const star =
        new THREE.Mesh(
            starGeometry,
            starMaterial
        );

    group.add(star);

    const jetGeometry =
        new THREE.CylinderGeometry(
            0.3,
            1.5,
            80,
            32
        );

    const jetMaterial =
        new THREE.MeshBasicMaterial({
            color:0x88ccff,
            transparent:true,
            opacity:0.8
        });

    const jetTop =
        new THREE.Mesh(
            jetGeometry,
            jetMaterial
        );

    jetTop.position.y = 40;

    const jetBottom =
        new THREE.Mesh(
            jetGeometry,
            jetMaterial
        );

    jetBottom.position.y = -40;

    group.add(jetTop);
    group.add(jetBottom);

    const ringGeometry =
        new THREE.TorusGeometry(
            7,
            0.3,
            16,
            100
        );

    const ringMaterial =
        new THREE.MeshBasicMaterial({
            color:0x66bbff
        });

    const ring =
        new THREE.Mesh(
            ringGeometry,
            ringMaterial
        );

    ring.rotation.x =
        Math.PI / 2;

    group.add(ring);

    return group;
}
