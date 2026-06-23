import * as THREE from 'three';

export function createPulsar() {
  const group = new THREE.Group();

  // Axial tilt (magnetic axis offset from rotation axis, like real pulsars)
  const axialTilt = 0.6;
  group.rotation.x = axialTilt;

  // ========== Core ==========
  const coreGeo = new THREE.SphereGeometry(5, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x44aaff });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // Inner glow
  const glowInnerGeo = new THREE.SphereGeometry(6.8, 32, 32);
  const glowInnerMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff, transparent: true, opacity: 0.5,
  });
  const glowInner = new THREE.Mesh(glowInnerGeo, glowInnerMat);
  group.add(glowInner);

  // Outer glow
  const glowOuterGeo = new THREE.SphereGeometry(10, 32, 32);
  const glowOuterMat = new THREE.MeshBasicMaterial({
    color: 0x0044aa, transparent: true, opacity: 0.1,
  });
  const glowOuter = new THREE.Mesh(glowOuterGeo, glowOuterMat);
  group.add(glowOuter);

  // ========== Relativistic Jets with wobble (precession) ==========
  const jetLength = 80;
  const jetRadius = 1.5;

  // We create jet groups so we can tilt/wobble them independently
  const topJetGroup = new THREE.Group();
  topJetGroup.position.y = 2;
  group.add(topJetGroup);

  const bottomJetGroup = new THREE.Group();
  bottomJetGroup.position.y = -2;
  group.add(bottomJetGroup);

  // Top jet cone
  const topJetGeo = new THREE.CylinderGeometry(0.05, jetRadius, jetLength, 16, 1, true);
  const topJetMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff, transparent: true, opacity: 0.6, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const topJet = new THREE.Mesh(topJetGeo, topJetMat);
  topJet.position.y = jetLength / 2;
  topJetGroup.add(topJet);

  // Bottom jet cone
  const bottomJetGeo = new THREE.CylinderGeometry(0.05, jetRadius, jetLength, 16, 1, true);
  const bottomJetMat = new THREE.MeshBasicMaterial({
    color: 0x88ccff, transparent: true, opacity: 0.6, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const bottomJet = new THREE.Mesh(bottomJetGeo, bottomJetMat);
  bottomJet.position.y = -jetLength / 2;
  bottomJetGroup.add(bottomJet);

  // Jet inner white cores
  const topCoreGeo = new THREE.CylinderGeometry(0.02, 0.6, jetLength * 0.6, 12, 1, true);
  const topCoreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const topCore = new THREE.Mesh(topCoreGeo, topCoreMat);
  topCore.position.y = jetLength * 0.3;
  topJetGroup.add(topCore);

  const bottomCoreGeo = new THREE.CylinderGeometry(0.02, 0.6, jetLength * 0.6, 12, 1, true);
  const bottomCoreMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, transparent: true, opacity: 0.9, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const bottomCore = new THREE.Mesh(bottomCoreGeo, bottomCoreMat);
  bottomCore.position.y = -jetLength * 0.3;
  bottomJetGroup.add(bottomCore);

  // ========== Jet Particles (dense stream) ==========
  const jetParticleCount = 1200;
  const jetPositions = new Float32Array(jetParticleCount * 3);
  const jetColors = new Float32Array(jetParticleCount * 3);
  const jetSizes = new Float32Array(jetParticleCount);
  const jetVelocities = [];

  for (let i = 0; i < jetParticleCount; i++) {
    const side = i < jetParticleCount / 2 ? 1 : -1;
    const t = Math.random();
    const radius = 0.05 + t * jetRadius * 0.7;
    const angle = Math.random() * Math.PI * 2;
    const yPos = side * (t * jetLength);

    jetPositions[i * 3] = radius * Math.cos(angle);
    jetPositions[i * 3 + 1] = yPos;
    jetPositions[i * 3 + 2] = radius * Math.sin(angle);

    const bright = 0.6 + Math.random() * 0.4;
    const colorChoice = Math.random();
    if (colorChoice < 0.3) {
      // White-blue
      jetColors[i * 3] = 0.8 * bright;
      jetColors[i * 3 + 1] = 0.9 * bright;
      jetColors[i * 3 + 2] = 1.0 * bright;
    } else if (colorChoice < 0.6) {
      // Cyan
      jetColors[i * 3] = 0.3 * bright;
      jetColors[i * 3 + 1] = 0.8 * bright;
      jetColors[i * 3 + 2] = 1.0 * bright;
    } else {
      // Blue
      jetColors[i * 3] = 0.2 * bright;
      jetColors[i * 3 + 1] = 0.4 * bright;
      jetColors[i * 3 + 2] = 1.0 * bright;
    }

    jetSizes[i] = 0.2 + Math.random() * 0.6;

    jetVelocities.push({
      speed: 0.3 + Math.random() * 1.0,
      angle: angle,
      radius: radius,
      side: side,
      t: t,
      twinkle: Math.random() * Math.PI * 2,
    });
  }

  const jetParticleGeo = new THREE.BufferGeometry();
  jetParticleGeo.setAttribute('position', new THREE.BufferAttribute(jetPositions, 3));
  jetParticleGeo.setAttribute('color', new THREE.BufferAttribute(jetColors, 3));
  jetParticleGeo.setAttribute('size', new THREE.BufferAttribute(jetSizes, 1));

  const jetParticleMat = new THREE.PointsMaterial({
    size: 0.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const jetParticles = new THREE.Points(jetParticleGeo, jetParticleMat);
  group.add(jetParticles);

  // ========== Halo rings ==========
  const haloGeo = new THREE.RingGeometry(6, 18, 64);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x4488ff, transparent: true, opacity: 0.3, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = Math.PI / 2;
  group.add(halo);

  const haloOuterGeo = new THREE.RingGeometry(14, 28, 64);
  const haloOuterMat = new THREE.MeshBasicMaterial({
    color: 0x2266cc, transparent: true, opacity: 0.1, side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const haloOuter = new THREE.Mesh(haloOuterGeo, haloOuterMat);
  haloOuter.rotation.x = Math.PI / 2;
  group.add(haloOuter);

  // ========== Light beams (ray-traced light cone simulation) ==========
  // Create cone-shaped light beams extending from the poles
  const beamGroup = new THREE.Group();
  group.add(beamGroup);

  const beamCount = 2; // One per pole
  const beamCones = [];

  for (let b = 0; b < beamCount; b++) {
    const beamDir = b === 0 ? 1 : -1;

    // Outer cone - wide light cone
    const outerConeGeo = new THREE.ConeGeometry(25, 70, 48, 1, true);
    const outerConeMat = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const outerCone = new THREE.Mesh(outerConeGeo, outerConeMat);
    outerCone.position.y = beamDir * 35;
    outerCone.rotation.x = b === 0 ? 0 : Math.PI;
    beamGroup.add(outerCone);

    // Mid cone
    const midConeGeo = new THREE.ConeGeometry(15, 80, 48, 1, true);
    const midConeMat = new THREE.MeshBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const midCone = new THREE.Mesh(midConeGeo, midConeMat);
    midCone.position.y = beamDir * 40;
    midCone.rotation.x = b === 0 ? 0 : Math.PI;
    beamGroup.add(midCone);

    // Inner collimated beam (tight cone)
    const innerConeGeo = new THREE.ConeGeometry(6, 90, 32, 1, true);
    const innerConeMat = new THREE.MeshBasicMaterial({
      color: 0xaaddff,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerCone = new THREE.Mesh(innerConeGeo, innerConeMat);
    innerCone.position.y = beamDir * 45;
    innerCone.rotation.x = b === 0 ? 0 : Math.PI;
    beamGroup.add(innerCone);

    beamCones.push({ outerCone, midCone, innerCone, outerConeMat, midConeMat, innerConeMat });
  }

  // ========== Radial light rays (god rays from core) ==========
  const rayCount = 200;
  const rayPositions = new Float32Array(rayCount * 6); // 2 vertices per ray (start + end)
  const rayIndices = [];

  for (let i = 0; i < rayCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const startR = 5 + Math.random() * 2;
    const endR = 8 + Math.random() * 30;

    // Start point (near core surface)
    rayPositions[i * 6] = startR * Math.sin(phi) * Math.cos(theta);
    rayPositions[i * 6 + 1] = startR * Math.sin(phi) * Math.sin(theta);
    rayPositions[i * 6 + 2] = startR * Math.cos(phi);

    // End point (extending outward)
    rayPositions[i * 6 + 3] = endR * Math.sin(phi) * Math.cos(theta);
    rayPositions[i * 6 + 4] = endR * Math.sin(phi) * Math.sin(theta);
    rayPositions[i * 6 + 5] = endR * Math.cos(phi);

    rayIndices.push(i * 2, i * 2 + 1);
  }

  const rayGeo = new THREE.BufferGeometry();
  rayGeo.setAttribute('position', new THREE.BufferAttribute(rayPositions, 3));
  rayGeo.setIndex(rayIndices);

  const rayMat = new THREE.LineBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
  });
  const rays = new THREE.LineSegments(rayGeo, rayMat);
  group.add(rays);

  // ========== Spark particles ==========
  const sparkCount = 150;
  const sparkPos = new Float32Array(sparkCount * 3);
  const sparkColors = new Float32Array(sparkCount * 3);
  const sparkSizes = new Float32Array(sparkCount);
  const sparkData = [];

  for (let i = 0; i < sparkCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 4 + Math.random() * 10;

    sparkPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    sparkPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    sparkPos[i * 3 + 2] = r * Math.cos(phi);

    sparkColors[i * 3] = 1.0;
    sparkColors[i * 3 + 1] = 0.8;
    sparkColors[i * 3 + 2] = 0.6;

    sparkSizes[i] = 0.1 + Math.random() * 0.4;

    sparkData.push({
      theta, phi, r,
      speed: 0.2 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
    });
  }

  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));
  sparkGeo.setAttribute('size', new THREE.BufferAttribute(sparkSizes, 1));

  const sparkMat = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  group.add(sparks);

  // ========== Magnetic field lines (dipolar) ==========
  const fieldLineCount = 32;
  const fieldVertices = [];
  const fieldIndices = [];

  for (let i = 0; i < fieldLineCount; i++) {
    const theta = (i / fieldLineCount) * Math.PI * 2;
    const pts = [];
    for (let t = -1; t <= 1; t += 0.03) {
      const r = 5 + Math.abs(t) * 20;
      const x = r * Math.cos(theta + t * 0.4);
      const z = r * Math.sin(theta + t * 0.4);
      const y = t * 25;
      pts.push(new THREE.Vector3(x, y, z));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const curvePts = curve.getPoints(25);
    const baseIdx = fieldVertices.length / 3;
    for (const p of curvePts) {
      fieldVertices.push(p.x, p.y, p.z);
    }
    for (let j = 0; j < curvePts.length - 1; j++) {
      fieldIndices.push(baseIdx + j, baseIdx + j + 1);
    }
  }

  const fieldPosArray = new Float32Array(fieldVertices);
  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute('position', new THREE.BufferAttribute(fieldPosArray, 3));
  fieldGeo.setIndex(fieldIndices);

  const fieldMat = new THREE.LineBasicMaterial({
    color: 0x2255aa,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
  });
  const fieldLines = new THREE.LineSegments(fieldGeo, fieldMat);
  group.add(fieldLines);

  // ========== Lights ==========
  // Main pulsar light (blue-white)
  const mainLight = new THREE.PointLight(0x4488ff, 5, 200);
  mainLight.position.set(0, 0, 0);
  group.add(mainLight);

  // Secondary colored lights for ambiance
  const redLight = new THREE.PointLight(0xff4488, 0.5, 60);
  redLight.position.set(8, 0, 8);
  group.add(redLight);

  const blueLight = new THREE.PointLight(0x4444ff, 0.5, 60);
  blueLight.position.set(-8, 0, -8);
  group.add(blueLight);

  // Flash light (bright white during peaks)
  const flashLight = new THREE.PointLight(0xffffff, 0, 100);
  flashLight.position.set(0, 0, 0);
  group.add(flashLight);

  // Store references
  group.userData.core = core;
  group.userData.coreMat = coreMat;
  group.userData.glowInner = glowInner;
  group.userData.glowInnerMat = glowInnerMat;
  group.userData.glowOuter = glowOuter;
  group.userData.glowOuterMat = glowOuterMat;
  group.userData.halo = halo;
  group.userData.haloMat = haloMat;
  group.userData.haloOuter = haloOuter;

  group.userData.topJetGroup = topJetGroup;
  group.userData.bottomJetGroup = bottomJetGroup;
  group.userData.topJet = topJet;
  group.userData.bottomJet = bottomJet;
  group.userData.topJetMat = topJetMat;
  group.userData.bottomJetMat = bottomJetMat;
  group.userData.topCore = topCore;
  group.userData.bottomCore = bottomCore;
  group.userData.topCoreMat = topCoreMat;
  group.userData.bottomCoreMat = bottomCoreMat;

  group.userData.jetParticles = jetParticles;
  group.userData.jetParticleGeo = jetParticleGeo;
  group.userData.jetVelocities = jetVelocities;

  group.userData.beamCones = beamCones;
  group.userData.beamGroup = beamGroup;

  group.userData.rays = rays;
  group.userData.rayMat = rayMat;

  group.userData.sparks = sparks;
  group.userData.sparkGeo = sparkGeo;
  group.userData.sparkData = sparkData;

  group.userData.fieldLines = fieldLines;

  group.userData.mainLight = mainLight;
  group.userData.redLight = redLight;
  group.userData.blueLight = blueLight;
  group.userData.flashLight = flashLight;

  return group;
}

export function updatePulsar(pulsar, time) {
  // ========== EXTREME Spin on axis ==========
  for (let i = 0; i < pulsar.children.length; i++) {
    const child = pulsar.children[i];
    if (child.isLight || child === pulsar.userData.topJetGroup || child === pulsar.userData.bottomJetGroup) {
      continue;
    }
    child.rotation.y += 0.25; // 10x faster spin
    child.rotation.x += 0.05; // extra wobble axis
  }

  // ========== Jet wobble (precession) - faster ==========
  const wobbleAngle = Math.sin(time * 3.0) * 0.25; // faster and more amplitude
  const wobbleAngle2 = Math.cos(time * 3.0) * 0.2;
  const topJetGroup = pulsar.userData.topJetGroup;
  const bottomJetGroup = pulsar.userData.bottomJetGroup;
  if (topJetGroup) {
    topJetGroup.rotation.x = wobbleAngle;
    topJetGroup.rotation.z = wobbleAngle2;
  }
  if (bottomJetGroup) {
    bottomJetGroup.rotation.x = wobbleAngle;
    bottomJetGroup.rotation.z = wobbleAngle2;
  }

  // ========== Core flash (pulsar beat) - EXTREME frequency ==========
  const beatFreq = 30.0; // 30 Hz - extremely fast pulsar
  const beatPhase = (time * beatFreq) % 1;
  let flashIntensity;
  if (beatPhase < 0.12) {
    flashIntensity = Math.sin((beatPhase / 0.12) * Math.PI);
  } else {
    flashIntensity = 0.2 + Math.pow(1 - (beatPhase - 0.12) / 0.88, 2) * 0.3;
  }

  const core = pulsar.userData.core;
  const coreMat = pulsar.userData.coreMat;
  if (core && coreMat) {
    const flashScale = 0.7 + flashIntensity * 0.8;
    core.scale.set(flashScale, flashScale, flashScale);

    if (flashIntensity > 0.75) {
      coreMat.color.setHex(0xffffff);
    } else {
      const hue = 0.56 + Math.sin(time * 0.2) * 0.06;
      coreMat.color.setHSL(hue, 1, 0.3 + flashIntensity * 0.5);
    }
  }

  // ========== Glow ==========
  const glowInner = pulsar.userData.glowInner;
  const glowInnerMat = pulsar.userData.glowInnerMat;
  if (glowInner && glowInnerMat) {
    glowInnerMat.opacity = 0.15 + flashIntensity * 0.65;
    const gs = 0.6 + flashIntensity * 0.7;
    glowInner.scale.set(gs, gs, gs);
  }

  const glowOuter = pulsar.userData.glowOuter;
  if (glowOuter) {
    glowOuter.material.opacity = 0.04 + flashIntensity * 0.16;
    const gs = 0.8 + flashIntensity * 0.4;
    glowOuter.scale.set(gs, gs, gs);
  }

  // ========== Halo ==========
  const halo = pulsar.userData.halo;
  if (halo) {
    halo.rotation.z += 0.25; // 10x faster
    halo.rotation.x += 0.05;
    halo.material.opacity = 0.08 + flashIntensity * 0.35;
    const hs = 0.7 + flashIntensity * 0.5;
    halo.scale.set(hs, hs, hs);
  }
  const haloOuter = pulsar.userData.haloOuter;
  if (haloOuter) {
    haloOuter.rotation.z -= 0.2; // 10x faster
    haloOuter.rotation.x -= 0.03;
  }

  // ========== Jet shimmer ==========
  const jp = 0.2 + flashIntensity * 0.7;
  if (pulsar.userData.topJet) pulsar.userData.topJet.material.opacity = jp;
  if (pulsar.userData.bottomJet) pulsar.userData.bottomJet.material.opacity = jp;
  const cp = 0.2 + flashIntensity * 0.8;
  if (pulsar.userData.topCore) pulsar.userData.topCore.material.opacity = cp;
  if (pulsar.userData.bottomCore) pulsar.userData.bottomCore.material.opacity = cp;

  // ========== Jet particles (dense flowing stream) ==========
  const jetParticles = pulsar.userData.jetParticles;
  const jetGeo = pulsar.userData.jetParticleGeo;
  const jetVel = pulsar.userData.jetVelocities;

  if (jetParticles && jetGeo && jetVel) {
    const positions = jetGeo.attributes.position.array;
    const sizes = jetGeo.attributes.size.array;
    const count = jetVel.length;

    for (let i = 0; i < count; i++) {
      const v = jetVel[i];
      v.t += 0.012 * v.speed;
      if (v.t > 1) v.t = 0;

      const yPos = v.side * (v.t * 80);
      const spreadAngle = v.angle + time * 0.5 + v.t * 0.3;
      const r = v.radius * (0.3 + v.t * 0.7);

      positions[i * 3] = r * Math.cos(spreadAngle);
      positions[i * 3 + 1] = yPos;
      positions[i * 3 + 2] = r * Math.sin(spreadAngle);

      // Twinkle
      sizes[i] = (0.2 + flashIntensity * 0.4) * (0.5 + Math.sin(v.twinkle + time * 3) * 0.3);
    }

    jetGeo.attributes.position.needsUpdate = true;
    jetGeo.attributes.size.needsUpdate = true;
    jetParticles.material.opacity = 0.2 + flashIntensity * 0.8;
    jetParticles.material.size = 0.5 + flashIntensity * 0.8;
  }

  // ========== Light beam cones (pulse with flash) ==========
  const beamCones = pulsar.userData.beamCones;
  if (beamCones) {
    for (const bc of beamCones) {
      bc.outerConeMat.opacity = 0.02 + flashIntensity * 0.06;
      bc.midConeMat.opacity = 0.03 + flashIntensity * 0.08;
      bc.innerConeMat.opacity = 0.04 + flashIntensity * 0.12;

      // Cones rotate - fast
      bc.outerCone.rotation.z += 0.1;
      bc.outerCone.rotation.x += 0.03;
      bc.midCone.rotation.z -= 0.08;
      bc.midCone.rotation.x -= 0.02;
      bc.innerCone.rotation.z += 0.05;
      bc.innerCone.rotation.x += 0.01;

      // Scale oscillation
      const beamOsc = 0.9 + Math.sin(time * 2) * 0.1;
      bc.outerCone.scale.set(beamOsc, 1, beamOsc);
      bc.midCone.scale.set(beamOsc * 1.1, 1, beamOsc * 1.1);
    }
  }

  // ========== Radial rays ==========
  const rays = pulsar.userData.rays;
  if (rays) {
    rays.rotation.y += 0.1; // 10x faster
    rays.rotation.x += 0.05;
    rays.material.opacity = 0.04 + flashIntensity * 0.25;
  }

  // ========== Sparks ==========
  const sparks = pulsar.userData.sparks;
  const sparkGeo = pulsar.userData.sparkGeo;
  const sparkData = pulsar.userData.sparkData;
  if (sparks && sparkGeo && sparkData) {
    const pos = sparkGeo.attributes.position.array;
    for (let i = 0; i < sparkData.length; i++) {
      const sd = sparkData[i];
      sd.theta += 0.01 * sd.speed;
      sd.phi += 0.005 * sd.speed;
      sd.r = 4 + Math.sin(time * sd.speed + sd.phase) * 3 + Math.random() * 2;
      pos[i * 3] = sd.r * Math.sin(sd.phi) * Math.cos(sd.theta);
      pos[i * 3 + 1] = sd.r * Math.sin(sd.phi) * Math.sin(sd.theta);
      pos[i * 3 + 2] = sd.r * Math.cos(sd.phi);
    }
    sparkGeo.attributes.position.needsUpdate = true;
    sparks.material.opacity = 0.2 + flashIntensity * 0.6;
  }

  // ========== Field lines ==========
  const fieldLines = pulsar.userData.fieldLines;
  if (fieldLines) {
    fieldLines.rotation.y += 0.06; // 10x faster
    fieldLines.rotation.x += 0.02;
    fieldLines.material.opacity = 0.04 + flashIntensity * 0.12;
  }

  // ========== Light emission ==========
  const mainLight = pulsar.userData.mainLight;
  const flashLight = pulsar.userData.flashLight;
  const redLight = pulsar.userData.redLight;
  const blueLight = pulsar.userData.blueLight;

  if (mainLight) {
    mainLight.intensity = 2 + flashIntensity * 5;
    mainLight.distance = 100 + flashIntensity * 100;
    // Color shifts toward white during flash
    const mix = flashIntensity * 0.6;
    mainLight.color.setHSL(0.58 - mix * 0.08, 1 - mix * 0.5, 0.5 + mix * 0.5);
  }

  if (flashLight) {
    // Sharp flash light that activates during peaks
    if (flashIntensity > 0.7) {
      flashLight.intensity = (flashIntensity - 0.7) * 20;
      flashLight.distance = 50 + flashIntensity * 80;
    } else {
      flashLight.intensity = 0;
    }
  }

  if (redLight) {
    redLight.intensity = 0.2 + flashIntensity * 0.5;
    const angle = time * 0.5;
    redLight.position.x = Math.cos(angle) * 10;
    redLight.position.z = Math.sin(angle) * 10;
  }

  if (blueLight) {
    blueLight.intensity = 0.2 + flashIntensity * 0.5;
    const angle = time * 0.5 + Math.PI;
    blueLight.position.x = Math.cos(angle) * 10;
    blueLight.position.z = Math.sin(angle) * 10;
  }
}