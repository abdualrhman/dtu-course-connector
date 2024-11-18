import { useState } from "react";
import type { Graph } from "./types";
import GraphComponent from "./components/graph-section/graph-section";
import { makeCourseGraph } from "./utils/make-course-graph";

export default function App() {
  const [courseNumber, setCourseNumber] = useState("01257");
  const [courseGraph, setCourseGraph] = useState<Graph | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = makeCourseGraph(courseNumber);
      if (response?.data) {
        setCourseGraph(response.data);
        setErrorMessage("");
      } else {
        throw new Error("Course not found");
      }
    } catch (error) {
      setCourseGraph(null);
      setErrorMessage("Course not found! Please enter a valid course number.");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        DTU Course Dependency Graph
      </h2>
      <div
        style={{
          margin: "0 auto",
          padding: "1.5rem",
          maxWidth: "600px",
          backgroundColor: "#f8f9fa",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p>
          Many DTU courses have extensive prerequisite lists, each with its own
          dependencies, making study program planning challenging. Use this tool
          to explore the prerequisite paths for any selected course.
        </p>
        <p>
          Enter a course number to visualize a graphical representation of the
          course’s prerequisites and related courses.
        </p>
        <p>Click on each node for course details.</p>
        <form style={{ marginTop: "1rem" }}>
          <div className="form-group">
            <label
              htmlFor="courseInput"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                fontWeight: "bold",
              }}
            >
              Enter Course Number
            </label>
            <input
              type="text"
              id="courseInput"
              className="form-control"
              placeholder="e.g., 01035"
              value={courseNumber}
              onChange={(e) => setCourseNumber(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                fontSize: "1rem",
                borderRadius: "5px",
                border: "1px solid #ced4da",
                marginBottom: "1rem",
              }}
            />
          </div>
          <button
            onClick={submitHandler}
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "0.75rem",
              fontSize: "1rem",
              fontWeight: "bold",
              backgroundColor: "#007bff",
              border: "none",
              borderRadius: "5px",
              color: "#fff",
            }}
          >
            Search
          </button>
        </form>
        <div style={{ marginTop: "2rem" }}>
          {errorMessage && (
            <p style={{ color: "red", textAlign: "center" }}>{errorMessage}</p>
          )}
          {courseGraph && (
            <div style={{ marginTop: "2rem" }}>
              <GraphComponent graph={courseGraph} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
