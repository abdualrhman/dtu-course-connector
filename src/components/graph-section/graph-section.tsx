import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
import setupCy from "../../utils/setupCy";
import { Popover } from "react-bootstrap";
import CoursePopoverContent from "./course-popover";
import { CourseDetail, Graph } from "../../types";
import { getCourseByCode } from "../../utils/get-course-by-code";

export default function GraphComponent({ graph }: { graph: Graph }) {
  setupCy();

  const graphRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [showPopover, setShowPopover] = useState(false);
  const [popoverContent, setPopoverContent] = useState<JSX.Element | null>(
    null
  );
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

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
      if (courseDetail) {
        setPopoverContent(<CoursePopoverContent courseDetail={courseDetail} />);
        setPopoverPosition(getPopoverPosition(event));
        setShowPopover(true);
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

  const getPopoverPosition = (
    event: cytoscape.EventObject
  ): { top: number; left: number } => {
    const { clientX, clientY } = event.originalEvent as MouseEvent;
    const containerRect = graphRef.current?.getBoundingClientRect() || {
      top: 0,
      left: 0,
    };

    const zoom = cyRef.current?.zoom() || 1;
    const pan = cyRef.current?.pan() || { x: 0, y: 0 };

    return {
      top: (clientY - containerRect.top - pan.y) / zoom + window.scrollY,
      left: (clientX - containerRect.left - pan.x) / zoom + window.scrollX,
    };
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
        <Popover
          id="node-popover"
          style={{
            position: "absolute",
            top: popoverPosition.top,
            left: popoverPosition.left,
            zIndex: 1000,
            maxWidth: "250px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          }}
        >
          <Popover.Body>{popoverContent}</Popover.Body>
        </Popover>
      )}
    </div>
  );
}
