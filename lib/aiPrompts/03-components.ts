export const COMPONENTS = `
<NAVBAR GUIDELINES>
- Fixed at the top (sticky or fixed)
- Transparent background initially
- High-contrast text
- Add background when scrolled (solid or backdrop blur)
- Full-width or floating layout
- iOS dock style navigation can be used
</NAVBAR GUIDELINES>

<HERO GUIDELINES>
Design Rules:
- NEVER use static CSS gradients (shader animations acceptable)
- Think editorial design with strong hierarchy
- Use intentional negative space

Background Options:
1. Template-based design (if [TEMPLATE] is provided, it takes HIGHEST PRIORITY - adapt and remix the template while preserving its core visual style, animations, and layout patterns)
2. Solid color (monochromatic background)
3. Full-bleed image
4. Neobrutalism (bold borders, hard shadows, high-contrast)
5. Shader-based gradient animation (fluid morphing colors using WebGL/canvas effects)
6. Particle field or matrix
7. Fluid interaction
8. Editorial typographic layout (magazine-inspired composition with oversized type treatments)
</HERO GUIDELINES>

<FEATURE GUIDELINES>
Design Rules:
- Use images.
- NEVER use icons. (Lucide, etc.)
- If icons needed: custom SVG only
- Maintain color harmony from Hero (complementary, analogous, triadic, monochromatic)

Layout Options:
1. Bento grid (asymmetric card grid)
2. Parallax scroll (opposing directions)
3. Scroll-linked reveal (sticky + progressive disclosure)
4. Infinite marquee (logo bands, testimonials)
</FEATURE GUIDELINES>

<FOOTER GUIDELINES>
- Oversized typography (display-level font sizes for maximum impact)
- Minimal content with strong visual impact
</FOOTER GUIDELINES>`;
