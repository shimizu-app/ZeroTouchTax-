import React, { useState, useEffect, useRef } from "react";
import { C, hd, bd, mono, FONT } from "../lib/theme";
import { Rv, Mag, Card3, WireCanvas } from "./ui";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const ok = email && pass;
  const bgRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    let w = el.clientWidth, h = el.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 0.5, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x020208, 1);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 3.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    /* ── Materials: Silver / Chrome ── */
    var matPed = new THREE.MeshStandardMaterial({ color:0x18142e, metalness:0.95, roughness:0.08, emissive:0x0a0818, emissiveIntensity:0.05 });
    var matPedTop = new THREE.MeshStandardMaterial({ color:0x201a3a, metalness:0.98, roughness:0.04, emissive:0x0f0a28, emissiveIntensity:0.08 });
    var matSilver = new THREE.MeshStandardMaterial({ color:0xc0b8e8, metalness:0.98, roughness:0.06, emissive:0x5544cc, emissiveIntensity:0.3 });
    var matBright = new THREE.MeshStandardMaterial({ color:0xd0c8f8, metalness:1, roughness:0.02, emissive:0x7766ee, emissiveIntensity:0.7 });
    var matGlow = new THREE.MeshStandardMaterial({ color:0xe0d8ff, metalness:1, roughness:0, emissive:0x9988ff, emissiveIntensity:2.0 });
    var matEdgeR = new THREE.MeshStandardMaterial({ color:0xb0a8d8, metalness:0.98, roughness:0.05, emissive:0x6655cc, emissiveIntensity:0.4 });
    var edgeLineMat = new THREE.MeshBasicMaterial({ color:0x8B7BF4, transparent:true, opacity:0.35 });

    /* ── Hero Group ── */
    var heroGroup = new THREE.Group();
    scene.add(heroGroup);

    /* ── Pedestal ── */
    var pedestal = new THREE.Group();
    var pedBlock = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.0, 4.5), matPed);
    pedBlock.position.y = -1.0; pedBlock.castShadow = true; pedBlock.receiveShadow = true;
    pedestal.add(pedBlock);

    var pedTop = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.06, 4.6), matPedTop);
    pedTop.position.y = 0.03; pedTop.receiveShadow = true;
    pedestal.add(pedTop);

    // Glowing edge lines
    var edgeFront = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.02, 0.02), edgeLineMat);
    edgeFront.position.set(0, 0.06, 2.3); pedestal.add(edgeFront);
    var edgeBack = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.02, 0.02), edgeLineMat);
    edgeBack.position.set(0, 0.06, -2.3); pedestal.add(edgeBack);
    var edgeL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 4.6), edgeLineMat);
    edgeL.position.set(-2.3, 0.06, 0); pedestal.add(edgeL);
    var edgeR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 4.6), edgeLineMat);
    edgeR.position.set(2.3, 0.06, 0); pedestal.add(edgeR);

    pedestal.position.set(0, -2.5, 0);
    heroGroup.add(pedestal);

    /* ── Coin Stack Base (2 flat discs) ── */
    var stackBase = new THREE.Group();
    for (var si = 0; si < 2; si++) {
      var disc = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.18, 72), matSilver);
      disc.position.y = si * 0.2; disc.castShadow = true;
      stackBase.add(disc);
      var dRim = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.035, 8, 72), matBright);
      dRim.rotation.x = Math.PI / 2; dRim.position.y = si * 0.2;
      stackBase.add(dRim);
      var gLine = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.015, 6, 72), matGlow);
      gLine.rotation.x = Math.PI / 2; gLine.position.y = si * 0.2 + 0.09;
      stackBase.add(gLine);
    }
    stackBase.position.set(0, -0.9, 0);
    heroGroup.add(stackBase);

    /* ── Main Z Coin (standing upright via pivot group) ── */
    var coinPivot = new THREE.Group();
    coinPivot.position.set(0, 0.6, 0);
    coinPivot.rotation.z = Math.PI / 2; // stand the coin upright
    heroGroup.add(coinPivot);

    var coin = new THREE.Group();
    coinPivot.add(coin);

    var CR = 1.5, CTH = 0.22;

    // Body
    var coinBody = new THREE.Mesh(new THREE.CylinderGeometry(CR, CR, CTH, 80), matSilver);
    coinBody.castShadow = true; coin.add(coinBody);

    // Outer rim
    var outerRim = new THREE.Mesh(new THREE.TorusGeometry(CR, 0.05, 12, 80), matBright);
    outerRim.rotation.x = Math.PI / 2; coin.add(outerRim);

    // Glow rim
    var glowRim = new THREE.Mesh(new THREE.TorusGeometry(CR + 0.01, 0.025, 8, 80), matGlow);
    glowRim.rotation.x = Math.PI / 2; coin.add(glowRim);

    // Inner rings on faces
    var innerFront = new THREE.Mesh(new THREE.TorusGeometry(CR - 0.15, 0.025, 8, 80), matBright);
    innerFront.rotation.x = Math.PI / 2; innerFront.position.y = CTH / 2 + 0.004;
    coin.add(innerFront);
    var innerBack = new THREE.Mesh(new THREE.TorusGeometry(CR - 0.15, 0.025, 8, 80), matBright);
    innerBack.rotation.x = Math.PI / 2; innerBack.position.y = -(CTH / 2 + 0.004);
    coin.add(innerBack);

    // Concentric face rings
    var ringRadii = [1.05, 0.65];
    for (var ri0 = 0; ri0 < ringRadii.length; ri0++) {
      var cr0 = ringRadii[ri0];
      var rFront = new THREE.Mesh(new THREE.TorusGeometry(cr0, 0.018, 8, 64), matBright);
      rFront.rotation.x = Math.PI / 2; rFront.position.y = CTH / 2 + 0.006;
      coin.add(rFront);
      var rBack = new THREE.Mesh(new THREE.TorusGeometry(cr0, 0.018, 8, 64), matBright);
      rBack.rotation.x = Math.PI / 2; rBack.position.y = -(CTH / 2 + 0.006);
      coin.add(rBack);
    }

    // Knurled edge ridges
    for (var ri = 0; ri < 100; ri++) {
      var a = (ri / 100) * Math.PI * 2;
      var ridge = new THREE.Mesh(new THREE.BoxGeometry(0.016, CTH * 0.8, 0.05), matEdgeR);
      ridge.position.set(Math.cos(a) * (CR + 0.012), 0, Math.sin(a) * (CR + 0.012));
      ridge.rotation.y = -a;
      coin.add(ridge);
    }

    // Dot pattern around face
    for (var di = 0; di < 28; di++) {
      var da = (di / 28) * Math.PI * 2;
      var dot = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), matBright);
      dot.position.set(Math.cos(da) * 1.15, CTH / 2 + 0.008, Math.sin(da) * 1.15);
      dot.scale.y = 0.4;
      coin.add(dot);
    }

    // "Z" emboss on front face
    var fY = CTH / 2 + 0.012;
    var zH = 0.04;
    // Top bar
    var zt = new THREE.Mesh(new THREE.BoxGeometry(0.7, zH, 0.11), matBright);
    zt.position.set(0, fY, 0.3); coin.add(zt);
    // Bottom bar
    var zb = new THREE.Mesh(new THREE.BoxGeometry(0.7, zH, 0.11), matBright);
    zb.position.set(0, fY, -0.3); coin.add(zb);
    // Diagonal
    var dLen = Math.sqrt(0.6 * 0.6 + 0.7 * 0.7);
    var zd = new THREE.Mesh(new THREE.BoxGeometry(dLen, zH, 0.09), matBright);
    zd.position.set(0, fY, 0); zd.rotation.y = Math.atan2(0.7, 0.6); coin.add(zd);
    // Serifs
    var s1 = new THREE.Mesh(new THREE.BoxGeometry(0.14, zH, 0.065), matBright);
    s1.position.set(-0.38, fY, 0.3); coin.add(s1);
    var s2 = new THREE.Mesh(new THREE.BoxGeometry(0.14, zH, 0.065), matBright);
    s2.position.set(0.38, fY, 0.3); coin.add(s2);
    var s3 = new THREE.Mesh(new THREE.BoxGeometry(0.14, zH, 0.065), matBright);
    s3.position.set(-0.38, fY, -0.3); coin.add(s3);
    var s4 = new THREE.Mesh(new THREE.BoxGeometry(0.14, zH, 0.065), matBright);
    s4.position.set(0.38, fY, -0.3); coin.add(s4);
    // Strike-through lines
    var st1 = new THREE.Mesh(new THREE.BoxGeometry(0.95, zH * 0.7, 0.03), matBright);
    st1.position.set(0, fY, 0.08); coin.add(st1);
    var st2 = new THREE.Mesh(new THREE.BoxGeometry(0.95, zH * 0.7, 0.03), matBright);
    st2.position.set(0, fY, -0.08); coin.add(st2);

    // Back face Z
    var bY = -(CTH / 2 + 0.012);
    var bzt = new THREE.Mesh(new THREE.BoxGeometry(0.6, zH, 0.09), matBright);
    bzt.position.set(0, bY, 0.25); coin.add(bzt);
    var bzb = new THREE.Mesh(new THREE.BoxGeometry(0.6, zH, 0.09), matBright);
    bzb.position.set(0, bY, -0.25); coin.add(bzb);
    var bzd = new THREE.Mesh(new THREE.BoxGeometry(dLen * 0.8, zH, 0.07), matBright);
    bzd.position.set(0, bY, 0); bzd.rotation.y = Math.atan2(0.6, 0.5); coin.add(bzd);

    /* ── (halo removed — was visible as square) ── */

    /* ── (floor removed — was visible as rectangle) ── */

    /* ═══ PARTICLE SYSTEM — 均一サイズ・最大発光 ═══ */

    var cY = 0.3;
    var cZ = -1.0;
    var PS = 0.04; // 統一パーティクルサイズ

    // ── Layer 1: メインの円 ──
    var ringCount = 4000;
    var ringGeo = new THREE.BufferGeometry();
    var ringArr = new Float32Array(ringCount * 3);
    var ringAngle = [];
    var ringR = [];
    var ringSpeed = [];
    for (var rp = 0; rp < ringCount; rp++) {
      var a1 = Math.random() * Math.PI * 2;
      var r1 = 3.8 + (Math.random() - 0.5) * 1.4;
      ringArr[rp * 3] = Math.cos(a1) * r1;
      ringArr[rp * 3 + 1] = Math.sin(a1) * r1 + cY;
      ringArr[rp * 3 + 2] = cZ + (Math.random() - 0.5) * 0.5;
      ringAngle.push(a1);
      ringR.push(r1);
      ringSpeed.push(0.0002 + Math.random() * 0.0005);
    }
    ringGeo.setAttribute("position", new THREE.BufferAttribute(ringArr, 3));
    var ringMat = new THREE.PointsMaterial({
      color: 0xc0b0ff, size: PS, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(ringGeo, ringMat));

    // ── Layer 2: 密度アップ層（同じサイズ） ──
    var kiraCount = 2000;
    var kiraGeo = new THREE.BufferGeometry();
    var kiraArr = new Float32Array(kiraCount * 3);
    var kiraAngle = [];
    var kiraR = [];
    var kiraSpeed = [];
    var kiraPhase = [];
    for (var ki = 0; ki < kiraCount; ki++) {
      var a2 = Math.random() * Math.PI * 2;
      var r2 = 3.8 + (Math.random() - 0.5) * 1.0;
      kiraArr[ki * 3] = Math.cos(a2) * r2;
      kiraArr[ki * 3 + 1] = Math.sin(a2) * r2 + cY;
      kiraArr[ki * 3 + 2] = cZ + (Math.random() - 0.5) * 0.3;
      kiraAngle.push(a2);
      kiraR.push(r2);
      kiraSpeed.push(0.0003 + Math.random() * 0.0008);
      kiraPhase.push(Math.random() * Math.PI * 2);
    }
    kiraGeo.setAttribute("position", new THREE.BufferAttribute(kiraArr, 3));
    var kiraMat = new THREE.PointsMaterial({
      color: 0xc0b0ff, size: PS, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(kiraGeo, kiraMat));

    // ── Layer 3: Click-burst sparkles (spkGeo) ──
    var spkCount = 80;
    var spkGeo = new THREE.BufferGeometry();
    var spkArr = new Float32Array(spkCount * 3);
    var spkPhase = [];
    var spkAngle = [];
    var spkR2 = [];
    for (var sp = 0; sp < spkCount; sp++) {
      var a5 = Math.random() * Math.PI * 2;
      var r5 = 3.8 + (Math.random() - 0.5) * 1.2;
      spkArr[sp * 3] = Math.cos(a5) * r5;
      spkArr[sp * 3 + 1] = Math.sin(a5) * r5 + cY;
      spkArr[sp * 3 + 2] = cZ;
      spkPhase.push(Math.random() * Math.PI * 2);
      spkAngle.push(a5);
      spkR2.push(r5);
    }
    spkGeo.setAttribute("position", new THREE.BufferAttribute(spkArr, 3));
    var spkMat = new THREE.PointsMaterial({
      color: 0xc0b0ff, size: PS, transparent: true, opacity: 1.0,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    scene.add(new THREE.Points(spkGeo, spkMat));


    /* ── Lights (MAX光量) ── */
    scene.add(new THREE.AmbientLight(0x100818, 1.0));
    var keyLight = new THREE.DirectionalLight(0xccbbff, 5.0);
    keyLight.position.set(-5, 10, 8); keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024; keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5; keyLight.shadow.camera.far = 35;
    keyLight.shadow.camera.left = -10; keyLight.shadow.camera.right = 10;
    keyLight.shadow.camera.top = 10; keyLight.shadow.camera.bottom = -10;
    scene.add(keyLight);

    var rimLight = new THREE.PointLight(0x8B7BF4, 8.0, 30);
    rimLight.position.set(2, 3, -5); scene.add(rimLight);
    var warmFill = new THREE.PointLight(0xbbaaee, 2.5, 20);
    warmFill.position.set(0, -2, 4); scene.add(warmFill);
    var coolSide = new THREE.PointLight(0x6655cc, 4.5, 30);
    coolSide.position.set(-5, 1, 3); scene.add(coolSide);
    var topSpot = new THREE.PointLight(0xddccff, 4.5, 20);
    topSpot.position.set(0, 6, 2); scene.add(topSpot);
    // Extra back glow light
    var backGlow = new THREE.PointLight(0x5544cc, 3.0, 25);
    backGlow.position.set(0, 0, -6); scene.add(backGlow);

    /* ── Mouse / Touch ── */
    var targetMX = 0, targetMY = 0, smoothMX = 0, smoothMY = 0;
    var onMouseMove = function(e) { targetMX = (e.clientX / w - 0.5) * 2; targetMY = (e.clientY / h - 0.5) * 2; };
    var onTouchMove = function(e) { if (e.touches[0]) { targetMX = (e.touches[0].clientX / w - 0.5) * 2; targetMY = (e.touches[0].clientY / h - 0.5) * 2; } };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    /* ── Click interaction ── */
    var clickSpinVel = 0;
    var clickBounceT = 0;
    var clickGlow = 0;
    var isHovering = false;

    var raycaster = new THREE.Raycaster();
    var mouseVec = new THREE.Vector2();

    // Collect all coin meshes for raycast
    var coinMeshes = [];
    coin.traverse(function(c) { if (c.isMesh) coinMeshes.push(c); });
    stackBase.traverse(function(c) { if (c.isMesh) coinMeshes.push(c); });

    var onPointerMove = function(e) {
      var rect = el.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      var hits = raycaster.intersectObjects(coinMeshes);
      var over = hits.length > 0;
      if (over !== isHovering) {
        isHovering = over;
        el.style.cursor = over ? "pointer" : "default";
      }
    };

    var onClick = function(e) {
      var rect = el.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      var hits = raycaster.intersectObjects(coinMeshes);
      if (hits.length > 0) {
        // Trigger spin burst
        clickSpinVel += 0.35;
        // Trigger bounce
        clickBounceT = 1.0;
        // Trigger glow burst
        clickGlow = 1.5;
        // Burst sparkles outward
        var pp = spkGeo.attributes.position.array;
        for (var bi = 0; bi < spkCount; bi++) {
          var bAng = Math.random() * Math.PI * 2;
          var bDist = 0.5 + Math.random() * 2;
          pp[bi * 3] += Math.cos(bAng) * bDist * 0.3;
          pp[bi * 3 + 1] += (Math.random() - 0.3) * 1.5;
        }
        spkGeo.attributes.position.needsUpdate = true;
      }
    };

    var onTouchEnd = function(e) {
      if (e.changedTouches && e.changedTouches[0]) {
        var rect = el.getBoundingClientRect();
        var t = e.changedTouches[0];
        mouseVec.x = ((t.clientX - rect.left) / rect.width) * 2 - 1;
        mouseVec.y = -((t.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseVec, camera);
        var hits = raycaster.intersectObjects(coinMeshes);
        if (hits.length > 0) {
          clickSpinVel += 0.35;
          clickBounceT = 1.0;
          clickGlow = 1.5;
        }
      }
    };

    el.addEventListener("click", onClick);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("touchend", onTouchEnd);

    /* ── Animation ── */
    var time = 0;
    var animate = function() {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.016;
      smoothMX += (targetMX - smoothMX) * 0.04;
      smoothMY += (targetMY - smoothMY) * 0.04;

      // Hero group rotation from mouse
      heroGroup.rotation.y += ((-0.15 + smoothMX * 0.5) - heroGroup.rotation.y) * 0.05;
      heroGroup.rotation.x += ((0.1 - smoothMY * 0.25) - heroGroup.rotation.x) * 0.05;
      heroGroup.rotation.z += (smoothMX * -0.06 - heroGroup.rotation.z) * 0.04;
      heroGroup.position.x += (smoothMX * 0.5 - heroGroup.position.x) * 0.03;
      heroGroup.position.y += (-smoothMY * 0.25 - heroGroup.position.y) * 0.03;

      // Coin: base spin + click spin burst
      clickSpinVel *= 0.97; // decay spin velocity
      coin.rotation.y += 0.003 + clickSpinVel;

      // Click bounce (spring up then settle)
      if (clickBounceT > 0) {
        clickBounceT -= 0.025;
        if (clickBounceT < 0) clickBounceT = 0;
        var bounceY = Math.sin(clickBounceT * Math.PI) * 0.8;
        coinPivot.position.y = 0.3 + bounceY;
        // Stack discs scatter slightly
        stackBase.children.forEach(function(c, i) {
          c.position.x += (Math.sin(i * 1.5) * clickBounceT * 0.3 - c.position.x * 0.05);
        });
      } else {
        coinPivot.position.y += (0.3 - coinPivot.position.y) * 0.05;
      }

      // Click glow burst on coin material
      clickGlow *= 0.95;
      matBright.emissiveIntensity = 0.9 + clickGlow;
      matGlow.emissiveIntensity = 2.5 + Math.sin(time * 0.8) * 0.8 + clickGlow * 3;

      // Hover scale
      var targetScale = isHovering ? 1.06 : 1.0;
      coinPivot.scale.x += (targetScale - coinPivot.scale.x) * 0.08;
      coinPivot.scale.y += (targetScale - coinPivot.scale.y) * 0.08;
      coinPivot.scale.z += (targetScale - coinPivot.scale.z) * 0.08;

      // Camera parallax
      camera.position.x += (smoothMX * 0.5 - camera.position.x) * 0.02;
      camera.position.y += (0.5 - smoothMY * 0.25 - camera.position.y) * 0.02;
      camera.lookAt(0, -0.5, 0);

      // Lights follow mouse
      rimLight.position.x = 2 + smoothMX * 3;
      rimLight.position.y = 3 - smoothMY * 1.5;
      coolSide.position.x = -5 + smoothMX * 2;

      // ═══ 均一キラキラ Animation (XY plane) ═══

      // Main ring — rotate in XY
      var rArr2 = ringGeo.attributes.position.array;
      for (var ri3 = 0; ri3 < ringCount; ri3++) {
        ringAngle[ri3] += ringSpeed[ri3];
        rArr2[ri3 * 3] = Math.cos(ringAngle[ri3]) * ringR[ri3];
        rArr2[ri3 * 3 + 1] = Math.sin(ringAngle[ri3]) * ringR[ri3] + cY;
      }
      ringGeo.attributes.position.needsUpdate = true;

      // Dense layer — XY orbit
      var kArr2 = kiraGeo.attributes.position.array;
      for (var ki2 = 0; ki2 < kiraCount; ki2++) {
        kiraAngle[ki2] += kiraSpeed[ki2];
        kArr2[ki2 * 3] = Math.cos(kiraAngle[ki2]) * kiraR[ki2];
        kArr2[ki2 * 3 + 1] = Math.sin(kiraAngle[ki2]) * kiraR[ki2] + cY;
      }
      kiraGeo.attributes.position.needsUpdate = true;

      // Click-burst sparkles
      var pp = spkGeo.attributes.position.array;
      for (var si2 = 0; si2 < spkCount; si2++) {
        spkAngle[si2] += 0.001;
        pp[si2 * 3] = Math.cos(spkAngle[si2]) * spkR2[si2];
        pp[si2 * 3 + 1] = Math.sin(spkAngle[si2]) * spkR2[si2] + cY;
      }
      spkGeo.attributes.position.needsUpdate = true;

      // Light, glow pulse (MAX)
      rimLight.intensity = 8.0 + Math.sin(time * 0.4) * 2.0 + clickGlow * 6;
      topSpot.intensity = 4.5 + Math.sin(time * 0.5 + 1) * 1.5;
      backGlow.intensity = 3.0 + Math.sin(time * 0.3) * 1.0;

      renderer.render(scene, camera);
    };
    animate();

    var onResize = function() {
      w = el.clientWidth; h = el.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return function() {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
      el.removeEventListener("click", onClick);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("touchend", onTouchEnd);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div style={{ width:"100vw", minHeight:"100vh", background:"#020208", fontFamily:bd, overflow:"auto", position:"relative" }}>
      <link href={FONT} rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Outfit:wght@200;300;400;500;600;700&family=Noto+Sans+JP:wght@700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0}to{opacity:1} }
        @keyframes gradShift { 0%,100%{background-position:0% 50%}50%{background-position:100% 50%} }
        @keyframes checkDraw { 0%{stroke-dashoffset:30} 100%{stroke-dashoffset:0} }
        @keyframes holoShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes dotPulse { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes holoShimmerFast { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .li5:focus{border-color:rgba(139,123,244,.3)!important;box-shadow:0 0 12px rgba(255,255,255,.06)!important;background:rgba(139,123,244,.04)!important}
        button{transition:all .2s ease!important}
        
      `}</style>

      {/* 3D Canvas */}
      <div ref={bgRef} style={{ position:"absolute", inset:0 }} />

      {/* Cinematic vignette overlays — wider to show ring */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 85% 80% at 50% 45%, rgba(2,2,8,0) 0%, rgba(2,2,8,.7) 100%)", zIndex:2, pointerEvents:"none" }} />

      {/* Top nav */}
      <div style={{ position:"absolute", top:0, left:0, right:0, zIndex:20, padding:"20px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", animation:"fadeIn 1s .3s both" }}>
        <div style={{ display:"flex", alignItems:"center", gap:28, background:"rgba(10,12,24,.6)", backdropFilter:"blur(20px)", border:"1px solid rgba(139,123,244,.08)", borderRadius:100, padding:"10px 28px", boxShadow:"0 2px 12px rgba(0,0,0,.25)" }}>
          <span style={{ fontFamily:hd, fontSize:20, color:"#fff", letterSpacing:"-.02em" }}>Z.</span>
          {["機能","料金","導入事例","お知らせ"].map(t=>(
            <button key={t} type="button" style={{ border:"none", background:"transparent", color:"rgba(255,255,255,.35)", fontSize:12, cursor:"pointer", fontFamily:bd, transition:"color .2s" }}
              onMouseEnter={e=>e.target.style.color="#fff"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,.35)"}>{t}</button>
          ))}
        </div>
        <button type="button" style={{ padding:"10px 28px", borderRadius:100, border:"1px solid rgba(100,130,255,.3)", background:"rgba(60,90,200,.12)", color:"rgba(200,210,255,.9)", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:bd, backdropFilter:"blur(8px)", boxShadow:"0 0 28px rgba(255,255,255,.22), 0 0 64px rgba(255,255,255,.09)" }}>ログイン</button>
      </div>

      {/* Hero Headline — Apple style large white text */}
      <div style={{ position:"absolute", top:"8vh", left:0, right:0, zIndex:10, textAlign:"center", animation:"fadeUp 1.2s .3s both", pointerEvents:"none" }}>
        <div style={{ fontFamily:"'Cormorant Garamond', 'Hiragino Mincho ProN', serif", fontSize:"clamp(14px,1.8vw,18px)", fontWeight:400, color:"rgba(200,210,255,.4)", letterSpacing:".3em", marginBottom:12 }}>Zeirishi</div>
        <div style={{ fontFamily:"'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', -apple-system, sans-serif", fontSize:"clamp(36px,5.5vw,72px)", fontWeight:800, color:"#fff", lineHeight:1.15, letterSpacing:"-.02em" }}>
          税の革新を、AIで。
        </div>
      </div>

      {/* Bottom-left: Sub branding */}
      <div style={{ position:"absolute", left:44, bottom:44, zIndex:10, animation:"fadeUp 1s .7s both" }}>
        <div style={{ fontSize:11, color:"rgba(180,190,255,.25)", fontFamily:bd, lineHeight:1.7, maxWidth:300 }}>
          確定申告・法人税・消費税<br/>AIが仕訳から申告書作成まで自動化
        </div>
      </div>

      {/* Right: Login card */}
      <div style={{ position:"absolute", right:"5vw", top:"50%", transform:"translateY(-50%)", zIndex:20, animation:"fadeUp .9s .4s cubic-bezier(.16,1,.3,1) both" }}>
          <div style={{ position:"relative", background:"rgba(14,16,26,.82)", backdropFilter:"blur(30px)", border:"1px solid rgba(139,123,244,.12)", borderRadius:32, padding:"40px 36px", width:340, maxWidth:"85vw", boxSizing:"border-box", boxShadow:"0 4px 12px rgba(0,0,0,.2), 0 0 0 1px rgba(139,123,244,.1), 0 0 30px rgba(255,255,255,.06), 0 0 70px rgba(255,255,255,.02)" }}>

            <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={{ fontFamily:hd, fontSize:38, color:"#fff", letterSpacing:"-.04em", textShadow:"none" }}>Z.</div>
              <div style={{ fontFamily:hd, fontSize:9, color:"rgba(180,190,255,.3)", letterSpacing:".24em", textTransform:"uppercase", marginTop:4, fontFamily:mono }}>AI税務アシスタント</div>
            </div>

            <div style={{ height:1, background:"linear-gradient(90deg, transparent, rgba(139,123,244,.08), transparent)", margin:"0 0 24px" }} />

            <label style={{ fontSize:8, color:"rgba(180,190,255,.25)", letterSpacing:".2em", textTransform:"uppercase", marginBottom:7, display:"block", paddingLeft:16, fontFamily:mono }}>メールアドレス</label>
            <input className="li5" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" type="email"
              style={{ width:"100%", padding:"12px 18px", border:"1px solid rgba(139,123,244,.1)", borderRadius:100, background:"rgba(139,123,244,.04)", fontFamily:bd, fontSize:13, color:"#fff", outline:"none", boxSizing:"border-box", marginBottom:14, caretColor:"rgba(160,180,255,.9)", transition:"all .3s" }} />

            <label style={{ fontSize:8, color:"rgba(180,190,255,.25)", letterSpacing:".2em", textTransform:"uppercase", marginBottom:7, display:"block", paddingLeft:16, fontFamily:mono }}>パスワード</label>
            <input className="li5" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" type="password"
              style={{ width:"100%", padding:"12px 18px", border:"1px solid rgba(139,123,244,.1)", borderRadius:100, background:"rgba(139,123,244,.04)", fontFamily:bd, fontSize:13, color:"#fff", outline:"none", boxSizing:"border-box", marginBottom:6, caretColor:"rgba(160,180,255,.9)", transition:"all .3s" }} />

            <div style={{ textAlign:"right", marginBottom:22 }}>
              <button type="button" style={{ border:"none", background:"transparent", color:"rgba(255,255,255,.15)", fontSize:10, cursor:"pointer", fontFamily:bd }}>パスワードを忘れた</button>
            </div>

            <div style={{ position:"relative" }}>
              <Mag onClick={()=>{ if(ok) onLogin(); }} s={{
                position:"relative", width:"100%", padding:"13px", border:ok?"none":"1px solid rgba(100,130,255,.08)", borderRadius:100,
                background:ok?"linear-gradient(135deg, rgba(140,165,255,.9), rgba(100,130,240,.85))":"transparent",
                color:ok?"#060610":"rgba(139,123,244,.15)", fontFamily:mono, fontSize:10, fontWeight:600,
                letterSpacing:".16em", textTransform:"uppercase", cursor:ok?"pointer":"default", transition:"all .4s",
                boxShadow:ok?"0 0 32px rgba(255,255,255,.28), 0 0 72px rgba(255,255,255,.1)":"none"
              }}>ログイン →</Mag>
            </div>

            <div style={{ textAlign:"center", marginTop:18, fontSize:10, color:"rgba(139,123,244,.1)" }}>
              アカウントをお持ちでない方　<button type="button" style={{ border:"none", background:"transparent", color:"rgba(160,175,255,.3)", fontWeight:600, cursor:"pointer", fontFamily:bd, fontSize:10 }}>新規登録</button>
            </div>
          </div>
      </div>
    </div>
  );
}


/* ═══ JAPAN MAP ═══ */

export default Login;
