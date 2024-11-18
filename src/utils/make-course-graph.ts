import { DefaultResponse, CourseDetail, Graph } from "../types";
import courseData from "../data/courseData.json";

function getParentBranches(prereqsList: string[]): string[] {
  if (!prereqsList.length) return [];
  const list = prereqsList[0].split(".");
  if (list.length > 0 && list[list.length - 1] === "") list.pop();
  return list;
}

function extractCourseNumber(str: string): string[] {
  const courseNumberPattern = /\b\d{5}\b/g;
  return str.match(courseNumberPattern) || [];
}

function generateGraph(
  course: CourseDetail | undefined,
  graph: Graph,
  visited: Set<string>
) {
  const connectedNodes = new Set<string>();

  if (!course || visited.has(course.course_code)) return;
  visited.add(course.course_code);

  if (
    !graph.elements.nodes.some((node) => node.data.id === course.course_code)
  ) {
    graph.elements.nodes.push({ data: { id: course.course_code } });
  }

  const parentBranches = getParentBranches(course.prereqs);
  parentBranches.forEach((cPrereq) => {
    const parentCourseNumbers = extractCourseNumber(cPrereq);

    const parentChildrenMap = new Map<string, string[]>();

    parentCourseNumbers.forEach((courseNumber) => {
      if (visited.has(courseNumber)) return;

      const parentCourse = courseData.find(
        (course) => course.course_code === courseNumber
      );

      connectedNodes.add(course.course_code);
      connectedNodes.add(courseNumber);

      let parentName = parentCourseNumbers.length
        ? parentCourseNumbers.join("")
        : "";

      if (!parentChildrenMap.has(parentName)) {
        parentChildrenMap.set(parentName, []);
      }
      parentChildrenMap.get(parentName)?.push(courseNumber);

      if (parentChildrenMap.get(parentName)?.length === 1) {
        if (!graph.elements.nodes.some((node) => node.data.id === parentName)) {
          graph.elements.nodes.push({ data: { id: parentName } });
        }
      }

      graph.elements.nodes.push({
        data: {
          id: courseNumber,
          parent: parentName,
        },
      });
      const edgeData = {
        id: courseNumber + course.course_code,
        target: course.course_code,
        source: parentName || courseNumber,
      };
      if (
        !graph.elements.edges.some(
          (edge) =>
            edge.data.target === edgeData.target &&
            edge.data.source === edgeData.source
        )
      )
        graph.elements.edges.push({
          data: edgeData,
        });

      generateGraph(parentCourse, graph, visited);
    });

    Array.from(parentChildrenMap.entries()).forEach(
      ([parentName, children]) => {
        if (children.length === 0) {
          graph.elements.nodes = graph.elements.nodes.filter(
            (node) => node.data.id !== parentName
          );

          graph.elements.edges = graph.elements.edges.filter(
            (edge) =>
              edge.data.source !== parentName && edge.data.target !== parentName
          );
        }
      }
    );
  });
}

function getCourseGraph(course: CourseDetail): Graph {
  const graph: Graph = {
    elements: {
      nodes: [],
      edges: [],
    },
  };
  const visited = new Set<string>();
  generateGraph(course, graph, visited);
  return graph;
}

export function makeCourseGraph(courseNumber: string): DefaultResponse<Graph> {
  try {
    const findCourse = courseData.find(
      (course) => course.course_code === courseNumber
    );
    if (!findCourse) {
      return { success: false, message: "Course not found." };
    }
    const graph = getCourseGraph(findCourse);
    return { success: true, data: graph };
  } catch (error) {
    console.error("Error generating course graph:", error);
    return { success: false, message: "Internal Server Error." };
  }
}
