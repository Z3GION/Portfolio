/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';

const vertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform vec2 uMouse;
  uniform float uScroll;
  uniform float uScrollIntensity;
  uniform float uIdleIntensity;
  uniform float uInteractionIntensity;

  attribute float aSize;
  attribute vec3 aRandom;

  varying vec3 vColor;
  varying float vOpacity;
  varying float vSpeed;

  //
  // Description : Array and textureless GLSL 2D/3D/4D simplex 
  //               noise functions.
  //      Author : Ian McEwan, Ashima Arts.
  //  Maintainer : ijm
  //     Lastmod : 20110822 (ijm)
  //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
  //               Distributed under the MIT License. See LICENSE file.
  //               https://github.com/ashima/webgl-noise
  //

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vec3 pos = position;

    // Implement scroll-based intensity changes
    // Intensity increases as the user scrolls down (uScroll: 0 to 1)
    // uScrollIntensity provides a direct control over the speed/density effect
    float scrollIntensity = 1.0 + uScrollIntensity * 2.0; 

    // Organic noise-based movement
    float noiseFreq = 0.002;
    float noiseAmp = 60.0 * scrollIntensity;
    float timeSpeed = 0.1 * scrollIntensity;
    
    // Use original position for noise to avoid jitter/feedback loops
    pos.x += snoise(vec3(position.x * noiseFreq, position.y * noiseFreq, uTime * timeSpeed)) * noiseAmp;
    pos.y += snoise(vec3(position.y * noiseFreq, position.z * noiseFreq, uTime * timeSpeed)) * noiseAmp;
    pos.z += snoise(vec3(position.z * noiseFreq, position.x * noiseFreq, uTime * timeSpeed)) * noiseAmp;

    // Idle Swirl
    float swirlSpeed = 0.3;
    float swirlAmp = 40.0;
    pos.x += sin(uTime * swirlSpeed + position.z * 0.002) * swirlAmp * uIdleIntensity;
    pos.y += cos(uTime * swirlSpeed + position.x * 0.002) * swirlAmp * uIdleIntensity;

    // Subtle floating drift (smooth periodic motion)
    pos.x += sin(uTime * 0.15 + aRandom.x * 6.28) * 5.0;
    pos.y += cos(uTime * 0.15 + aRandom.y * 6.28) * 5.0;
    
    // Mouse Interaction
    // Scaling uMouse to match the camera frustum at z=0 (fov 75, dist 600)
    vec2 mouseEffect = uMouse * vec2(460.0, 345.0);
    
    // Dynamic radius: shifts from a standard repulsion area to a larger attraction zone
    float interactionRadius = mix(350.0, 450.0, uInteractionIntensity);
    float dist = distance(pos.xy, mouseEffect);
    
    // Smooth strength based on distance
    float strength = smoothstep(interactionRadius, 0.0, dist);
    
    if(strength > 0.0) {
      // Use uInteractionIntensity to transition from repulsion to focused attraction
      float repulsionMagnitude = 120.0;
      float attractionMagnitude = -220.0;
      float baseForce = mix(repulsionMagnitude, attractionMagnitude, uInteractionIntensity);
      
      // Dynamic falloff adjustments
      // Repulsion: softer cubic curve
      // Attraction: sharper power-based curve for a "vacuum" feel
      float falloffPower = mix(3.0, 7.0, uInteractionIntensity);
      float dynamicStrength = 1.0 - pow(1.0 - strength, falloffPower);
      
      float force = dynamicStrength * baseForce;
      
      // Add a damped spring oscillation that is more pronounced during repulsion
      float springIntensity = mix(4.0, 1.5, uInteractionIntensity);
      float spring = sin(strength * 6.28) * springIntensity * strength; 
      
      // Calculated direction from particle to mouse
      vec3 dir = normalize(pos - vec3(mouseEffect, 0.0));
      
      // Shift particles primarily in XY, with depth (Z) push
      float zPush = mix(0.4, -0.5, uInteractionIntensity);
      pos.xy += dir.xy * (force + spring);
      pos.z += dir.z * force * zPush;

      // Dynamic Swirl/Vortex Effect
      // During attraction, particles rotate slightly around the cursor
      float swirlStrength = uInteractionIntensity * dynamicStrength * 1.5;
      if (swirlStrength > 0.01) {
          float angle = swirlStrength;
          float s = sin(angle);
          float c = cos(angle);
          vec2 relPos = pos.xy - mouseEffect;
          pos.x = mouseEffect.x + relPos.x * c - relPos.y * s;
          pos.y = mouseEffect.y + relPos.x * s + relPos.y * c;
      }
    }

    // Simulated Local Repulsion (Collision Physics)
    // We use a high-frequency noise field to simulate a "pressure field". 
    // Particles sense the gradient of this field and move toward lower pressure,
    // creating a decentralized repulsion effect that prevents visual clustering.
    float collisionScale = 0.05;
    vec3 pressurePos = pos * collisionScale;
    float pressure = snoise(pressurePos + uTime * 0.1);
    
    // Estimate gradient for repulsion direction
    float gEps = 0.01;
    float gradX = snoise(pressurePos + vec3(gEps, 0.0, 0.0) + uTime * 0.1) - pressure;
    float gradY = snoise(pressurePos + vec3(0.0, gEps, 0.0) + uTime * 0.1) - pressure;
    float gradZ = snoise(pressurePos + vec3(0.0, 0.0, gEps) + uTime * 0.1) - pressure;
    
    vec3 repulsionVector = -normalize(vec4(gradX, gradY, gradZ, 0.001).xyz);
    float repulsionFactor = smoothstep(0.2, 0.8, pressure) * 12.0;
    pos += repulsionVector * repulsionFactor;

    // Organic Clustering Behavior
    // We use a lower frequency noise to define "accumulation zones"
    float clusterScale = 0.003; // Large scale clusters
    vec3 clusterPos = pos * clusterScale;
    float clusterNoise = snoise(clusterPos - uTime * 0.02);
    
    // Move towards local density peaks (maxima of noise)
    float cEps = 0.02;
    float cGradX = snoise(clusterPos + vec3(cEps, 0.0, 0.0) - uTime * 0.02) - clusterNoise;
    float cGradY = snoise(clusterPos + vec3(0.0, cEps, 0.0) - uTime * 0.02) - clusterNoise;
    float cGradZ = snoise(clusterPos + vec3(0.0, 0.0, cEps) - uTime * 0.02) - clusterNoise;
    
    vec3 attractionVector = normalize(vec4(cGradX, cGradY, cGradZ, 0.001).xyz);
    // Strength varies slowly over time to allow clusters to form and disperse dynamically
    float aggregationStrength = (sin(uTime * 0.08) * 0.5 + 0.5) * smoothstep(0.1, 0.6, clusterNoise) * scrollIntensity;
    pos += attractionVector * aggregationStrength * 22.0;

    // Calculate speed based on displacement
    vSpeed = distance(pos, position);

    // Scroll Effect - push particles back or forth
    pos.z += uScroll * 100.0 * (aRandom.z - 0.5);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float sizeFactor = 1.0 + uScroll * 0.5; // Scale particles up to 50% larger on scroll
    gl_PointSize = aSize * (uSize / -mvPosition.z) * uPixelRatio * sizeFactor;
    
    // Scale size slightly by speed
    gl_PointSize *= (1.0 + vSpeed * 0.005);
    
    gl_Position = projectionMatrix * mvPosition;

    // Depth-based color and opacity
    float depth = smoothstep(-1000.0, 1000.0, pos.z);
    
    // Subtle and slow color shift over time for an elegant feel
    vec3 color1 = vec3(0.388, 0.4, 0.945); // Indigo
    vec3 color2 = vec3(0.55, 0.1, 0.9);      // Muted Purple
    
    // Slower oscillation, less affected by idle state for consistency
    float colorPulseBase = 0.04;
    float pulseSpeed = colorPulseBase + uIdleIntensity * 0.06;
    float shift = sin(uTime * pulseSpeed) * 0.4 + 0.5; // Oscillate between 0.1 and 0.9
    vec3 baseColor = mix(color1, color2, shift);
    
    // Depth-based color mix with a very subtle secondary time-based variation
    float accentMix = depth * (0.8 + 0.2 * sin(uTime * 0.02));
    vColor = mix(baseColor, vec3(0.4, 0.8, 1.0), accentMix);
    vOpacity = smoothstep(-1000.0, 0.0, mvPosition.z) * 0.6;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  varying float vSpeed;

  uniform float uTime;
  uniform float uColorShiftSpeed;

  void main() {
    float r = distance(gl_PointCoord, vec2(0.5));
    if (r > 0.5) discard;
    
    float speedFactor = smoothstep(10.0, 200.0, vSpeed);
    
    // Dynamic color palette shift
    // uColorShiftSpeed controls how fast we transition between cool and warm signatures
    float paletteFactor = sin(uTime * uColorShiftSpeed) * 0.5 + 0.5;
    
    // Palette 1: Deep Ocean (Blues, Indigos)
    vec3 cool1 = vec3(0.2, 0.4, 1.0);
    vec3 cool2 = vec3(0.4, 0.1, 0.9);
    vec3 cool = mix(cool1, cool2, sin(uTime * 0.2) * 0.5 + 0.5);
    
    // Palette 2: Sunset Embers (Oranges, Pinks, Magentas)
    vec3 warm1 = vec3(1.0, 0.45, 0.15);
    vec3 warm2 = vec3(1.0, 0.1, 0.5);
    vec3 warm = mix(warm1, warm2, cos(uTime * 0.2) * 0.5 + 0.5);
    
    vec3 dynamicBase = mix(cool, warm, paletteFactor);
    
    // Combine with vColor (which contains depth and secondary time-based pulses from vertex shader)
    vec3 baseColor = mix(dynamicBase, vColor, 0.35);

    // Faster particles get a much softer/wider glow, which leaves better trails in the afterimage pass
    float glowSharpness = mix(3.5, 1.2, speedFactor);
    float strength = 1.0 - (r / 0.5);
    strength = pow(strength, glowSharpness);

    // Non-linear speed boost for opacity to favor high-velocity movements
    float speedBoost = pow(speedFactor, 1.4) * 1.2;
    
    // Brightness boost scale - faster particles are brighter and thus linger longer in post-processing
    float bloomBoost = 1.6 + speedFactor * 0.6;
    
    // Shift color towards white at high speeds to simulate "heat"
    vec3 hotColor = mix(baseColor, vec3(1.0, 1.0, 1.0), speedFactor * 0.6);
    
    // Multiplied by bloomBoost to boost values for the bloom and afterimage passes for more pronounced trails
    gl_FragColor = vec4(hotColor * bloomBoost, strength * (vOpacity + speedBoost));
  }
