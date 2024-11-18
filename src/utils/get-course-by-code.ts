import courseData from "../data/courseData.json";
import { CourseDetail } from "../types";

interface ErrorResponse {
  message: string;
}

type GetCourseResponse = CourseDetail | ErrorResponse;

export function getCourseByCode(code: string | undefined): GetCourseResponse {
  if (!code) {
    return { message: "Course code is required" };
  }

  const course = courseData.find((course) => course.course_code === code);

  if (!course) {
    return { message: "Course not found" };
  }

  return course;
}
