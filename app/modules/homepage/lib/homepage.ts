import { count, countDistinct, desc, eq, inArray } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "~/db/schema";
import {
  categories,
  courses,
  CourseStatus,
  lessons,
  modules,
  users,
} from "~/db/schema";

export type Db = BetterSQLite3Database<typeof schema>;

export const NEWEST_COURSE_LIMIT = 3;

export type NewestCourse = {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  instructorName: string;
  categoryName: string;
  lessonCount: number;
};

export type CatalogueTotals = {
  courses: number;
  categories: number;
  lessons: number;
};

export type Homepage = {
  newestCourses: NewestCourse[];
  totals: CatalogueTotals;
};

export function getHomepage(db: Db): Homepage {
  return {
    newestCourses: getNewestCourses(db),
    totals: getCatalogueTotals(db),
  };
}

function getNewestCourses(db: Db): NewestCourse[] {
  const rows = db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      coverImageUrl: courses.coverImageUrl,
      instructorName: users.name,
      categoryName: categories.name,
    })
    .from(courses)
    .innerJoin(users, eq(courses.instructorId, users.id))
    .innerJoin(categories, eq(courses.categoryId, categories.id))
    .where(eq(courses.status, CourseStatus.Published))
    .orderBy(desc(courses.createdAt), desc(courses.id))
    .limit(NEWEST_COURSE_LIMIT)
    .all();

  const lessonCounts = getLessonCounts(
    db,
    rows.map((row) => row.id)
  );
  return rows.map((row) => ({
    ...row,
    lessonCount: lessonCounts.get(row.id) ?? 0,
  }));
}

function getLessonCounts(db: Db, courseIds: number[]) {
  const rows = db
    .select({ courseId: modules.courseId, lessonCount: count(lessons.id) })
    .from(modules)
    .innerJoin(lessons, eq(lessons.moduleId, modules.id))
    .where(inArray(modules.courseId, courseIds))
    .groupBy(modules.courseId)
    .all();
  return new Map(rows.map((row) => [row.courseId, row.lessonCount]));
}

// Totals describe what a visitor can actually open, so they count Published
// courses only, and the categories and lessons those courses use.
function getCatalogueTotals(db: Db): CatalogueTotals {
  const published = eq(courses.status, CourseStatus.Published);

  const courseTotals = db
    .select({
      courses: count(courses.id),
      categories: countDistinct(courses.categoryId),
    })
    .from(courses)
    .where(published)
    .get();

  const lessonTotals = db
    .select({ lessons: count(lessons.id) })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(published)
    .get();

  return {
    courses: courseTotals?.courses ?? 0,
    categories: courseTotals?.categories ?? 0,
    lessons: lessonTotals?.lessons ?? 0,
  };
}
