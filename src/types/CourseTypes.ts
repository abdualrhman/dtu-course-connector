export type CourseDetail = {
  course_id?: string | null;
  prereqs: string[];
  course_code: string;
  ects: string;
  title: string;
  lang: string;
};
