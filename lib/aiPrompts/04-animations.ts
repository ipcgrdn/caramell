export const ANIMATIONS = `
<ANIMATIONS CORE RULES>
<rule priority="critical">
- Use simple hover effects.
- Do NOT overuse animations.
- Do adjust duration, stagger, ease, and other properties based on your specific design needs.
</rule>
</ANIMATIONS CORE RULES>

<GSAP ANIMATION PATTERNS>

## 1. ScrollSmoother
Creates buttery-smooth scrolling experience.

**Required Plugin:**
\`\`\`html
<script src="https://unpkg.com/gsap@3/dist/ScrollSmoother.min.js"></script>
\`\`\`

**HTML Structure (Required):**
\`\`\`html
<div id="smooth-wrapper">
  <div id="smooth-content">
    <!-- All page content goes here -->
    <section class="h-screen bg-black text-white flex items-center justify-center">
      <h1 class="text-6xl font-serif">Smooth Scroll Demo</h1>
    </section>
    <section class="h-screen bg-white text-black flex items-center justify-center">
      <h1 class="text-6xl font-serif">Another Section</h1>
    </section>
  </div>
</div>

<script>
gsap.registerPlugin(ScrollSmoother);

ScrollSmoother.create({
  smooth: 10,       // Smoothness level (10 = very smooth and slow scroll)
  effects: true,    // Enable data-speed and data-lag attributes
});
</script>
\`\`\`

## 2. Timeline
Chain multiple animations in sequence with overlap control.

\`\`\`html
<div class="container h-screen flex items-center justify-center gap-8">
  <div class="element-1 w-32 h-32 bg-blue-500 opacity-0"></div>
  <div class="element-2 w-32 h-32 bg-red-500"></div>
  <div class="element-3 w-32 h-32 bg-green-500"></div>
</div>

<script>
const tl = gsap.timeline({ delay: 1 });

tl.to(".element-1", { opacity: 1 })
  .to(".element-2", { x: 100 }, "-=0.5")  // Overlap by 0.5s
  .from(".element-3", { y: 50 });
</script>
\`\`\`

## 3. ScrollTrigger
Trigger animations based on scroll position.

\`\`\`html
<section class="hero-container h-screen bg-black text-white flex items-center justify-center">
  <h1 class="text-8xl font-serif">Scroll Down</h1>
</section>

<section class="h-screen bg-gray-100"></section>

<script>
gsap.registerPlugin(ScrollTrigger);

gsap.timeline({
  scrollTrigger: {
    trigger: ".hero-container",
    start: "1% top",      // When hero is 1% from top
    end: "bottom top",    // When hero bottom hits viewport top
    scrub: true,          // Sync animation with scroll
  }
}).to(".hero-container", {
  rotate: 7,
  scale: 0.9
});
</script>
\`\`\`

## 4. SplitText
Split text into words and animate each word individually.

**Required Plugin:**
\`\`\`html
<script src="https://unpkg.com/gsap@3/dist/SplitText.min.js"></script>
\`\`\`

\`\`\`html
<section class="text-section h-screen flex items-center justify-center bg-black">
  <h2 class="split-text text-6xl font-serif text-gray-500 max-w-4xl text-center leading-tight">
    This text will change color word by word as you scroll through
  </h2>
</section>

<script>
gsap.registerPlugin(SplitText, ScrollTrigger);

// Split text into words
const textSplit = SplitText.create(".split-text", {
  type: "words",
});

// Animate each word
gsap.to(textSplit.words, {
  color: "#faeade",     // Change to light color
  stagger: 1,           // 1s delay between each word
  scrollTrigger: {
    trigger: ".text-section",
    start: "top center",
    end: "30% center",
    scrub: true,
  },
});
</script>
\`\`\`

## 5. Horizontal Scroll + Pin
Create horizontal scrolling sections.

\`\`\`html
<section class="horizontal-section h-screen overflow-hidden">
  <div class="slider-container flex gap-8 h-full items-center">
    <div class="slide min-w-screen h-96 bg-red-500 flex items-center justify-center">
      <h2 class="text-6xl font-serif text-white">Slide 1</h2>
    </div>
    <div class="slide min-w-screen h-96 bg-blue-500 flex items-center justify-center">
      <h2 class="text-6xl font-serif text-white">Slide 2</h2>
    </div>
    <div class="slide min-w-screen h-96 bg-green-500 flex items-center justify-center">
      <h2 class="text-6xl font-serif text-white">Slide 3</h2>
    </div>
  </div>
</section>

<script>
gsap.registerPlugin(ScrollTrigger);

const slider = document.querySelector(".slider-container");
const scrollAmount = slider.scrollWidth - window.innerWidth;

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".horizontal-section",
    start: "2% top",
    end: \`+=\${scrollAmount + 1500}px\`,
    scrub: true,
    pin: true,  // Pin the section while scrolling
  }
});

tl.to(".horizontal-section", {
  x: \`-\${scrollAmount + 1500}px\`,  // Move left
});
</script>
\`\`\`

## 6. ClipPath Sequential Reveal
Reveal elements one by one using clip-path.

\`\`\`html
<section class="benefit-section h-screen bg-white flex flex-col items-center justify-center gap-4">
  <h2 class="title first-title text-6xl font-serif" style="clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%);">
    First Benefit
  </h2>
  <h2 class="title second-title text-6xl font-serif" style="clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%);">
    Second Benefit
  </h2>
  <h2 class="title third-title text-6xl font-serif" style="clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%);">
    Third Benefit
  </h2>
  <h2 class="title fourth-title text-6xl font-serif" style="clip-path: polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%);">
    Fourth Benefit
  </h2>
</section>

<script>
gsap.registerPlugin(ScrollTrigger);

const revealTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".benefit-section",
    start: "top 60%",
    end: "top top",
    scrub: 1.5,
  }
});

revealTl
  .to(".first-title", { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" })
  .to(".second-title", { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" })
  .to(".third-title", { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" })
  .to(".fourth-title", { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" });
</script>
\`\`\`

## 7. Circular ClipPath Expansion
Expand a circle from center to full screen.

\`\`\`html
<section class="circle-section h-screen bg-black flex items-center justify-center">
  <div class="circle-box w-full h-full bg-white flex items-center justify-center"
       style="clip-path: circle(6% at 50% 50%);">
    <h2 class="text-6xl font-serif">Watch it grow</h2>
  </div>
</section>

<script>
gsap.registerPlugin(ScrollTrigger);

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".circle-section",
    start: "-15% top",
    end: "200% top",
    scrub: 1.5,
    pin: true,
  }
});

tl.to(".circle-box", {
  clipPath: "circle(100% at 50% 50%)",
  // Initial: circle(6% at 50% 50%)
  // Final: circle(100% at 50% 50%)
});
</script>
\`\`\`

## 8. Curtain Effect (Layer Overlay)
Create layered sections that slide over each other.

\`\`\`html
<!-- Bottom layer (gets pinned) -->
<section class="bottom-section h-screen bg-blue-500 flex items-center justify-center">
  <h2 class="text-6xl font-serif text-white">Bottom Layer</h2>
</section>

<!-- Top layer (slides over) -->
<section class="top-section h-screen bg-white flex items-center justify-center">
  <h2 class="text-6xl font-serif">Top Layer</h2>
</section>

<script>
gsap.registerPlugin(ScrollTrigger);

// Pull top layer up initially
gsap.set(".top-section", {
  marginTop: "-140vh",  // Pull up by 140vh
});

// Pin bottom layer while top layer slides over
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".bottom-section",
    start: "-15% top",
    end: "200% top",
    pin: true,  // Pin the section
  }
});
</script>
\`\`\`

## 9. Stacked Cards Reveal + Pin
Cards slide up sequentially and stack.

\`\`\`html
<section class="cards-section h-screen bg-gray-100 flex items-center justify-center gap-8">
  <div class="card w-80 h-96 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
    <p class="text-2xl font-serif">Card 1</p>
  </div>
  <div class="card w-80 h-96 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
    <p class="text-2xl font-serif">Card 2</p>
  </div>
  <div class="card w-80 h-96 bg-white rounded-3xl shadow-2xl flex items-center justify-center">
    <p class="text-2xl font-serif">Card 3</p>
  </div>
</section>

<script>
gsap.registerPlugin(ScrollTrigger);

const pinTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".cards-section",
    start: "10% top",
    end: "200% top",
    scrub: 1.5,
    pin: true,  // Pin the section
  }
});

pinTl.from(".card", {
  yPercent: 150,        // Start 150% below
  stagger: 0.2,         // 0.2s delay between each card
  ease: "power1.inOut"
});
</script>
\`\`\`
</GSAP ANIMATION PATTERNS>`;
