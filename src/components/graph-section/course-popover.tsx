import React from "react";
import { CourseDetail } from "../../types";

interface CoursePopoverContentProps {
  courseDetail: CourseDetail;
}

const CoursePopoverContent: React.FC<CoursePopoverContentProps> = ({
  courseDetail,
}) => {
  return (
    <div>
      <a
        href={`https://kurser.dtu.dk/course/${courseDetail.course_code}`}
        className="list-group-item list-group-item-action flex-column align-items-start"
      >
        <div className="d-flex w-100 justify-content-between">
          <h5 className="mb-1">{courseDetail.title}</h5>
        </div>
        <p className="mb-1">Prerequisites: {courseDetail.prereqs}</p>
        <small className="text-muted">ECTS: {courseDetail.ects}</small>
      </a>
    </div>
  );
};
export default CoursePopoverContent;
