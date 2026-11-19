import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, seedBaseData, type TestDb } from "~/test/setup";
import * as schema from "~/db/schema";
import { CourseStatus } from "~/db/schema";
import { markdown } from "~/lib/text";
import { createHomepage, NEWEST_COURSE_LIMIT } from "../index.server";

let db: TestDb;
let instructorId: number;
let categoryId: number;
let baseCourseId: number;

beforeEach(() => {
  db = createTestDb();
  const base = seedBaseData(db);
  instructorId = base.instructor.id;
  categoryId = base.category.id;
  baseCourseId = base.course.id;
});

// ─── Fixtures ───
// The homepage only reads; nothing in it writes courses, modules or lessons,
// so rows go in directly. Kept in one place so a schema change touches only
// this block.

let slugCounter = 0;

function addCategory(name: string) {
  return db
    .insert(schema.categories)
    .values({ name, slug: name.toLowerCase() })
    .returning()
    .get().id;
}

function addCourse(
  title: string,
  options: {
    status?: CourseStatus;
    createdAt?: string;
    categoryId?: number;
  } = {}
) {
  slugCounter += 1;
  return db
    .insert(schema.courses)
    .values({
      title,
      slug: `course-${slugCounter}`,
      description: `About ${title}`,
      salesCopy: markdown(title),
      instructorId,
      categoryId: options.categoryId ?? categoryId,
      status: options.status ?? CourseStatus.Published,
      ...(options.createdAt ? { createdAt: options.createdAt } : {}),
    })
    .returning()
    .get().id;
}

function addLessons(courseId: number, perModule: number[]) {
  perModule.forEach((lessonCount, moduleIndex) => {
    const moduleId = db
      .insert(schema.modules)
      .values({
        courseId,
        title: `Module ${moduleIndex}`,
        position: moduleIndex,
      })
      .returning()
      .get().id;
    for (let i = 0; i < lessonCount; i++) {
      db.insert(schema.lessons)
        .values({ moduleId, title: `Lesson ${i}`, position: i })
        .run();
    }
  });
}

function get() {
  return createHomepage(db).get();
}

// The base course has no explicit createdAt; pin it so ordering is exact.
function pinBaseCourse(createdAt: string) {
  db.update(schema.courses).set({ createdAt }).run();
}

describe("newest courses", () => {
  it("lists Published courses newest first, at most three", () => {
    pinBaseCourse("2026-01-01T00:00:00.000Z");
    addCourse("February", { createdAt: "2026-02-01T00:00:00.000Z" });
    addCourse("April", { createdAt: "2026-04-01T00:00:00.000Z" });
    addCourse("March", { createdAt: "2026-03-01T00:00:00.000Z" });

    const titles = get().newestCourses.map((course) => course.title);

    expect(NEWEST_COURSE_LIMIT).toBe(3);
    expect(titles).toEqual(["April", "March", "February"]);
  });

  it("leaves out Draft and Archived courses", () => {
    pinBaseCourse("2026-01-01T00:00:00.000Z");
    addCourse("Draft", {
      status: CourseStatus.Draft,
      createdAt: "2026-05-01T00:00:00.000Z",
    });
    addCourse("Archived", {
      status: CourseStatus.Archived,
      createdAt: "2026-05-02T00:00:00.000Z",
    });

    const titles = get().newestCourses.map((course) => course.title);

    expect(titles).toEqual(["Test Course"]);
  });

  it("carries the instructor, category and card fields", () => {
    const [course] = get().newestCourses;

    expect(course).toEqual({
      id: baseCourseId,
      title: "Test Course",
      slug: "test-course",
      description: "A test course",
      coverImageUrl: null,
      instructorName: "Test Instructor",
      categoryName: "Programming",
      lessonCount: 0,
    });
  });

  it("counts every lesson in every module of each course", () => {
    pinBaseCourse("2026-01-01T00:00:00.000Z");
    const other = addCourse("Other", { createdAt: "2026-02-01T00:00:00.000Z" });
    addLessons(baseCourseId, [2, 3]);
    addLessons(other, [1]);

    const counts = Object.fromEntries(
      get().newestCourses.map((course) => [course.title, course.lessonCount])
    );

    expect(counts).toEqual({ "Test Course": 5, Other: 1 });
  });

  it("is empty when nothing is Published", () => {
    db.update(schema.courses).set({ status: CourseStatus.Draft }).run();

    expect(get()).toEqual({
      newestCourses: [],
      totals: { courses: 0, categories: 0, lessons: 0 },
    });
  });
});

describe("catalogue totals", () => {
  it("counts Published courses, their categories and their lessons", () => {
    const design = addCategory("Design");
    const unused = addCategory("Unused");
    const designCourse = addCourse("Design", { categoryId: design });
    addCourse("Second programming");
    const draft = addCourse("Draft", {
      status: CourseStatus.Draft,
      categoryId: unused,
    });
    addLessons(baseCourseId, [2]);
    addLessons(designCourse, [1, 1]);
    addLessons(draft, [4]);

    expect(get().totals).toEqual({ courses: 3, categories: 2, lessons: 4 });
  });

  it("counts beyond the three courses shown", () => {
    for (let i = 0; i < 5; i++) addCourse(`Course ${i}`);

    const page = get();

    expect(page.newestCourses).toHaveLength(3);
    expect(page.totals.courses).toBe(6);
  });
});
