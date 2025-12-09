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
    componentPath: "templates/components/gradient-hero.tsx",
  },
  {
    id: "pixel-shader",
    name: "Pixel Shader",
    thumbnail: "/templates/thumbnails/pixel-shader.png",
    componentPath: "templates/components/pixel-shader.tsx",
  },
  {
    id: "cosmic-typography",
    name: "Cosmic Typography",
    thumbnail: "/templates/thumbnails/cosmic-typography.png",
    componentPath: "templates/components/cosmic-typography.tsx",
  },
  {
    id: "wireframe-sphere",
    name: "Wireframe Sphere",
    thumbnail: "/templates/thumbnails/wireframe-sphere.png",
    componentPath: "templates/components/wireframe-sphere.tsx",
  },
];
