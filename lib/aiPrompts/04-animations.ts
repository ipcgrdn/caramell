export const ANIMATIONS = `
<ANIMATION SYSTEM>
<selection-instruction priority="critical">
Below are GSAP animation OPTIONS you can use.
Select MULTIPLE animations that complement each other and fit the design.
At minimum, use 2-3 animation patterns throughout the page.
These are tools in your toolkit - combine them creatively.
</selection-instruction>

<core-rules priority="critical">
- Animate elements when they enter viewport (fade in, slide in, blur in)
- Use 'both' instead of 'forwards' for animation-fill-mode
- Don't use opacity: 0 as initial state
- Adjust duration, stagger, ease based on design needs
</core-rules>

<ANIMATION OPTIONS>

## Option 1: ScrollSmoother
Smooth page scrolling effect.
Plugin: unpkg.com/gsap@3/dist/ScrollSmoother.min.js
Structure: #smooth-wrapper > #smooth-content (all content inside)
ScrollSmoother.create({ smooth: 1-10, effects: true })

## Option 2: Timeline
Chain animations sequentially.
const tl = gsap.timeline()
tl.to(el1, {...}).to(el2, {...}, "-=0.5").from(el3, {...})
Position: "-=0.5" overlap, "+=0.5" gap, "<" with prev start

## Option 3: ScrollTrigger
Scroll-based animation trigger.
gsap.timeline({ scrollTrigger: { trigger, start, end, scrub, pin } }).to(...)
start/end: "top center", "bottom top", "1% top", "+=500px"
scrub: true or number(smoothing), pin: true to fix element

## Option 4: SplitText
Word/character animation.
Plugin: unpkg.com/gsap@3/dist/SplitText.min.js
const split = SplitText.create(".text", { type: "words" })
gsap.to(split.words, { color: "#fff", stagger: 0.1, scrollTrigger: {...} })

## Option 5: Horizontal Scroll
Horizontal scrolling section.
const scrollAmount = container.scrollWidth - window.innerWidth
Pin section, animate x: -scrollAmount, end: +=scrollAmount

## Option 6: ClipPath Reveal
Reveal elements with clip-path animations.
Polygon wipe: "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)" → "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
Circle expand: "circle(6% at 50% 50%)" → "circle(100% at 50% 50%)"
Set initial in style attr, animate clipPath property

## Option 7: Curtain Effect
Section slides over another section.
gsap.set(".top-section", { marginTop: "-100vh" })
Pin bottom section, top slides over naturally

## Option 8: Stacked Cards
Cards stack on top of each other while scrolling.
from({ yPercent: 150, stagger: 0.2 }) with pin + scrub

</ANIMATION OPTIONS>
</ANIMATION SYSTEM>`;
