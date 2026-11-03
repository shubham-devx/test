export type AsfTbiApplicationQuestion = {
  id: string;
  label: string;
  type: "text" | "url" | "textarea" | "select";
  enabled: boolean;
  required: boolean;
  options: string[];
};

export type AsfTbiApplicationAnswersResult =
  | { valid: true; answers: Record<string, string> }
  | { valid: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateAsfTbiApplicationAnswers(
  questions: AsfTbiApplicationQuestion[],
  input: unknown
): AsfTbiApplicationAnswersResult {
  const submitted = input === undefined ? {} : input;
  if (!isRecord(submitted)) return { valid: false, error: "Invalid additional application responses." };

  const enabledQuestions = questions.filter((question) => question.enabled);
  const enabledIds = new Set(enabledQuestions.map((question) => question.id));
  if (Object.keys(submitted).some((key) => !enabledIds.has(key))) {
    return { valid: false, error: "Unexpected additional application fields were provided." };
  }

  const answers: Record<string, string> = {};
  for (const question of enabledQuestions) {
    const rawAnswer = submitted[question.id];
    if (typeof rawAnswer !== "string") {
      if (rawAnswer === undefined && !question.required) {
        answers[question.id] = "";
        continue;
      }
      return { valid: false, error: `Please provide a valid ${question.label}.` };
    }

    const answer = rawAnswer.trim();
    if (answer.length > 2_000) {
      return { valid: false, error: `${question.label} must be 2000 characters or fewer.` };
    }
    if (question.required && !answer) {
      return { valid: false, error: `Please fill in ${question.label}.` };
    }
    if (question.type === "url" && answer) {
      try {
        if (new URL(answer).protocol !== "https:") {
          return { valid: false, error: `${question.label} must be a valid HTTPS link.` };
        }
      } catch {
        return { valid: false, error: `${question.label} must be a valid HTTPS link.` };
      }
    }
    if (question.type === "select" && answer && !question.options.includes(answer)) {
      return { valid: false, error: `Please choose a valid option for ${question.label}.` };
    }
    answers[question.id] = answer;
  }

  return { valid: true, answers };
}
