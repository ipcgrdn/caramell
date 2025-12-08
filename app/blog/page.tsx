import Link from "next/link";
import Image from "next/image";

import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";

import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog | Caramell",
  description: "Caramell Blog - Stories about AI landing page builder",
};

function ThumbnailPlaceholder() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Image
        src="/caramell.svg"
        alt="Caramell"
        width={48}
        height={48}
        className="opacity-75"
      />
    </div>
  );
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-[#2A2A2A] flex flex-col">
      <Navbar />

      <div className="flex-1 pt-32 pb-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-playfair text-[#F5EDE3] mb-4">
              Blog
            </h1>
            <p className="text-[#F5EDE3]/50 text-sm md:text-lg max-w-xl mx-auto">
              AI, design, and Caramell stories
            </p>
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#F5EDE3]/50 text-lg">No posts yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group block"
                >
                  <article className="bg-[#F5EDE3] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1">
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      {post.thumbnail ? (
                        <Image
                          src={post.thumbnail}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <ThumbnailPlaceholder />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <time className="text-xs md:text-sm text-black/40">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                      <h2 className="text-lg md:text-xl font-semibold text-black mt-2 mb-2">
                        {post.title}
                      </h2>
                      <p className="text-black/60 text-xs md:text-sm line-clamp-2">
                        {post.description}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
