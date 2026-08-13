// THE GARAGE KEY — interactive vehicle rotator
//
// NOTE ON ASSETS: no real Kia vehicle photography is bundled here (this
// environment can't generate or fetch product photos). The rotator currently
// drives a stylised, unbranded SVG silhouette defined inline in index.html
// (#rotatorVehicle) using a 3D CSS transform tied to the mouse position.
//
// To upgrade this to a real 360° product viewer once official turntable
// photography is available (a sequence of frames shot at even angle
// intervals, e.g. 24–36 images):
//   1. Drop the frames in assets/img/rotator/ as 001.jpg ... 0NN.jpg
//   2. Replace the SVG in index.html with an <img id="rotatorVehicle">
//   3. Swap the transform logic below for a frame-index swap:
//        const frame = Math.round(((x + 0.5) * (FRAME_COUNT - 1)));
//        vehicle.src = `assets/img/rotator/${String(frame+1).padStart(3,'0')}.jpg`;

(function () {
  const stage = document.getElementById('rotatorStage');
  const vehicle = document.getElementById('rotatorVehicle');
  if (!stage || !vehicle) return;

  const MAX_Y = 11; // deg, left/right (~20% of the original 55deg range)
  const MAX_X = 2;  // deg, up/down (~20% of the original 10deg range)

  function applyFromPoint(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const y = (clientY - rect.top) / rect.height - 0.5;
    const rotY = x * MAX_Y * 2;
    const rotX = y * -MAX_X * 2;
    vehicle.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  }

  stage.addEventListener('mousemove', (e) => applyFromPoint(e.clientX, e.clientY));
  stage.addEventListener('mouseleave', () => {
    vehicle.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
  stage.addEventListener(
    'touchmove',
    (e) => {
      if (!e.touches[0]) return;
      applyFromPoint(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  // gentle idle sway so the element doesn't look static before interaction
  let idle = true;
  stage.addEventListener('mouseenter', () => (idle = false));
  stage.addEventListener('touchstart', () => (idle = false), { passive: true });
  let t = 0;
  function tick() {
    if (idle) {
      t += 0.012;
      vehicle.style.transform = `rotateX(2deg) rotateY(${Math.sin(t) * 3}deg)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
