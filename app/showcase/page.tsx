"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";

import Navbar from "@/components/sections/navbar";
import { MorphingSquare } from "@/components/ui/morphing-square";

interface ShowcaseProject {
  id: string;
  name: string | null;
  screenshot: string | null;
}

export default function ShowcasePage() {
  const [projects, setProjects] = useState<ShowcaseProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchProjects = useCallback(async (offset = 0) => {
    try {
      const response = await fetch(`/api/showcase?limit=12&offset=${offset}`);
      if (response.ok) {
        const data = await response.json();
        if (offset === 0) {
          setProjects(data.projects || []);
        } else {
          setProjects((prev) => [...prev, ...(data.projects || [])]);
        }
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Failed to fetch showcase projects:", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchProjects(0);
      setIsLoading(false);
    };
    init();
  }, [fetchProjects]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !isLoadingMore
        ) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, projects.length]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await fetchProjects(projects.length);
    setIsLoadingMore(false);
  };

  return (
    <div className="min-h-screen bg-[#6B4E36]">
      <Navbar />

      <div className="pt-28 md:pt-32 pb-20">
        <div className="max-w-8xl mx-auto">
          {/* Loading state */}
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <MorphingSquare />
            </div>
          ) : projects.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-32 mx-4 md:mx-8 rounded-4xl bg-[#F5EDE3]">
              <div className="w-16 h-16 mb-6 rounded-full bg-black/5 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-black/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-black mb-2">
                No projects yet
              </h2>
              <p className="text-black/60 mb-8 text-sm">
                Be the first to share your creation!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-black/80 transition-colors text-sm font-medium"
              >
                Create a Project
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          ) : (
            /* Projects grid */
            <>
              <div className="mx-0 md:mx-8 px-6 md:px-8 py-10 rounded-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-[#F5EDE3]">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/p/${project.id}`}
                    target="_blank"
                    className="group"
                  >
                    <div className="rounded-2xl overflow-hidden bg-black/10 hover:bg-black/20 transition-all duration-300">
                      {/* Thumbnail */}
                      <div className="aspect-video relative overflow-hidden">
                        {project.screenshot ? (
                          <Image
                            src={project.screenshot}
                            alt={project.name || "Project preview"}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                            width={600}
                            height={450}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-black/10"
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
                          <span className="inline-flex items-center text-white text-sm font-medium">
                            View Project
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center mt-12">
                  {isLoadingMore && (
                    <div className="relative">
                      <MorphingSquare />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
