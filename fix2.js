
window.openRingSlider = function(groupName) {
  const container = document.getElementById("ringOverlay");
  const ring = document.getElementById("ring");
  const dragger = document.getElementById("dragger");
  if(!container || !ring || !dragger) return;

  container.style.opacity = "1";
  container.style.visibility = "visible";
  ring.innerHTML = "";
  
  const items = document.querySelectorAll(`.portfolio-item[data-group="${groupName}"] img`);
  if(!items || items.length === 0) return;

  items.forEach((img, i) => {
     const div = document.createElement("div");
     div.className = "img";
     
     const parentItem = img.closest(".portfolio-item");
     const lbIdx = parentItem ? parentItem.getAttribute("data-lightbox") : 0;
     
     div.onclick = function() {
        if(typeof window.openLb === "function") {
           window.openLb(parseInt(lbIdx));
           const nextBtn = document.getElementById("lightboxNext");
           const prevBtn = document.getElementById("lightboxPrev");
           if(nextBtn) nextBtn.style.display = "none";
           if(prevBtn) prevBtn.style.display = "none";
        }
     };
     ring.appendChild(div);
  });

  const imgElements = ring.querySelectorAll(".img");
  const numImgs = imgElements.length;
  // Calculate angle based on how many images there are (your example hardcoded -36 for 10 images)
  const angleDeg = 360 / numImgs;

  let xPos = 0;

  function getBgPos(i){ 
    return ( -gsap.utils.wrap(0, 360, gsap.getProperty(ring, "rotationY") - 180 - i * angleDeg) / 360 * 400 ) + "px 0px";
  }

  // Kill old draggable instances
  if(window.draggerInst && window.draggerInst[0]) window.draggerInst[0].kill();

  gsap.timeline()
    .set(dragger, { opacity:0, x:0, y:0 }) //make the drag layer invisible
    .set(ring,    { rotationY:180 }) //set initial rotationY so the parallax jump happens off screen
    .set("#ringOverlay .img",  { // apply transform rotations to each image
      rotateY: (i)=> i * -angleDeg,
      transformOrigin: "50% 50% 500px",
      z: -500,
      backgroundImage:(i)=>`url("${items[i].src}")`,
      backgroundPosition:(i)=>getBgPos(i),
      backfaceVisibility:"hidden"
    })    
    .from("#ringOverlay .img", {
      duration:1.5,
      y:200,
      opacity:0,
      stagger:0.1,
      ease:"expo"
    });

  window.draggerInst = Draggable.create(dragger, {
    onDragStart:(e)=>{ 
      if (e.touches) e.clientX = e.touches[0].clientX;
      xPos = Math.round(e.clientX);
    },
    onDrag:(e)=>{
      if (e.touches) e.clientX = e.touches[0].clientX;    
      
      gsap.to(ring, {
        rotationY: "-=" +( (Math.round(e.clientX)-xPos)%360 ),
        onUpdate: ()=>{gsap.set("#ringOverlay .img", { backgroundPosition:(i)=>getBgPos(i) }) }
      });
      xPos = Math.round(e.clientX);
    },
    onDragEnd:()=> {
      gsap.set(dragger, {x:0, y:0}) // reset drag layer
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("closeRing")?.addEventListener("click", function() {
       document.getElementById("ringOverlay").style.opacity = "0";
       document.getElementById("ringOverlay").style.visibility = "hidden";
    });
    
    document.getElementById("lightboxClose")?.addEventListener("click", () => {
      const nextBtn = document.getElementById("lightboxNext");
      const prevBtn = document.getElementById("lightboxPrev");
      if (nextBtn) nextBtn.style.display = "";
      if (prevBtn) prevBtn.style.display = "";
    });
});

