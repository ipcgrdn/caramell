import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import ProjectView from "@/components/project/ProjectView";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect("/signin");
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    redirect("/signin");
  }

  // Get project
  const project = await prisma.project.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Project not found
          </h1>
          <a href="/" className="text-[#D4A574] hover:text-[#C68E52] underline">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return <ProjectView project={project} />;
}
