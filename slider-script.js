// -------------------------------------------------
// ------------------ Utilities --------------------
// -------------------------------------------------

// Math utilities
const wrap = (n, max) => (n + max) % max;
const lerp = (a, b, t) => a + (b - a) * t;

// DOM utilities
const isHTMLElement = (el) => el instanceof HTMLElement;

const genId = (() => {
let count = 0;
return () => {
return (count++).toString();
};
})();

class Raf {
constructor() {
this.rafId = 0;
this.raf = this.raf.bind(this);
this.callbacks = [];
}

start() {
	if (this.rafId) return;
	this.raf();
}

stop() {
	if (!this.rafId) return;
	cancelAnimationFrame(this.rafId);
	this.rafId = 0;
}

raf() {
this.callbacks.forEach(({ callback, id }) => callback({ id }));
	if (this.callbacks.length > 0) {
		this.rafId = requestAnimationFrame(this.raf);
	} else {
		this.rafId = 0;
	}
}

add(callback, id) {
this.callbacks.push({ callback, id: id || genId() });
	if (!this.rafId) this.start();
}

remove(id) {
this.callbacks = this.callbacks.filter((callback) => callback.id !== id);
	if (this.callbacks.length === 0) this.stop();
}
}

class Vec2 {
constructor(x = 0, y = 0) {
this.x = x;
this.y = y;
}

set(x, y) {
this.x = x;
this.y = y;
}

lerp(v, t) {
this.x = lerp(this.x, v.x, t);
this.y = lerp(this.y, v.y, t);
}
}

const vec2 = (x = 0, y = 0) => new Vec2(x, y);

const canTilt = window.matchMedia
	? window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches
	: true;

function tilt(node, options) {
let { trigger, target } = resolveOptions(node, options);

let lerpAmount = 0.06;

const rotDeg = { current: vec2(), target: vec2() };
const bgPos = { current: vec2(), target: vec2() };

const update = (newOptions) => {
destroy();
({ trigger, target } = resolveOptions(node, newOptions));
init();
};

let rafId;

function ticker({ id }) {
rafId = id;

rotDeg.current.lerp(rotDeg.target, lerpAmount);
bgPos.current.lerp(bgPos.target, lerpAmount);

for (const el of target) {
el.style.setProperty("--rotX", rotDeg.current.y.toFixed(2) + "deg");
el.style.setProperty("--rotY", rotDeg.current.x.toFixed(2) + "deg");

el.style.setProperty("--bgPosX", bgPos.current.x.toFixed(2) + "%");
el.style.setProperty("--bgPosY", bgPos.current.y.toFixed(2) + "%");
}
}

const onMouseMove = ({ offsetX, offsetY }) => {
lerpAmount = 0.1;

for (const el of target) {
const ox = (offsetX - el.clientWidth * 0.5) / (Math.PI * 3);
const oy = -(offsetY - el.clientHeight * 0.5) / (Math.PI * 4);

rotDeg.target.set(ox, oy);
bgPos.target.set(-ox * 0.3, oy * 0.3);
}
};

const onMouseLeave = () => {
lerpAmount = 0.06;

rotDeg.target.set(0, 0);
bgPos.target.set(0, 0);
};

const addListeners = () => {
trigger.addEventListener("mousemove", onMouseMove);
trigger.addEventListener("mouseleave", onMouseLeave);
};

const removeListeners = () => {
trigger.removeEventListener("mousemove", onMouseMove);
trigger.removeEventListener("mouseleave", onMouseLeave);
};

const init = () => {
addListeners();
raf.add(ticker);
};

const destroy = () => {
removeListeners();
raf.remove(rafId);
};

init();

return { destroy, update };
}

function resolveOptions(node, options) {
return {
trigger: options?.trigger ?? node,
target: options?.target
? Array.isArray(options.target)
? options.target
: [options.target]
: [node]
};
}

// Global Raf Instance
const raf = new Raf();

