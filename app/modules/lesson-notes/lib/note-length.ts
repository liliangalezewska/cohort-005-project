import { MAX_NOTE_LENGTH } from "~/lib/notes";

export type NoteLengthTone = "normal" | "near-limit" | "over-limit";

export type NoteLength = {
  count: number;
  max: number;
  label: string;
  tone: NoteLengthTone;
};

// Warn once a Student has a tenth of the limit left, early enough to trim
// before they hit Save and the note is turned away.
const NEAR_LIMIT_SHARE = 0.1;

export function measureNoteLength(body: string): NoteLength {
  const max = MAX_NOTE_LENGTH;
  // Saving trims the body, so leading and trailing whitespace never counts
  // against the limit; counting it here would warn about a note that saves.
  const count = body.trim().length;
  return {
    count,
    max,
    label: `${count.toLocaleString("en")} / ${max.toLocaleString("en")}`,
    tone: toneFor(count, max),
  };
}

function toneFor(count: number, max: number): NoteLengthTone {
  if (count > max) return "over-limit";
  if (max - count <= max * NEAR_LIMIT_SHARE) return "near-limit";
  return "normal";
}
