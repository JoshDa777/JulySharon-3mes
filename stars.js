import * as THREE from 'three';

export function createStarField() {
  const count = 6000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const radius = 100 + Math.random() * 900;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    const brightness = 0.6 + Math.random() * 0.4;
    const tint = Math.random();
    if (tint < 0.1) {
      // Blue-ish
      colors[i * 3] = 0.6 * brightness;
      colors[i * 3 + 1] = 0.7 * brightness;
      colors[i * 3 + 2] = 1.0 * brightness;
    } else if (tint < 0.2) {
      // Red-ish
      colors[i * 3] = 1.0 * brightness;
      colors[i * 3 + 1] = 0.6 * brightness;
      colors[i * 3 + 2] = 0.5 * brightness;
    } else {
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness;
    }

    sizes[i] = 0.5 + Math.random() * 1.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 1.5,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const stars = new THREE.Points(geometry, material);
  return stars;
}