/* =========================================================
   HELPERS
========================================================= */

export function createConversationTitle(
  question: string,
) {
  const cleaned =
    question.trim();

  if (
    cleaned.length <= 38
  ) {
    return cleaned;
  }

  return `${cleaned.slice(
    0,
    38,
  )}...`;
}

export function currentTime() {
  return new Date().toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute:
        "2-digit",
    },
  );
}

export function createId() {
  if (
    typeof crypto !==
      "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}