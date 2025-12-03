"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string | null;
  prompt: string;
  status: string;
  createdAt: string;
  files: JSON;
  screenshot: string | null;
}

export default function RecentProject() {
  const { userId, isLoaded } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchProjects();
    }
  }, [userId, isLoaded]);

  const fetchProjects = async () => {
    try {
      // Fetch 6 recent projects by default
      const response = await fetch("/api/projects/recent?limit=8");
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const getProjectThumbnail = (project: Project) => {
    // Use screenshot if available
    if (project.screenshot) {
      return project.screenshot;
    }
    return null;
  };

  if (!userId) {
    return null;
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="max-w-8xl mx-auto px-8">
        <div className="bg-black/50 rounded-4xl p-10 relative z-20 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-4xl font-playfair text-white">
              Recent
            </h2>
            <Link
              href="/project/workspace"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/project/${project.id}`}
                className="group"
              >
                <div className="bg-white/10 hover:bg-white/20 rounded-2xl overflow-hidden">
                  {/* Project Thumbnail */}
                  <div className="aspect-video relative overflow-hidden">
                    {getProjectThumbnail(project) ? (
                      <Image
                        src={getProjectThumbnail(project)!}
                        alt={project.name || "Project preview"}
                        className="w-full h-full object-cover"
                        width={500}
                        height={500}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-24 h-24 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Project Info */}
                  <div className="p-4">
                    <h3 className="text-white font-medium text-sm mb-2 line-clamp-1">
                      {project.name || "Untitled"}
                    </h3>
                    <p className="text-white/60 text-xs">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
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