`;

const ParticleBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const scrollRef = useRef(0);
  const lastActivityRef = useRef(Date.now());
  const idleIntensityRef = useRef(0);
  const interactionIntensityRef = useRef(0);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.z = 600;

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance" 
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Post-processing setup
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      2.0, // Increased strength
      0.5, // Increased radius
      0.1  // Lowered threshold to catch more particles
    );
    
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    const afterimagePass = new AfterimagePass();
    afterimagePass.uniforms['damp'].value = 0.9; // Slightly more persistent trails for better visibility
    composer.addPass(afterimagePass);

    // Particle Setup
    const particleCount = window.innerWidth < 768 ? 40000 : 120000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const randoms = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spread particles in a large prism
      positions[i3 + 0] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i3 + 2] = (Math.random() - 0.5) * 1000;

      randoms[i3 + 0] = Math.random();
      randoms[i3 + 1] = Math.random();
      randoms[i3 + 2] = Math.random();

      sizes[i] = 2 + Math.random() * 8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uSize: { value: 15.0 },
        uMouse: { value: new THREE.Vector2() },
        uScroll: { value: 0 },
        uScrollIntensity: { value: 0 },
        uColorShiftSpeed: { value: 0.12 },
        uIdleIntensity: { value: 0 },
        uInteractionIntensity: { value: 0 }
      }
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      lastActivityRef.current = Date.now();
    };

    const handleMouseDown = () => {
      isInteractingRef.current = true;
      lastActivityRef.current = Date.now();
    };

    const handleMouseUp = () => {
      isInteractingRef.current = false;
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('scroll', handleScroll);

    const timer = new THREE.Timer();
    let frameId: number;

    const animate = (timestamp: number) => {
      timer.update(timestamp);
      const elapsedTime = timer.getElapsed();
      material.uniforms.uTime.value = elapsedTime;
      
      // Update idle state
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;
      const IDLE_THRESHOLD = 30000; // Start idle after 30 seconds
      const targetIdleIntensity = timeSinceLastActivity > IDLE_THRESHOLD ? 1.0 : 0.0;
      
      // Smoothly interpolate idle intensity
      idleIntensityRef.current += (targetIdleIntensity - idleIntensityRef.current) * 0.02;
      material.uniforms.uIdleIntensity.value = idleIntensityRef.current;
      
      // Update interaction intensity (repulsion vs attraction)
      const targetInteractionIntensity = isInteractingRef.current ? 1.0 : 0.0;
      interactionIntensityRef.current += (targetInteractionIntensity - interactionIntensityRef.current) * 0.1;
      material.uniforms.uInteractionIntensity.value = interactionIntensityRef.current;
      
      // Smoothly interpolate mouse and scroll values for the shader
      material.uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
      material.uniforms.uScroll.value += (scrollRef.current - material.uniforms.uScroll.value) * 0.05;
      material.uniforms.uScrollIntensity.value += (scrollRef.current - material.uniforms.uScrollIntensity.value) * 0.08;

      // Subtle camera rotation based on mouse
      camera.position.x += (mouseRef.current.x * 50 - camera.position.x) * 0.05;
      camera.position.y += (mouseRef.current.y * 50 - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      composer.render();
      frameId = requestAnimationFrame(animate);
    };

    animate(performance.now());

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(frameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none -z-50" 
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleBackground;
