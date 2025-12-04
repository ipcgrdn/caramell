"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/sections/navbar";
import { MorphingSquare } from "@/components/ui/morphing-square";

interface Project {
  id: string;
  name: string | null;
  prompt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  files: JSON;
  screenshot: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function WorkspacePage() {
  const { userId, isLoaded } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const menuRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Initial fetch
  useEffect(() => {
    if (isLoaded && userId) {
      setProjects([]);
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchProjects(1, true);
    }
  }, [userId, isLoaded, search, order]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreProjects();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, pagination.page]);

  const fetchProjects = async (page: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        sortBy: "createdAt",
        order,
        ...(search && { search }),
      });

      const response = await fetch(`/api/projects/manage?${params}`);
      if (response.ok) {
        const data = await response.json();

        if (reset) {
          setProjects(data.projects || []);
        } else {
          setProjects((prev) => [...prev, ...(data.projects || [])]);
        }

        setPagination(data.pagination);
        setHasMore(data.pagination.page < data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreProjects = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchProjects(pagination.page + 1, false);
    }
  }, [pagination.page, pagination.totalPages]);

  const handleRename = async (id: string, newName: string) => {
    if (!newName.trim()) return;

    try {
      const response = await fetch("/api/projects/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: newName }),
      });

      if (response.ok) {
        setProjects(
          projects.map((p) => (p.id === id ? { ...p, name: newName } : p))
        );
        setEditingId(null);
      }
    } catch (error) {
      console.error("Failed to rename project:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch("/api/projects/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== id));
        setDeleteConfirmId(null);
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setEditingName(project.name || "Untitled");
    setOpenMenuId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName("");
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const toggleSortOrder = () => {
    setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#6B4E36]">
      <Navbar />

      <div className="pt-28 md:pt-32 pb-20">
        <div className="max-w-8xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 md:gap-4 max-w-4xl mx-auto mb-12 px-4">
            {/* Search Bar */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-4 h-4 md:h-5 md:w-5 text-black/60 group-focus-within:text-black transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search your project"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-2 md:py-4 bg-[#F5EDE3] rounded-2xl text-sm text-black placeholder-black/60 focus:outline-none"
              />
            </div>

            {/* Sort Button */}
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-2 px-4 py-2 md:py-4 bg-[#F5EDE3] rounded-2xl text-black/80 hover:text-black"
            >
              <span className="text-sm font-medium">Date</span>
              {order === "asc" ? (
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
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Projects Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <MorphingSquare />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 mx-8 rounded-4xl bg-[#F5EDE3]">
              <h3 className="text-lg font-semibold text-black mb-2">
                No projects found
              </h3>
              <p className="text-black/60 text-sm">
                Create a new project to get started
              </p>
            </div>
          ) : (
            <>
              <div className="mx-0 md:mx-8 px-6 md:px-8 py-10 rounded-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-[#F5EDE3]">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="group relative rounded-2xl overflow-hidden bg-white/30 hover:bg-black/10 transition-all duration-300"
                  >
                    {/* Three Dots Menu */}
                    <div
                      className="absolute top-4 right-4 z-20"
                      ref={openMenuId === project.id ? menuRef : null}
                    >
                      <button
                        onClick={() => toggleMenu(project.id)}
                        className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === project.id && (
                        <div className="absolute right-0 w-36 rounded-2xl bg-white/90 backdrop-blur-md border border-black/15 overflow-hidden z-30 shadow-lg">
                          <button
                            onClick={() => startEditing(project)}
                            className="w-full px-4 py-3 text-left text-black/80 hover:bg-black/5 hover:text-black transition-colors flex items-center gap-3 text-sm font-medium"
                          >
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Rename
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirmId(project.id);
                              setOpenMenuId(null);
                            }}
                            className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-3 text-sm font-medium"
                          >
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Project Link */}
                    <Link href={`/project/${project.id}`}>
                      <div className="aspect-video relative overflow-hidden">
                        {project.screenshot ? (
                          <Image
                            src={project.screenshot}
                            alt={project.name || "Project preview"}
                            className="w-full h-full object-cover"
                            width={600}
                            height={450}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              className="w-12 h-12 text-white/10"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Project Info */}
                    <div className="p-4">
                      {editingId === project.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleRename(project.id, editingName);
                              } else if (e.key === "Escape") {
                                cancelEditing();
                              }
                            }}
                            className="w-full px-3 py-2 bg-white/80 border border-black/20 rounded-xl text-black text-sm font-medium placeholder-black/40 focus:outline-none focus:border-black/50 focus:bg-white transition-all"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={cancelEditing}
                              className="flex-1 px-3 py-2 bg-white/60 hover:bg-white/80 border border-black/15 rounded-xl text-black/70 hover:text-black text-xs font-semibold transition-all duration-200"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() =>
                                handleRename(project.id, editingName)
                              }
                              className="flex-1 px-3 py-2 bg-black/90 hover:bg-black border border-black rounded-xl text-white text-xs font-semibold transition-all duration-200"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-sm text-black mb-2 line-clamp-1">
                            {project.name || "Untitled"}
                          </h3>
                          <p className="text-black/60 text-xs">
                            {new Date(project.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Infinite Scroll Trigger */}
              {hasMore && (
                <div ref={observerTarget} className="flex justify-center mt-12">
                  {loadingMore && (
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-neutral-900/95 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-2xl font-playfair text-white mb-4 text-center">
              Delete Project
            </h3>
            <p className="text-white/60 mb-8 text-center text-sm leading-relaxed">
              This action cannot be undone.
              <br />
              All project data will be permanently deleted.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all duration-300 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-all duration-300 font-medium text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
