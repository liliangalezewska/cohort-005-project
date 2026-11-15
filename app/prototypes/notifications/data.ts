// PROTOTYPE — throwaway. Stub data for the notifications bell/section UI question.
// No DB, no persistence. Read-state changes live in component state only.

export type NotificationKind = "question" | "reply" | "test" | "refund" | "admin";

export interface StubNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  ago: string;
  day: "Today" | "Yesterday" | "Earlier";
  unread: boolean;
}

export const KIND_LABEL: Record<NotificationKind, string> = {
  question: "Question",
  reply: "Reply",
  test: "Test",
  refund: "Refund",
  admin: "Admin",
};

export const STUB_NOTIFICATIONS: StubNotification[] = [
  {
    id: "n1",
    kind: "question",
    title: "New question on Intro to TypeScript",
    body: "A student asked about generics in lesson 3.",
    ago: "10m",
    day: "Today",
    unread: true,
  },
  {
    id: "n2",
    kind: "reply",
    title: "Instructor replied to your question",
    body: "Your question on lesson 4 has a new answer.",
    ago: "1h",
    day: "Today",
    unread: true,
  },
  {
    id: "n3",
    kind: "test",
    title: "Student completed a test",
    body: "Alex finished the Module 2 quiz (7 of 10).",
    ago: "3h",
    day: "Today",
    unread: false,
  },
  {
    id: "n4",
    kind: "refund",
    title: "Refund request approved",
    body: "Your refund for Advanced React was approved.",
    ago: "Yesterday",
    day: "Yesterday",
    unread: true,
  },
  {
    id: "n5",
    kind: "admin",
    title: "New refund request",
    body: "A student requested a refund on Testing Basics.",
    ago: "Yesterday",
    day: "Yesterday",
    unread: false,
  },
  {
    id: "n6",
    kind: "question",
    title: "New question on Node Fundamentals",
    body: "A student asked how modules resolve in lesson 2.",
    ago: "2w",
    day: "Earlier",
    unread: false,
  },
];

export const DAY_ORDER: StubNotification["day"][] = ["Today", "Yesterday", "Earlier"];
