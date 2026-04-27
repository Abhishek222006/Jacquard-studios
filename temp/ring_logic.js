
window.openRingSlider = function(groupName) {
  const ringContainer = document.getElementById("ringContainer");
  const ring = document.getElementById("ring");
  const dragger = document.getElementById("dragger");
  if (!ringContainer || !ring || !dragger) return;

  const items = document.querySelectorAll(`.portfolio-item[data-group="${groupName}"]`);
  if (!items || items.length === 0) return;

  ring.innerHTML = "";

  items.forEach((item, i) => {
    const img = item.querySelector("img");
    if(!img) return;
    const div = document.createElement("div");
    div.className = "img";
    div.style.backgroundImage = `url("${img.src}")`;
    const parentLbIdx = item.getAttribute("data-lightbox");
    
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
  const angle = 360 / numImgs;

  function getBgPos(i) {
    if (!ring) return "0px 0px";
    const rot = gsap.getProperty(ring, "rotationY") || 0;
    return (-gsap.utils.wrap(0, 360, rot - 180 - i * angle) / 360 * 400) + "px 0px";
  }

  gsap.timeline()
    .set(dragger, { opacity:0, x:0, y:0 }) 
    .set(ring,    { rotationY:180 }) 
    .set(".img",  { 
      rotateY: (i)=> i * -angle,
      transformOrigin: "50% 50% 500px",
      z: -500,
      backgroundPosition:(i)=>getBgPos(i),
      backfaceVisibility:"hidden"
    })    
    .from(".img", {
      duration:1.5,
      y:200,
      opacity:0,
      stagger:0.1,
      ease:"expo"
    });

  let xPos = 0;
  Draggable.create(dragger, {
    onDragStart:(e)=>{ 
      if (e.touches) e.clientX = e.touches[0].clientX;
      xPos = Math.round(e.clientX);
    },
    onDrag:(e)=>{
      if (e.touches) e.clientX = e.touches[0].clientX;    
      const cX = Math.round(e.clientX);
      gsap.to(ring, {
        rotationY: "-=" + ((cX - xPos) % 360),
        onUpdate: ()=>{ gsap.set(".img", { backgroundPosition:(i)=>getBgPos(i) }) }
      });
      xPos = cX;
    },
    onDragEnd:()=> {
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

