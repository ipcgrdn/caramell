export const unicornProjects = [
  { id: "1", projectId: "XfnBM8wj4vrCw2SSipMQ", width: 1440, height: 900 },
  { id: "2", projectId: "rvHlY7izbnEhEDAmOnKT", width: 1440, height: 900 },
  { id: "3", projectId: "MVXFHdEOh57XAZd9JAW6", width: 1440, height: 900 },
  { id: "4", projectId: "gnMn3UvZlIwfhnTGq6CK", width: 1440, height: 900 },
  { id: "5", projectId: "u6ZKaj3IjKQOBcVELJLg", width: 1440, height: 900 },
  { id: "6", projectId: "WIby1WpB1CR7KUhM8zbs", width: 1440, height: 900 },
  { id: "7", projectId: "UzzVllhEpITTX10qryWa", width: 1440, height: 900 },
  { id: "8", projectId: "jIrSJpfGyziqdVDyrKW3", width: 1440, height: 900 },
  { id: "9", projectId: "rInpFyN4WgrKWoRBb2ag", width: 1440, height: 900 },
  { id: "10", projectId: "dhikFuVKU3LiMaUWgK6L", width: 1440, height: 900 },
  { id: "11", projectId: "Za0dk2I8i8Vw2wKQRy0r", width: 1440, height: 900 },
  { id: "12", projectId: "S7ZK73YRAryhoqprqkP2", width: 800, height: 600 },
];

export const unicornProjectsMap = unicornProjects.reduce(
  (acc, project) => {
    acc[project.id] = {
      projectId: project.projectId,
      width: project.width,
      height: project.height,
    };
    return acc;
  },
  {} as Record<string, { projectId: string; width: number; height: number }>
);
