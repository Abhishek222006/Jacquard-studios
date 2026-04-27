
const ringContainer = document.getElementById("ringContainer");
const ring = document.getElementById("ring");
const dragger = document.getElementById("dragger");

window.openRingSlider = function(groupName) {
  if (!ringContainer || !ring || !dragger) return;

  const items = document.querySelectorAll(`.portfolio-item[data-group="${groupName}"] img`);
  if (!items || items.length === 0) return;

  ring.innerHTML = "";

  items.forEach((img, i) => {
    const div = document.createElement("div");
    div.className = "img";
    div.style.backgroundImage = `url("${img.src}")`;
    const parentItem = img.closest(".portfolio-item");
    const parentLbIdx = parentItem ? parentItem.getAttribute("data-lightbox") : 0;
    
    div.addEventListener("click", () => {
       if (typeof openLb === "function") {
         openLb(parseInt(parentLbIdx));
         const nextBtn = document.getElementById("lightboxNext");
         const prevBtn = document.getElementById("lightboxPrev");
         if (nextBtn) nextBtn.style.display = "none";
         if (prevBtn) prevBtn.style.display = "none";
       }
    });

    ring.appendChild(div);
  });

  const numImgs = items.length;
  // Calculate exact radius to form a perfect n-sided polygon depending on width
  // Width is 320px + 40px gap = 360px per side
  const radius = Math.max(500, Math.round((360 / 2) / Math.tan(Math.PI / numImgs)));
  const angle = 360 / numImgs;

  gsap.timeline()
    .set(dragger, { opacity:0, x:0, y:0 }) 
    .set(ring,    { rotationY:0 }) 
    .set("#ring .img",  { 
      rotateY: (i)=> i * -angle,
      transformOrigin: `50% 50% ${radius}px`,
      z: -radius
    })    
    .from("#ring .img", {
      duration:1.5,
      y: 400,
      opacity:0,
      stagger:0.1,
      ease:"expo"
    });

  let xPos = 0;
  Draggable.create(dragger, {
    type: "x",
    onDragStart:function(e) { 
      xPos = this.x;
    },
    onDrag:function(e) {
      const diff = this.x - xPos;
      // Convert linear distance to degrees (simple multiply makes it feel right)
      gsap.to(ring, {
        rotationY: `+=${diff * 0.5}`,
        overwrite: "auto"
      });
      xPos = this.x;
    },
    onDragEnd:()=> {
      // Snap to nearest image angle so it ALWAYS faces the camera directly
      const currentRot = gsap.getProperty(ring, "rotationY");
      const snapRot = Math.round(currentRot / angle) * angle;
      gsap.to(ring, { rotationY: snapRot, duration: 0.6, ease: "power2.out" });
      gsap.set(dragger, {x:0, y:0});
    }
  });

  ringContainer.classList.add("active");
};

// Listeners
document.getElementById("ringClose")?.addEventListener("click", () => {
  document.getElementById("ringContainer")?.classList.remove("active");
});
document.getElementById("lightboxClose")?.addEventListener("click", () => {
  const nextBtn = document.getElementById("lightboxNext");
  const prevBtn = document.getElementById("lightboxPrev");
  if (nextBtn) nextBtn.style.display = "";
  if (prevBtn) prevBtn.style.display = "";
});

