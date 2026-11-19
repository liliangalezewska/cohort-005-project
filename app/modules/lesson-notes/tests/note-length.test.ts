import { describe, expect, it } from "vitest";
import { measureNoteLength } from "../index";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

describe("measureNoteLength", () => {
  it("counts an empty note as zero of the limit", () => {
    expect(measureNoteLength("")).toEqual({
      count: 0,
      max: MAX_NOTE_LENGTH,
      label: "0 / 2,000",
      tone: "normal",
    });
  });

  it("ignores the whitespace that saving trims", () => {
    expect(measureNoteLength("  hello\n\n").count).toBe(5);
  });

  it("keeps whitespace inside the note", () => {
    expect(measureNoteLength("a b").count).toBe(3);
  });

  it("groups thousands in the label", () => {
    expect(measureNoteLength("x".repeat(1234)).label).toBe("1,234 / 2,000");
  });

  it("stays normal until a tenth of the limit is left", () => {
    expect(measureNoteLength("x".repeat(89), 100).tone).toBe("normal");
    expect(measureNoteLength("x".repeat(90), 100).tone).toBe("near-limit");
  });

  it("is near the limit when exactly at it, because that still saves", () => {
    expect(measureNoteLength("x".repeat(100), 100).tone).toBe("near-limit");
  });

  it("is over the limit one character past it", () => {
    expect(measureNoteLength("x".repeat(101), 100)).toMatchObject({
      count: 101,
      tone: "over-limit",
    });
  });
});
