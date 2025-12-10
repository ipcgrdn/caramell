import Link from "next/link";
import { unicornProjects } from "@/app/test/unicorn-projects";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold mb-8">Unicorn Studio Preview</h1>
      <p className="text-gray-400 mb-4">
        각 버튼을 클릭하면 풀페이지로 확인할 수 있습니다
      </p>
      <div className="grid grid-cols-2 gap-4">
        {unicornProjects.map((project) => (
          <Link
            key={project.id}
            href={`/test/${project.id}`}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-center"
          >
            <div className="text-xl font-semibold">Project {project.id}</div>
            <div className="text-sm text-gray-400">
              {project.width} x {project.height}
            </div>
            <div className="text-xs text-gray-500 mt-1">{project.projectId}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
