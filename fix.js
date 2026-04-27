
window.openRingSlider = function(groupName) {
  const overlay = document.getElementById("ringOverlay");
  const ring = document.getElementById("ring");
  const dragger = document.getElementById("dragger");
  overlay.style.display = "block";
  ring.innerHTML = "";
  
  const items = document.querySelectorAll(`.portfolio-item[data-group="${groupName}"]`);
  let bgSources = [];
  let lbIndices = [];
  items.forEach((it) => {
      const img = it.querySelector("img");
      if(img) {
          bgSources.push(img.src);
          lbIndices.push(it.getAttribute("data-lightbox"));
      }
  });

  bgSources.forEach((src, i) => {
     const d = document.createElement("div");
     d.className = "img";
     d.style.cursor = "pointer";
     d.onclick = function() {
        if(typeof window.openLb === "function") {
           window.openLb(parseInt(lbIndices[i]));
           const nextBtn = document.getElementById("lightboxNext");
           const prevBtn = document.getElementById("lightboxPrev");
           if(nextBtn) nextBtn.style.display = "none";
           if(prevBtn) prevBtn.style.display = "none";
        }
     };
     ring.appendChild(d);
  });

  const num = bgSources.length;
  // Use their exact constant "-36" mapped to variable
  const angle = 360 / num; 
  let xPos = 0;
  
  function getBgPos(i){ 
    return ( -gsap.utils.wrap(0,360,gsap.getProperty(ring, "rotationY")-180-i*angle)/360*400 )+"px 0px";
  }

  // Kill old draggable instances
  if(window.draggerInst) window.draggerInst[0].kill();

  gsap.timeline()
    .set(dragger, { opacity:0, x:0, y:0 }) 
    .set(ring,    { rotationY:180 }) 
    .set("#ringOverlay .img",  { 
      rotateY: (i)=> i*-angle, 
      transformOrigin: "50% 50% 500px",
      z: -500,
      backgroundImage:(i)=>`url("${bgSources[i]}")`,
      backgroundPosition:(i)=>getBgPos(i),
      backfaceVisibility:"hidden",
      backgroundSize: "cover" 
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
      gsap.set(dragger, {x:0, y:0}) 
    }
  });

};

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("closeRing").onclick = function() {
       document.getElementById("ringOverlay").style.display = "none";
    };
    document.getElementById("lightboxClose")?.addEventListener("click", () => {
      const nextBtn = document.getElementById("lightboxNext");
      const prevBtn = document.getElementById("lightboxPrev");
      if (nextBtn) nextBtn.style.display = "";
      if (prevBtn) prevBtn.style.display = "";
    });
});

