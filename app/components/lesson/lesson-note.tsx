import { useState } from "react";
import { useFetcher } from "react-router";
import { NotebookPen } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { cn, formatRelativeTime } from "~/lib/utils";
import {
  measureNoteLength,
  type NoteLengthTone,
} from "~/modules/lesson-notes/index";
import type { LessonLoaderData } from "./types";

const COUNTER_TONE: Record<NoteLengthTone, string> = {
  normal: "text-muted-foreground",
  "near-limit": "text-amber-600",
  "over-limit": "font-medium text-red-600",
};

export function LessonNote({
  note,
}: {
  note: Extract<LessonLoaderData, { view: "full" }>["note"];
}) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [body, setBody] = useState(note?.body ?? "");
  const isSaving = fetcher.state !== "idle";
  const error = fetcher.data?.error;
  const isOverLimit = measureNoteLength(body).tone === "over-limit";

  return (
    <Card className="mb-8 gap-4">
      <NoteHeader />

      <CardContent>
        <fetcher.Form method="post" className="space-y-3">
          <input type="hidden" name="intent" value="save-note" />
          <Textarea
            name="body"
            rows={6}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Jot down what you want to remember from this lesson."
            aria-label="Your notes"
            aria-describedby="lesson-note-length"
            aria-invalid={isOverLimit || undefined}
            className="min-h-32 resize-y"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            {error && <span className="text-sm text-red-600">{error}</span>}
            {!error && note && (
              <span
                suppressHydrationWarning
                className="text-xs text-muted-foreground"
              >
                Last edited {formatRelativeTime(note.updatedAt)}
              </span>
            )}
            <NoteLengthCounter id="lesson-note-length" body={body} />
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

function NoteLengthCounter({ id, body }: { id: string; body: string }) {
  const length = measureNoteLength(body);
  return (
    <span
      id={id}
      className={cn("ml-auto text-xs tabular-nums", COUNTER_TONE[length.tone])}
    >
      {length.label} characters
    </span>
  );
}

function NoteHeader() {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <NotebookPen className="size-4 text-muted-foreground" />
        <h2>Your notes</h2>
      </CardTitle>
      <CardDescription>Only you can read these.</CardDescription>
    </CardHeader>
  );
}
