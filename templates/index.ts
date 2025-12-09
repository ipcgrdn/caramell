export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  componentPath: string;
}

export const TEMPLATES: Template[] = [
  {
    id: "gradient-hero",
    name: "Gradient Hero",
    thumbnail: "/templates/thumbnails/gradient-hero.png",
    componentPath: "templates/components/gradient-hero.html",
  },
  {
    id: "pixel-shader",
    name: "Pixel Shader",
    thumbnail: "/templates/thumbnails/pixel-shader.png",
    componentPath: "templates/components/pixel-shader.html",
  },
  {
    id: "cosmic-typography",
    name: "Cosmic Typography",
    thumbnail: "/templates/thumbnails/cosmic-typography.png",
    componentPath: "templates/components/cosmic-typography.html",
  },
  {
    id: "wireframe-sphere",
    name: "Wireframe Sphere",
    thumbnail: "/templates/thumbnails/wireframe-sphere.png",
    componentPath: "templates/components/wireframe-sphere.html",
  },
  {
    id: "parallax-hero",
    name: "Parallax Hero",
    thumbnail: "/templates/thumbnails/parallax-hero.png",
    componentPath: "templates/components/parallax-hero.html",
  },
  {
    id: "neo-brutalism",
    name: "Neo Brutalism",
    thumbnail: "/templates/thumbnails/neo-brutalism.png",
    componentPath: "templates/components/neo-brutalism.html",
  },
];
