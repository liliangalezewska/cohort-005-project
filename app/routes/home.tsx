import { Link } from "react-router";
import { useState, useEffect, type ReactNode } from "react";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  Layers,
  ArrowRight,
  User,
  Moon,
  Sun,
} from "lucide-react";
import { CourseImage } from "~/components/course-image";
import { DevUI } from "~/components/dev-ui";
import { getCurrentUserId, getDevCountry } from "~/lib/session";
import { getCountryTierInfo, COUNTRIES } from "~/lib/ppp";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { users } from "~/db/schema";
import { homepage } from "~/modules/homepage/index.server";

function getAllUsers() {
  return db.select().from(users).all();
}

function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export function meta() {
  return [
    { title: "Cadence — Learn at your own pace" },
    {
      name: "description",
      content:
        "Structured online courses from experienced instructors. Browse courses, track your progress, and learn at your own pace.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { newestCourses, totals } = homepage.get();
  const users = getAllUsers();
  const currentUserId = await getCurrentUserId(request);
  const currentUser = currentUserId ? getUserById(currentUserId) : null;
  const devCountry = await getDevCountry(request);
  const countryTierInfo = getCountryTierInfo(devCountry);

  return {
    newestCourses,
    totals,
    users: users.map((u) => ({ id: u.id, name: u.name, role: u.role })),
    currentUser: currentUser
      ? { id: currentUser.id, name: currentUser.name, role: currentUser.role }
      : null,
    devCountry,
    countryTierInfo,
    countries: COUNTRIES,
  };
}

function CatalogueTotal({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) {
  return (
    <li className="flex items-center gap-4 px-6 py-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        {icon}
      </div>
      <p className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </p>
    </li>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    newestCourses,
    totals,
    users,
    currentUser,
    devCountry,
    countryTierInfo,
    countries,
  } = loaderData;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("cadence-theme", next ? "dark" : "light");
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Cadence
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/courses"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Courses
            </Link>
            <button
              onClick={toggleDarkMode}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
            {currentUser ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log In
                </Link>
                <Button asChild size="sm">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-[3fr_2fr]">
          <div>
            <p className="text-sm font-medium text-primary">
              Online courses from experienced instructors
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
              Build real skills,
              <br />
              <span className="text-muted-foreground">at your own pace.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Structured courses you work through lesson by lesson. Check
              yourself with quizzes, and pick up where you left off.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link to="/courses">
                  Browse courses
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              {currentUser ? (
                <Button asChild size="lg" variant="outline">
                  <Link to="/dashboard">Go to your dashboard</Link>
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline">
                  <Link to="/signup">Create a free account</Link>
                </Button>
              )}
            </div>
          </div>

          <ul
            aria-label="The catalogue"
            className="divide-y divide-border rounded-xl border border-border bg-muted/50"
          >
            <CatalogueTotal
              icon={<BookOpen className="size-5 text-primary" />}
              value={totals.courses}
              label={totals.courses === 1 ? "course" : "courses"}
            />
            <CatalogueTotal
              icon={<Layers className="size-5 text-primary" />}
              value={totals.lessons}
              label={totals.lessons === 1 ? "lesson" : "lessons"}
            />
            <CatalogueTotal
              icon={<GraduationCap className="size-5 text-primary" />}
              value={totals.categories}
              label={totals.categories === 1 ? "category" : "categories"}
            />
          </ul>
        </section>

        {newestCourses.length > 0 && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-6xl px-6 py-20">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    New courses
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    The latest courses from our instructors
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/courses">
                    View all courses
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {newestCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.slug}`}
                    className="group"
                  >
                    <Card className="h-full overflow-hidden pt-0 transition-shadow group-hover:shadow-md">
                      <CourseImage
                        src={course.coverImageUrl}
                        alt={course.title}
                        className="aspect-video w-full object-cover"
                      />
                      <CardHeader>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {course.categoryName}
                        </p>
                        <h3 className="font-semibold leading-snug group-hover:text-primary">
                          {course.title}
                        </h3>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {course.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {course.instructorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="size-3" />
                          {course.lessonCount} lessons
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-6 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Cadence</span>
          <Link to="/courses" className="hover:text-foreground">
            Courses
          </Link>
          {!currentUser && (
            <>
              <Link to="/login" className="hover:text-foreground">
                Log In
              </Link>
              <Link to="/signup" className="hover:text-foreground">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </footer>

      <DevUI
        users={users}
        currentUser={currentUser}
        devCountry={devCountry}
        countryTierInfo={countryTierInfo}
        countries={countries}
      />
    </div>
  );
}
