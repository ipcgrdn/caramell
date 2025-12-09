"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ShowcaseProject {
  id: string;
  name: string | null;
  screenshot: string | null;
}

export default function Showcase() {
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShowcaseProjects();
  }, []);

  const fetchShowcaseProjects = async () => {
    try {
      const response = await fetch("/api/showcase?limit=12");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch showcase projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="max-w-8xl mx-auto px-0 md:px-8">
          <div className="bg-black/50 backdrop-blur-lg rounded-4xl p-10 relative z-20 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-4xl font-playfair text-white">
                Showcase
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white/10 rounded-2xl overflow-hidden">
                    <div className="aspect-4/3 bg-white/5" />
                    <div className="p-4">
                      <div className="h-4 bg-white/10 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="max-w-8xl mx-auto px-0 md:px-8">
        <div className="bg-black/50 backdrop-blur-lg rounded-4xl p-10 relative">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-4xl font-playfair text-white">
              Showcase
            </h2>
            <Link
              href="/showcase"
              className="group flex gap-2 text-white/70 hover:text-white transition-colors"
            >
              <span className="text-sm font-medium">View All</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/p/${project.id}`}
                target="_blank"
                className="group"
              >
                <div className="bg-white/10 hover:bg-white/20 rounded-2xl overflow-hidden">
                  {/* Project Thumbnail */}
                  <div className="aspect-video relative overflow-hidden">
                    {project.screenshot ? (
                      <Image
                        src={project.screenshot}
                        alt={project.name || "Project preview"}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        width={500}
                        height={500}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/10">
                        <svg
                          className="w-16 h-16 text-white/20"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="inline-flex items-center text-white text-sm">
                        View Project
                      </span>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="hidden p-4">
                    <h3 className="text-white font-medium text-base line-clamp-1">
                      {project.name || "Untitled"}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