function initSlider() {
const loader = document.querySelector(".slider-loader");

const slides = [...document.querySelectorAll(".slide")];
const slidesInfo = [...document.querySelectorAll(".slide-info")];

const buttons = {
prev: document.querySelector(".slider--btn__prev"),
next: document.querySelector(".slider--btn__next")
};

if(loader) {
loader.style.opacity = 0;
loader.style.pointerEvents = "none";
}

const currentIdx = slides.findIndex((slide) => slide.hasAttribute("data-current"));
primeSliderImages(slides, currentIdx === -1 ? 0 : currentIdx);

slides.forEach((slide, i) => {
const slideInner = slide.querySelector(".slide__inner");
const slideInfoInner = slidesInfo[i] ? slidesInfo[i].querySelector(".slide-info__inner") : null;

let targets = [slideInner];
if (slideInfoInner) targets.push(slideInfoInner);


	if (canTilt) {
		tilt(slide, { target: targets });
	}
	slide.addEventListener("click", () => {
		if(!slide.hasAttribute("data-current")) return;
		const img = slide.querySelector("img.slide--image");
		if(img) {
			const lbIdx = img.getAttribute("data-lightbox");
			const origItem = document.querySelector(`.portfolio-item[data-lightbox="${lbIdx}"]`);
			if (origItem) origItem.click();
		}
	});
});

if(buttons.prev) buttons.prev.addEventListener("click", change(-1));
if(buttons.next) buttons.next.addEventListener("click", change(1));
}

function primeSliderImages(slides, currentIdx) {
	const total = slides.length;
	if (total === 0) return;

	slides.forEach((slide, index) => {
		const img = slide.querySelector("img.slide--image");
		if (!img) return;

		img.decoding = "async";

		const isCurrent = index === currentIdx;
		const isAdjacent = index === wrap(currentIdx + 1, total) || index === wrap(currentIdx - 1, total);
		const isPriority = isCurrent || isAdjacent;

		if (isPriority) {
			img.loading = "eager";
			img.fetchPriority = "high";
		} else {
			img.loading = "lazy";
			img.fetchPriority = "low";
		}
	});
}

function setupSlider() {
	const loaderText = document.querySelector(".slider-loader__text");
	if (loaderText) loaderText.textContent = "100%";
	initSlider();
}

function change(direction) {
	return () => {
		const slides = [...document.querySelectorAll(".slide")];
		const slidesInfo = [...document.querySelectorAll(".slide-info")];
		const slideBgs = [...document.querySelectorAll(".slide__bg")];
		
		const total = slides.length;
		if (total === 0) return;

		let currentIdx = slides.findIndex(s => s.hasAttribute("data-current"));
		if (currentIdx === -1) currentIdx = 0;

		slides.forEach(el => { el.removeAttribute("data-current"); el.removeAttribute("data-next"); el.removeAttribute("data-previous"); el.style.zIndex = "0"; });
		slidesInfo.forEach(el => { if(el){ el.removeAttribute("data-current"); el.removeAttribute("data-next"); el.removeAttribute("data-previous"); }});
		slideBgs.forEach(el => { if(el){ el.removeAttribute("data-current"); el.removeAttribute("data-next"); el.removeAttribute("data-previous"); }});

		const newCur = (currentIdx + direction + total) % total;
		const nextIdx = (newCur + 1) % total;
		const prevIdx = (newCur - 1 + total) % total;
		primeSliderImages(slides, newCur);

if(slides[newCur]) { slides[newCur].setAttribute("data-current", ""); slides[newCur].style.zIndex = "100"; }
                if(slides[nextIdx]) { slides[nextIdx].setAttribute("data-next", ""); slides[nextIdx].style.zIndex = "10"; }
                if(slides[prevIdx]) { slides[prevIdx].setAttribute("data-previous", ""); slides[prevIdx].style.zIndex = "10"; }

		if(slidesInfo[newCur]) slidesInfo[newCur].setAttribute("data-current", "");
		if(slidesInfo[nextIdx]) slidesInfo[nextIdx].setAttribute("data-next", "");
		if(slidesInfo[prevIdx]) slidesInfo[prevIdx].setAttribute("data-previous", "");
		
		if(slideBgs[newCur]) slideBgs[newCur].setAttribute("data-current", "");
		if(slideBgs[nextIdx]) slideBgs[nextIdx].setAttribute("data-next", "");
		if(slideBgs[prevIdx]) slideBgs[prevIdx].setAttribute("data-previous", "");
	};
}

// Start
document.addEventListener("DOMContentLoaded", () => {
setupSlider();
});

