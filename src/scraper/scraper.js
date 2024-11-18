const fs = require("fs").promises;
const playwright = require("playwright");
const courseNumbers = require("../data/courseNumbers.json");
const cf = require("../data/courses_full.json");

async function getCourseData(courseNumber) {
  const url = `https://kurser.dtu.dk/course/${courseNumber}`;
  const browser = await playwright.chromium.launch({ headless: true });

  const context = await browser.newContext();
  await context.addCookies([
    {
      name: "ASP.NET_SessionId",
      value: "czmax0zoyr4dwh1fu3qzq5bq",
      domain: "kurser.dtu.dk",
      path: "/",
    },
    {
      name: "{DTUCoursesPublicLanguage}",
      value: "en-GB",
      domain: "kurser.dtu.dk",
      path: "/",
    },
  ]);
  const page = await context.newPage();

  await page.goto(url);

  const courseData = await page.evaluate(() => {
    function getTextByLabel(labelText) {
      const labels = Array.from(document.querySelectorAll("label"));
      const label = labels.find((l) => l.textContent.trim() === labelText);
      return label
        ? label.parentElement.nextElementSibling.innerText.trim()
        : "";
    }

    // Extract academic prerequisites
    const prereqs = getTextByLabel("Academic prerequisites");

    // Extract course code from navigation tabs
    const courseCode =
      document
        .querySelector(".nav.nav-tabs.hidden-print li.active a")
        ?.innerText.trim() || "";

    // Extract ECTS points
    const ects = getTextByLabel("Point( ECTS )");

    // Extract course title from the main h2 element
    const title = document.querySelector("h2")?.innerText.trim() || "";

    // Extract language of instruction
    const language = getTextByLabel("Language of instruction");

    return {
      prereqs: [prereqs],
      course_code: courseCode,
      ects,
      title,
      lang: language === "English" ? "en-GB" : "da-DK",
    };
  });
  await browser.close();
  return courseData;
}

async function fetchAndSaveCourseData(courseNumbers) {
  const allCourseData = [];
  let i = 0;
  for (const courseNumber of courseNumbers) {
    console.log(i);
    try {
      const courseData = await getCourseData(courseNumber);
      allCourseData.push(courseData);
    } catch (error) {
      console.error(`Failed to fetch data for course ${courseNumber}:`, error);
    }
    i++;
  }

  try {
    await fs.writeFile(
      "../data/courseData.json",
      JSON.stringify(allCourseData, null, 2)
    );
    console.log("Course data has been saved to courseData.json");
  } catch (error) {
    console.error("Failed to write course data to file:", error);
  }
}

(async () => {
  await fetchAndSaveCourseData(courseNumbers);
})();
