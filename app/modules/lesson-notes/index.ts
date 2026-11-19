import {
  measureNoteLength as measure,
  type NoteLength,
} from "./lib/note-length";

export type { NoteLength, NoteLengthTone } from "./lib/note-length";

/**
 * How long a Note is against the limit the save enforces, ready to show
 * under the note field.
 */
export function measureNoteLength(body: string, max?: number): NoteLength {
  return measure(body, max);
}
