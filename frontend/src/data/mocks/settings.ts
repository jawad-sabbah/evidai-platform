/* =========================================================
   TYPES
========================================================= */

export type SettingsTab =
  | "PROFILE"
  | "PREFERENCES"
  | "NOTIFICATIONS"
  | "AI_INVESTIGATOR";

export type Theme =
  | "LIGHT"
  | "DARK"
  | "SYSTEM";

export type LandingPage =
  | "DASHBOARD"
  | "CASES"
  | "EVIDENCE"
  | "AI_INVESTIGATOR";

export type AIResponseStyle =
  | "CONCISE"
  | "BALANCED"
  | "DETAILED";

export type UserPreferences = {
  id: string;

  userId: string;

  theme: Theme;

  timezone: string;

  dateFormat: string;

  defaultLandingPage: LandingPage;

  aiResponseStyle: AIResponseStyle;

  aiShowCitations: boolean;

  aiShowConfidence: boolean;
};

export type NotificationPreferences = {
  id: string;

  userId: string;

  evidenceFailed: boolean;

  evidenceReady: boolean;

  reviewAssigned: boolean;

  findingVerified: boolean;

  reportReady: boolean;

  mentions: boolean;

  emailNotifications: boolean;

  inAppNotifications: boolean;
};

/* =========================================================
   MOCK CURRENT USER

   Later get this from authentication/session.
========================================================= */

export const currentUser = {
  id: "user-001",

  name: "Jawad Sabbah",

  email: "jawad@evidai.com",

  role: "Investigator",
};

/* =========================================================
   MOCK USER PREFERENCES

   Later:
   GET /users/me/preferences
========================================================= */

export const initialUserPreferences: UserPreferences = {
  id: "preference-001",

  userId: currentUser.id,

  theme: "LIGHT",

  timezone: "Asia/Beirut",

  dateFormat: "DD/MM/YYYY",

  defaultLandingPage: "DASHBOARD",

  aiResponseStyle: "BALANCED",

  aiShowCitations: true,

  aiShowConfidence: true,
};

/* =========================================================
   MOCK NOTIFICATION PREFERENCES

   Later:
   GET /users/me/notification-preferences
========================================================= */

export const initialNotificationPreferences: NotificationPreferences =
  {
    id: "notification-pref-001",

    userId: currentUser.id,

    evidenceFailed: true,

    evidenceReady: true,

    reviewAssigned: true,

    findingVerified: true,

    reportReady: true,

    mentions: true,

    emailNotifications: true,

    inAppNotifications: true,
  };
