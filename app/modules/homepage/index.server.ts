import { db } from "~/db";
import { getHomepage, type Db } from "./lib/homepage";

export type {
  CatalogueTotals,
  Homepage,
  NewestCourse,
} from "./lib/homepage";
export { NEWEST_COURSE_LIMIT } from "./lib/homepage";

/**
 * The homepage's catalogue data bound to a database. The app uses
 * `homepage`; tests build their own against a test database.
 */
export function createHomepage(database: Db) {
  return {
    /**
     * The newest Published courses, with lesson counts, and totals for the
     * Published catalogue. Drafts and Archived courses never appear.
     */
    get() {
      return getHomepage(database);
    },
  };
}

// Pure so a route importing this only for its loader doesn't pull the
// database into the client bundle (see `~/db`).
export const homepage = /* @__PURE__ */ createHomepage(db);
