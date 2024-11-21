import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import setupCy from "../../utils/setupCy";
import CoursePopoverContent from "./course-popover";
import { CourseDetail, Graph } from "../../types";
import { getCourseByCode } from "../../utils/get-course-by-code";
import { useFloating, autoPlacement, offset } from "@floating-ui/react-dom";

export default function GraphComponent({ graph }: { graph: Graph }) {
  setupCy();

  const graphRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [showPopover, setShowPopover] = useState(false);
  const [popoverContent, setPopoverContent] = useState<JSX.Element | null>(
    null
  );
  const { refs, floatingStyles, update } = useFloating({
    placement: "top",
    middleware: [offset(10), autoPlacement()],
  });

  useEffect(() => {
    if (graphRef.current) {
      initializeCytoscape(graph, graphRef.current);
    }

    return () => {
      cyRef.current?.destroy();
      cyRef.current = null;
    };
  }, [graph]);

  useEffect(() => {
    const handleResize = () => setShowPopover(false);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!graphRef.current?.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const initializeCytoscape = (graphData: Graph, container: HTMLDivElement) => {
    if (cyRef.current) cyRef.current.destroy();

    cyRef.current = cytoscape({
      container,
      elements: graphData.elements,
      style: [
        {
          selector: "node",
          style: {
            label: "data(id)",
            "background-color": "#007bff",
            color: "#fff",
            "text-outline-width": 2,
            "text-outline-color": "#007bff",
            "border-width": 2,
            "font-size": "10px",
            "text-valign": "center",
            "text-halign": "center",
            width: "40px",
            height: "40px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#6c757d",
            "target-arrow-color": "#6c757d",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
        {
          selector: ":parent",
          style: {
            "background-opacity": 0.1,
            "border-width": 2,
            label: "One of the following",
          },
        },
      ],
      layout: { name: "klay" },
    });

    addClickEventListeners();
  };

  const addClickEventListeners = () => {
    cyRef.current?.on("tap", "node", handleNodeClick);
  };

  const handleNodeClick = async (event: cytoscape.EventObject) => {
    const node = event.target;
    const courseCode = node.data("id");

    if (courseCode.length < 7) {
      const courseDetail = await fetchCourseDetail(courseCode);
      setPopoverContent(<CoursePopoverContent courseDetail={courseDetail} />);
      setShowPopover(true);

      const targetElement = event.originalEvent.target as HTMLElement | null;
      if (targetElement) {
        refs.setReference(targetElement);
        update();
      }
    }
  };

  const fetchCourseDetail = async (
    courseCode: string
  ): Promise<CourseDetail | null> => {
    try {
      const response = getCourseByCode(courseCode);
      if ("message" in response) throw new Error("Failed to fetch course data");
      return response;
    } catch (error) {
      console.error("Error fetching course data:", error);
      return null;
    }
  };

  return (
    <div
      style={{
        position: "relative",
        marginTop: "1rem",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        padding: "1rem",
      }}
    >
      <div
        ref={graphRef}
        style={{ width: "100%", height: "70vh", borderRadius: "8px" }}
      ></div>

      {showPopover && (
        <div
          ref={(node) => {
            refs.floating.current = node;
          }}
          style={{
            ...floatingStyles,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            padding: "1rem",
            zIndex: 1000,
          }}
        >
          {popoverContent}
        </div>
      )}
    </div>
  );
}
