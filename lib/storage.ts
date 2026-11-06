export interface ProgressState {
  completed: string[];
  inProgress: string[];
  weak: string[];
  exam: string;
}

export interface SessionTranscript {
  id: string;
  title: string;
  messages: { role: "user" | "assistant"; content: string; timestamp: number; boardData?: any }[];
  createdAt: number;
  exam?: string;
  subject?: string;
  chapterId?: string;
}

export interface TestResult {
  id: string;
  chapterId: string;
  score: number;
  total: number;
  maxScore: number;
  obtained: number;
  accuracy: number;
  answers: Record<string, any>;
  timestamp: number;
  weakSubtopics: string[];
}

const KEY_PROGRESS = "jeet_progress_v1";
const KEY_TRANSCRIPTS = "jeet_transcripts_v1";
const KEY_TESTS = "jeet_tests_v1";
const KEY_EXAM = "jeet_exam_v1";
const KEY_API = "jeet_api_keys_v1";

export function getProgress(): ProgressState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY_PROGRESS);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function saveProgress(p: ProgressState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_PROGRESS, JSON.stringify(p));
}
export function getTranscripts(): SessionTranscript[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY_TRANSCRIPTS) || "[]"); } catch { return []; }
}
export function saveTranscripts(list: SessionTranscript[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_TRANSCRIPTS, JSON.stringify(list));
}
export function getTests(): TestResult[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY_TESTS) || "[]"); } catch { return []; }
}
export function saveTest(r: TestResult) {
  if (typeof window === "undefined") return;
  const all = getTests();
  all.unshift(r);
  localStorage.setItem(KEY_TESTS, JSON.stringify(all.slice(0, 100)));
}
export function getSelectedExam(): string {
  if (typeof window === "undefined") return "JEE";
  return localStorage.getItem(KEY_EXAM) || "JEE";
}
export function setSelectedExam(exam: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_EXAM, exam);
}

export interface ApiKeys {
  gemini: string;
  openai: string;
}
export function getApiKeys(): ApiKeys {
  if (typeof window === "undefined") return { gemini: "", openai: "" };
  try {
    const raw = localStorage.getItem(KEY_API);
    if (!raw) return { gemini: "", openai: "" };
    return JSON.parse(raw);
  } catch { return { gemini: "", openai: "" }; }
}
export function saveApiKeys(keys: ApiKeys) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_API, JSON.stringify(keys));
}
