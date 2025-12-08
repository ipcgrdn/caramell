import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Caramell",
    };
  }

  return {
    title: `${post.title} | Caramell`,
    description: post.description,
  };
}

function ThumbnailPlaceholder() {
  return (
    <div className="absolute inset-0 bg-[#EEE6DD] flex items-center justify-center">
      <Image
        src="/caramell.svg"
        alt="Caramell"
        width={64}
        height={64}
        className="opacity-75"
      />
    </div>
  );
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#2A2A2A] flex flex-col">
      <Navbar />

      <article className="flex-1 pt-32 pb-24 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#F5EDE3]/60 hover:text-[#F5EDE3] transition-colors mb-6"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="mt-0.5">Back</span>
          </Link>

          {/* Header */}
          <header className="mb-12">
            <time className="text-[#D4A574] text-sm">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            <h1 className="text-3xl md:text-5xl font-playfair text-[#F5EDE3] mt-3 mb-4">
              {post.title}
            </h1>
            <p className="text-[#F5EDE3]/60 text-sm md:text-lg">
              {post.description}
            </p>
          </header>

          {/* Thumbnail */}
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-12">
            {post.thumbnail ? (
              <Image
                src={post.thumbnail}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <ThumbnailPlaceholder />
            )}
          </div>

          {/* Content */}
          <div className="prose prose-lg prose-invert max-w-none prose-headings:font-playfair prose-headings:text-[#F5EDE3] prose-p:text-[#F5EDE3]/80 prose-a:text-[#D4A574] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#F5EDE3] prose-code:text-[#D4A574] prose-code:bg-black/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 prose-blockquote:border-l-[#D4A574] prose-blockquote:text-[#F5EDE3]/70">
            <MDXRemote source={post.content} />
          </div>
        </div>
      </article>
    </div>
  );
}
