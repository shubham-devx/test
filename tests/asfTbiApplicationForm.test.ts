import { describe, expect, it } from "vitest";
import { validateAsfTbiApplicationAnswers } from "../lib/asfTbiApplicationForm";

const questions = [
  {
    id: "team-profile",
    label: "Team profile",
    type: "textarea" as const,
    enabled: true,
    required: true,
    options: [],
  },
  {
    id: "founder-link",
    label: "Founder profile",
    type: "url" as const,
    enabled: true,
    required: false,
    options: [],
  },
  {
    id: "stage-detail",
    label: "Stage",
    type: "select" as const,
    enabled: true,
    required: false,
    options: ["Idea", "Prototype"],
  },
  {
    id: "disabled-question",
    label: "Disabled question",
    type: "text" as const,
    enabled: false,
    required: false,
    options: [],
  },
];

describe("ASF-TBI configurable application questions", () => {
  it("accepts configured answers and preserves empty optional questions", () => {
    expect(validateAsfTbiApplicationAnswers(questions, {
      "team-profile": "  A small founding team  ",
      "founder-link": "https://example.com/founder",
      "stage-detail": "Prototype",
    })).toEqual({
      valid: true,
      answers: {
        "team-profile": "A small founding team",
        "founder-link": "https://example.com/founder",
        "stage-detail": "Prototype",
      },
    });
  });

  it("requires answers marked required", () => {
    expect(validateAsfTbiApplicationAnswers(questions, {})).toEqual({
      valid: false,
      error: "Please provide a valid Team profile.",
    });
    expect(validateAsfTbiApplicationAnswers(questions, { "team-profile": " " })).toEqual({
      valid: false,
      error: "Please fill in Team profile.",
    });
  });

  it("rejects disabled questions and values outside dropdown options", () => {
    expect(validateAsfTbiApplicationAnswers(questions, {
      "team-profile": "A team",
      "disabled-question": "injected",
    })).toEqual({
      valid: false,
      error: "Unexpected additional application fields were provided.",
    });
    expect(validateAsfTbiApplicationAnswers(questions, {
      "team-profile": "A team",
      "stage-detail": "Unknown stage",
    })).toEqual({
      valid: false,
      error: "Please choose a valid option for Stage.",
    });
  });

  it("accepts only HTTPS URLs and enforces the response size limit", () => {
    expect(validateAsfTbiApplicationAnswers(questions, {
      "team-profile": "A team",
      "founder-link": "http://example.com",
    })).toEqual({
      valid: false,
      error: "Founder profile must be a valid HTTPS link.",
    });
    expect(validateAsfTbiApplicationAnswers(questions, {
      "team-profile": "x".repeat(2_001),
    })).toEqual({
      valid: false,
      error: "Team profile must be 2000 characters or fewer.",
    });
  });
});
