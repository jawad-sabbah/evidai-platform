"use client";

import { useState } from "react";

import {
  Bell,
  Bot,
  Check,
  ChevronRight,
  LayoutDashboard,
  Mail,
  Monitor,
  Palette,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";

/* =========================================================
   TYPES
========================================================= */

type SettingsTab =
  | "PROFILE"
  | "PREFERENCES"
  | "NOTIFICATIONS"
  | "AI_INVESTIGATOR";

type Theme =
  | "LIGHT"
  | "DARK"
  | "SYSTEM";

type LandingPage =
  | "DASHBOARD"
  | "CASES"
  | "EVIDENCE"
  | "AI_INVESTIGATOR";

type AIResponseStyle =
  | "CONCISE"
  | "BALANCED"
  | "DETAILED";

type UserPreferences = {
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

type NotificationPreferences = {
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

const currentUser = {
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

const initialUserPreferences: UserPreferences = {
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

const initialNotificationPreferences: NotificationPreferences =
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

/* =========================================================
   PAGE
========================================================= */

export default function SettingsPage() {
  const [
    activeTab,
    setActiveTab,
  ] = useState<SettingsTab>(
    "PREFERENCES",
  );

  const [
    preferences,
    setPreferences,
  ] =
    useState<UserPreferences>(
      initialUserPreferences,
    );

  const [
    notificationPreferences,
    setNotificationPreferences,
  ] =
    useState<NotificationPreferences>(
      initialNotificationPreferences,
    );

  const [
    saved,
    setSaved,
  ] = useState(false);

  /* =========================================================
     SAVE
  ========================================================= */

  function handleSave() {
    /*
      Later:

      PATCH /users/me/preferences

      {
        theme,
        timezone,
        date_format,
        default_landing_page,
        ai_response_style,
        ai_show_citations,
        ai_show_confidence
      }


      PATCH /users/me/notification-preferences

      {
        evidence_failed,
        evidence_ready,
        review_assigned,
        finding_verified,
        report_ready,
        mentions,
        email_notifications,
        in_app_notifications
      }
    */

    console.log(
      "user_preferences",
      preferences,
    );

    console.log(
      "notification_preferences",
      notificationPreferences,
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 1800);
  }

  return (
    <AppShell showTopbar={false}>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F7F3]">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="shrink-0 border-b border-[#E3E6E2] bg-[#F7F7F3] px-8 py-7">
          <div className="mx-auto flex max-w-[1380px] items-end justify-between gap-6">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8A938E]">
                Workspace Preferences
              </div>

              <h1 className="mt-2 text-[30px] font-semibold tracking-[-0.035em] text-[#18201D]">
                Settings
              </h1>

              <p className="mt-1 text-sm text-[#7A8580]">
                Manage your personal
                preferences, notifications
                and AI Investigator
                experience.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleSave
              }
              className={`inline-flex h-10 min-w-[145px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition ${
                saved
                  ? "bg-[#E7F2EC] text-[#19704F]"
                  : "bg-[#0F4C3A] text-white hover:bg-[#0A382B]"
              }`}
            >
              {saved ? (
                <>
                  <Check
                    size={15}
                  />

                  Saved
                </>
              ) : (
                <>
                  <Save
                    size={15}
                  />

                  Save changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* =================================================
            WORKSPACE
        ================================================= */}

        <div className="min-h-0 flex-1 px-8 py-6">
          <div className="mx-auto grid h-full min-h-0 max-w-[1380px] grid-cols-[260px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[#E1E4DF] bg-white shadow-[0_8px_30px_rgba(28,40,34,0.04)]">
            {/* =============================================
                SIDEBAR
            ============================================= */}

            <aside className="flex min-h-0 flex-col border-r border-[#E6E8E4] bg-[#FAFAF7]">
              {/* USER */}

              <div className="border-b border-[#E6E8E4] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E4EEE8] text-sm font-semibold text-[#0F4C3A]">
                    JS
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[#34413B]">
                      {
                        currentUser.name
                      }
                    </div>

                    <div className="mt-0.5 truncate text-[10px] text-[#8C9590]">
                      {
                        currentUser.role
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* NAV */}

              <div className="p-3">
                <SettingsNavItem
                  icon={
                    <User
                      size={15}
                    />
                  }
                  label="Profile"
                  active={
                    activeTab ===
                    "PROFILE"
                  }
                  onClick={() =>
                    setActiveTab(
                      "PROFILE",
                    )
                  }
                />

                <SettingsNavItem
                  icon={
                    <Settings2
                      size={15}
                    />
                  }
                  label="Preferences"
                  active={
                    activeTab ===
                    "PREFERENCES"
                  }
                  onClick={() =>
                    setActiveTab(
                      "PREFERENCES",
                    )
                  }
                />

                <SettingsNavItem
                  icon={
                    <Bell
                      size={15}
                    />
                  }
                  label="Notifications"
                  active={
                    activeTab ===
                    "NOTIFICATIONS"
                  }
                  onClick={() =>
                    setActiveTab(
                      "NOTIFICATIONS",
                    )
                  }
                />

                <SettingsNavItem
                  icon={
                    <Sparkles
                      size={15}
                    />
                  }
                  label="AI Investigator"
                  active={
                    activeTab ===
                    "AI_INVESTIGATOR"
                  }
                  onClick={() =>
                    setActiveTab(
                      "AI_INVESTIGATOR",
                    )
                  }
                />
              </div>

              {/* DATABASE INFO */}

              <div className="mt-auto border-t border-[#E6E8E4] p-4">
                <div className="rounded-xl border border-[#E2E7E3] bg-white p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={14}
                      className="text-[#0F4C3A]"
                    />

                    <span className="text-xs font-semibold text-[#435049]">
                      Personal settings
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] leading-5 text-[#7E8883]">
                    These preferences apply
                    only to your user account.
                  </p>
                </div>
              </div>
            </aside>

            {/* =============================================
                CONTENT
            ============================================= */}

            <main className="min-h-0 overflow-y-auto">
              <div className="mx-auto max-w-[900px] px-10 py-9">
                {activeTab ===
                  "PROFILE" && (
                  <ProfileSettings />
                )}

                {activeTab ===
                  "PREFERENCES" && (
                  <PreferencesSettings
                    preferences={
                      preferences
                    }
                    setPreferences={
                      setPreferences
                    }
                  />
                )}

                {activeTab ===
                  "NOTIFICATIONS" && (
                  <NotificationSettings
                    preferences={
                      notificationPreferences
                    }
                    setPreferences={
                      setNotificationPreferences
                    }
                  />
                )}

                {activeTab ===
                  "AI_INVESTIGATOR" && (
                  <AISettings
                    preferences={
                      preferences
                    }
                    setPreferences={
                      setPreferences
                    }
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfileSettings() {
  return (
    <>
      <SettingsHeader
        title="Profile"
        description="Your EvidAI account information."
      />

      <SettingsSection
        title="Account information"
        description="Profile data currently comes from your user account."
      >
        {/* AVATAR */}

        <div className="flex items-center gap-4 border-b border-[#ECEDE9] pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E4EEE8] text-lg font-semibold text-[#0F4C3A]">
            JS
          </div>

          <div>
            <div className="text-sm font-semibold text-[#35413B]">
              {
                currentUser.name
              }
            </div>

            <div className="mt-1 text-xs text-[#8A938E]">
              {
                currentUser.role
              }
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5">
          <ReadonlyField
            label="Full name"
            value={
              currentUser.name
            }
          />

          <ReadonlyField
            label="Email address"
            value={
              currentUser.email
            }
          />

          <ReadonlyField
            label="Role"
            value={
              currentUser.role
            }
          />

          <ReadonlyField
            label="User ID"
            value={
              currentUser.id
            }
          />
        </div>

        <div className="mt-6 rounded-xl border border-[#E3E7E3] bg-[#FAFAF7] p-4">
          <p className="text-xs leading-5 text-[#78827D]">
            Profile fields are shown
            as read-only here because
            they belong to the{" "}
            <strong className="font-semibold text-[#4C5953]">
              users
            </strong>{" "}
            table, not the settings
            tables.
          </p>
        </div>
      </SettingsSection>
    </>
  );
}

/* =========================================================
   USER PREFERENCES
========================================================= */

function PreferencesSettings({
  preferences,
  setPreferences,
}: {
  preferences:
    UserPreferences;

  setPreferences:
    React.Dispatch<
      React.SetStateAction<UserPreferences>
    >;
}) {
  return (
    <>
      <SettingsHeader
        title="Preferences"
        description="Customize how EvidAI appears and behaves for your account."
      />

      {/* APPEARANCE */}

      <SettingsSection
        title="Appearance"
        description="Choose how the interface should appear."
      >
        <div className="grid grid-cols-3 gap-3">
          <ThemeOption
            icon={
              <Palette
                size={18}
              />
            }
            title="Light"
            description="Always use light mode."
            selected={
              preferences.theme ===
              "LIGHT"
            }
            onClick={() =>
              setPreferences(
                (current) => ({
                  ...current,

                  theme:
                    "LIGHT",
                }),
              )
            }
          />

          <ThemeOption
            icon={
              <Monitor
                size={18}
              />
            }
            title="System"
            description="Follow device appearance."
            selected={
              preferences.theme ===
              "SYSTEM"
            }
            onClick={() =>
              setPreferences(
                (current) => ({
                  ...current,

                  theme:
                    "SYSTEM",
                }),
              )
            }
          />

          <ThemeOption
            icon={
              <Palette
                size={18}
              />
            }
            title="Dark"
            description="Always use dark mode."
            selected={
              preferences.theme ===
              "DARK"
            }
            onClick={() =>
              setPreferences(
                (current) => ({
                  ...current,

                  theme:
                    "DARK",
                }),
              )
            }
          />
        </div>
      </SettingsSection>

      {/* REGIONAL */}

      <SettingsSection
        title="Regional preferences"
        description="Control time and date formatting."
      >
        <div className="grid grid-cols-2 gap-5">
          <SettingSelect
            label="Timezone"
            value={
              preferences.timezone
            }
            onChange={(
              value,
            ) =>
              setPreferences(
                (current) => ({
                  ...current,

                  timezone:
                    value,
                }),
              )
            }
            options={[
              {
                value:
                  "Asia/Beirut",

                label:
                  "Asia/Beirut",
              },

              {
                value:
                  "UTC",

                label:
                  "UTC",
              },

              {
                value:
                  "Europe/London",

                label:
                  "Europe/London",
              },

              {
                value:
                  "America/New_York",

                label:
                  "America/New_York",
              },

              {
                value:
                  "Asia/Dubai",

                label:
                  "Asia/Dubai",
              },
            ]}
          />

          <SettingSelect
            label="Date format"
            value={
              preferences.dateFormat
            }
            onChange={(
              value,
            ) =>
              setPreferences(
                (current) => ({
                  ...current,

                  dateFormat:
                    value,
                }),
              )
            }
            options={[
              {
                value:
                  "DD/MM/YYYY",

                label:
                  "DD/MM/YYYY",
              },

              {
                value:
                  "MM/DD/YYYY",

                label:
                  "MM/DD/YYYY",
              },

              {
                value:
                  "YYYY-MM-DD",

                label:
                  "YYYY-MM-DD",
              },
            ]}
          />
        </div>
      </SettingsSection>

      {/* LANDING PAGE */}

      <SettingsSection
        title="Default landing page"
        description="Choose the page EvidAI should open after sign in."
      >
        <div className="grid grid-cols-2 gap-3">
          <LandingPageOption
            icon={
              <LayoutDashboard
                size={17}
              />
            }
            title="Dashboard"
            description="Investigation overview and workload."
            selected={
              preferences.defaultLandingPage ===
              "DASHBOARD"
            }
            onClick={() =>
              setPreferences(
                (current) => ({
                  ...current,

                  defaultLandingPage:
                    "DASHBOARD",
                }),
              )
            }
          />

          <LandingPageOption
            icon={
              <Settings2
                size={17}
              />
            }
            title="Cases"
            description="Go directly to the case list."
            selected={
              preferences.defaultLandingPage ===
              "CASES"
            }
            onClick={() =>
              setPreferences(
                (current) => ({
                  ...current,

                  defaultLandingPage:
                    "CASES",
                }),
              )
            }
          />

          <LandingPageOption
            icon={
              <ShieldCheck
                size={17}
              />
            }
            title="Evidence"
            description="Open the global evidence workspace."
            selected={
              preferences.defaultLandingPage ===
              "EVIDENCE"
            }
            onClick={() =>
              setPreferences(
                (current) => ({
                  ...current,

                  defaultLandingPage:
                    "EVIDENCE",
                }),
              )
            }
          />

          <LandingPageOption
            icon={
              <Sparkles
                size={17}
              />
            }
            title="AI Investigator"
            description="Start with investigation Q&A."
            selected={
              preferences.defaultLandingPage ===
              "AI_INVESTIGATOR"
            }
            onClick={() =>
              setPreferences(
                (current) => ({
                  ...current,

                  defaultLandingPage:
                    "AI_INVESTIGATOR",
                }),
              )
            }
          />
        </div>
      </SettingsSection>
    </>
  );
}

/* =========================================================
   NOTIFICATION SETTINGS
========================================================= */

function NotificationSettings({
  preferences,
  setPreferences,
}: {
  preferences:
    NotificationPreferences;

  setPreferences:
    React.Dispatch<
      React.SetStateAction<NotificationPreferences>
    >;
}) {
  return (
    <>
      <SettingsHeader
        title="Notifications"
        description="Choose which investigation events should notify you."
      />

      {/* DELIVERY */}

      <SettingsSection
        title="Notification channels"
        description="Choose where notifications should be delivered."
      >
        <ToggleSetting
          icon={
            <Bell
              size={16}
            />
          }
          title="In-app notifications"
          description="Receive notifications inside EvidAI."
          checked={
            preferences.inAppNotifications
          }
          onChange={(
            checked,
          ) =>
            setPreferences(
              (current) => ({
                ...current,

                inAppNotifications:
                  checked,
              }),
            )
          }
        />

        <ToggleDivider />

        <ToggleSetting
          icon={
            <Mail
              size={16}
            />
          }
          title="Email notifications"
          description="Receive investigation notifications by email."
          checked={
            preferences.emailNotifications
          }
          onChange={(
            checked,
          ) =>
            setPreferences(
              (current) => ({
                ...current,

                emailNotifications:
                  checked,
              }),
            )
          }
        />
      </SettingsSection>

      {/* EVIDENCE */}

      <SettingsSection
        title="Evidence processing"
        description="Notifications related to evidence ingestion and processing."
      >
        <ToggleSetting
          title="Evidence processing failed"
          description="Notify me when an evidence item cannot be processed."
          checked={
            preferences.evidenceFailed
          }
          onChange={(
            checked,
          ) =>
            setPreferences(
              (current) => ({
                ...current,

                evidenceFailed:
                  checked,
              }),
            )
          }
        />

        <ToggleDivider />

        <ToggleSetting
          title="Evidence ready"
          description="Notify me when evidence has finished processing."
          checked={
            preferences.evidenceReady
          }
          onChange={(
            checked,
          ) =>
            setPreferences(
              (current) => ({
                ...current,

                evidenceReady:
                  checked,
              }),
            )
          }
        />
      </SettingsSection>

      {/* INVESTIGATION */}

      <SettingsSection
        title="Investigation activity"
        description="Notifications for review work and investigation decisions."
      >
        <ToggleSetting
          title="Review assigned"
          description="Notify me when investigation review work is assigned to me."
          checked={
            preferences.reviewAssigned
          }
          onChange={(
            checked,
          ) =>
            setPreferences(
              (current) => ({
                ...current,

                reviewAssigned:
                  checked,
              }),
            )
          }
        />

        <ToggleDivider />

        <ToggleSetting
          title="Finding verified"
          description="Notify me when a finding is verified."
          checked={
            preferences.findingVerified
          }
          onChange={(
            checked,
          ) =>
            setPreferences(
              (current) => ({
                ...current,

                findingVerified:
                  checked,
              }),
            )
          }
        />

        <ToggleDivider />

        <ToggleSetting
          title="Report ready"
          description="Notify me when report generation has completed."
          checked={
            preferences.reportReady
          }
          onChange={(
            checked,
          ) =>
            setPreferences(
              (current) => ({
                ...current,

                reportReady:
                  checked,
              }),
            )
          }
        />

        <ToggleDivider />

        <ToggleSetting
          title="Mentions"
          description="Notify me when another user mentions me."
          checked={
            preferences.mentions
          }
          onChange={(
            checked,
          ) =>
            setPreferences(
              (current) => ({
                ...current,

                mentions:
                  checked,
              }),
            )
          }
        />
      </SettingsSection>
    </>
  );
}

/* =========================================================
   AI SETTINGS
========================================================= */

function AISettings({
  preferences,
  setPreferences,
}: {
  preferences:
    UserPreferences;

  setPreferences:
    React.Dispatch<
      React.SetStateAction<UserPreferences>
    >;
}) {
  return (
    <>
      <SettingsHeader
        title="AI Investigator"
        description="Control how AI-assisted investigation responses are presented."
      />

      {/* RESPONSE STYLE */}

      <SettingsSection
        title="Response style"
        description="Choose the default level of detail in AI Investigator responses."
      >
        <div className="grid grid-cols-3 gap-3">
          <AIStyleOption
            title="Concise"
            description="Short, focused answers."
            selected={
              preferences.aiResponseStyle ===
              "CONCISE"
            }
            onClick={() =>
              setPreferences(
                (current) => ({
                  ...current,

                  aiResponseStyle:
                    "CONCISE",
                }),
              )
            }
          />

          <AIStyleOption
            title="Balanced"
            description="Useful detail without unnecessary length."
            selected={
              preferences.aiResponseStyle ===
              "BALANCED"
            }
            onClick={() =>
              setPreferences(
                (current) => ({
                  ...current,

                  aiResponseStyle:
                    "BALANCED",
                }),
              )
            }
          />

          <AIStyleOption
            title="Detailed"
            description="More context and analysis."
            selected={
              preferences.aiResponseStyle ===
              "DETAILED"
            }
            onClick={() =>
              setPreferences(
                (current) => ({
                  ...current,

                  aiResponseStyle:
                    "DETAILED",
                }),
              )
            }
          />
        </div>
      </SettingsSection>

      {/* RESPONSE DISPLAY */}

      <SettingsSection
        title="Response display"
        description="Choose which analytical information appears in AI responses."
      >
        <ToggleSetting
          icon={
            <ShieldCheck
              size={16}
            />
          }
          title="Show source citations"
          description="Display supporting evidence references beneath AI responses."
          checked={
            preferences.aiShowCitations
          }
          onChange={(
            checked,
          ) =>
            setPreferences(
              (current) => ({
                ...current,

                aiShowCitations:
                  checked,
              }),
            )
          }
        />

        <ToggleDivider />

        <ToggleSetting
          icon={
            <Sparkles
              size={16}
            />
          }
          title="Show confidence information"
          description="Display available model or extraction confidence information."
          checked={
            preferences.aiShowConfidence
          }
          onChange={(
            checked,
          ) =>
            setPreferences(
              (current) => ({
                ...current,

                aiShowConfidence:
                  checked,
              }),
            )
          }
        />
      </SettingsSection>

      {/* NON-OPTIONAL GROUNDING */}

      <div className="rounded-2xl border border-[#DCE6DF] bg-[#F1F6F3] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E3EEE7] text-[#0F4C3A]">
            <Bot
              size={16}
            />
          </div>

          <div>
            <div className="text-sm font-semibold text-[#365044]">
              Evidence grounding is always enabled
            </div>

            <p className="mt-1 text-xs leading-5 text-[#718079]">
              AI Investigator answers remain
              scoped to investigation evidence
              and structured case intelligence.
              Evidence grounding is part of the
              product workflow and cannot be
              disabled from user preferences.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   SETTINGS HEADER
========================================================= */

function SettingsHeader({
  title,
  description,
}: {
  title: string;

  description: string;
}) {
  return (
    <div className="mb-7">
      <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[#18201D]">
        {title}
      </h2>

      <p className="mt-1 text-sm text-[#7A8580]">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   SETTINGS SECTION
========================================================= */

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;

  description: string;

  children:
    React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-2xl border border-[#E3E6E2] bg-white p-6 shadow-[0_3px_14px_rgba(28,40,34,0.025)]">
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-[#35413B]">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-[#87918C]">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   NAV ITEM
========================================================= */

function SettingsNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon:
    React.ReactNode;

  label:
    string;

  active:
    boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition ${
        active
          ? "bg-white font-medium text-[#0F4C3A] shadow-sm ring-1 ring-[#E4E8E4]"
          : "text-[#65716B] hover:bg-white/70 hover:text-[#34413B]"
      }`}
    >
      <div
        className={
          active
            ? "text-[#0F4C3A]"
            : "text-[#8A938E]"
        }
      >
        {icon}
      </div>

      <span className="flex-1 text-sm">
        {label}
      </span>

      {active && (
        <ChevronRight
          size={13}
        />
      )}
    </button>
  );
}

/* =========================================================
   READONLY FIELD
========================================================= */

function ReadonlyField({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[#59645F]">
        {label}
      </label>

      <div className="mt-2 flex h-11 items-center rounded-lg border border-[#E1E4DF] bg-[#F8F9F6] px-4 text-sm text-[#59645F]">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function SettingSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;

  value: string;

  options: {
    value: string;
    label: string;
  }[];

  onChange:
    (
      value: string,
    ) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[#59645F]">
        {label}
      </label>

      <select
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="mt-2 h-11 w-full rounded-lg border border-[#DDE1DC] bg-white px-4 text-sm text-[#45514B] outline-none transition focus:border-[#93AA9F]"
      >
        {options.map(
          (
            option,
          ) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          ),
        )}
      </select>
    </div>
  );
}

/* =========================================================
   THEME OPTION
========================================================= */

function ThemeOption({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon:
    React.ReactNode;

  title:
    string;

  description:
    string;

  selected:
    boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#94AC9F] bg-[#F1F6F3]"
          : "border-[#E2E5E1] bg-white hover:bg-[#FAFAF7]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div
          className={
            selected
              ? "text-[#0F4C3A]"
              : "text-[#7E8883]"
          }
        >
          {icon}
        </div>

        <SelectionIndicator
          selected={
            selected
          }
        />
      </div>

      <div className="mt-4 text-sm font-semibold text-[#35413B]">
        {title}
      </div>

      <div className="mt-1 text-[11px] leading-5 text-[#87918C]">
        {description}
      </div>
    </button>
  );
}

/* =========================================================
   LANDING PAGE OPTION
========================================================= */

function LandingPageOption({
  icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon:
    React.ReactNode;

  title:
    string;

  description:
    string;

  selected:
    boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#94AC9F] bg-[#F1F6F3]"
          : "border-[#E2E5E1] bg-white hover:bg-[#FAFAF7]"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          selected
            ? "bg-[#E0EBE4] text-[#0F4C3A]"
            : "bg-[#F1F3F0] text-[#727D77]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#35413B]">
          {title}
        </div>

        <p className="mt-1 text-[11px] leading-5 text-[#87918C]">
          {description}
        </p>
      </div>

      <SelectionIndicator
        selected={
          selected
        }
      />
    </button>
  );
}

/* =========================================================
   AI STYLE OPTION
========================================================= */

function AIStyleOption({
  title,
  description,
  selected,
  onClick,
}: {
  title: string;

  description: string;

  selected: boolean;

  onClick:
    () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-[#94AC9F] bg-[#F1F6F3]"
          : "border-[#E2E5E1] bg-white hover:bg-[#FAFAF7]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-[#35413B]">
          {title}
        </span>

        <SelectionIndicator
          selected={
            selected
          }
        />
      </div>

      <p className="mt-2 text-[11px] leading-5 text-[#87918C]">
        {description}
      </p>
    </button>
  );
}

/* =========================================================
   SELECTION INDICATOR
========================================================= */

function SelectionIndicator({
  selected,
}: {
  selected: boolean;
}) {
  return (
    <div
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
        selected
          ? "border-[#0F4C3A] bg-[#0F4C3A]"
          : "border-[#C6CCC8] bg-white"
      }`}
    >
      {selected && (
        <div className="h-1.5 w-1.5 rounded-full bg-white" />
      )}
    </div>
  );
}

/* =========================================================
   TOGGLE SETTING
========================================================= */

function ToggleSetting({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon?:
    React.ReactNode;

  title:
    string;

  description:
    string;

  checked:
    boolean;

  onChange:
    (
      checked: boolean,
    ) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-1">
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F0] text-[#0F4C3A]">
          {icon}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-[#45514B]">
          {title}
        </div>

        <p className="mt-1 text-[11px] leading-5 text-[#87918C]">
          {description}
        </p>
      </div>

      <Toggle
        checked={
          checked
        }
        onChange={
          onChange
        }
      />
    </div>
  );
}

/* =========================================================
   DIVIDER
========================================================= */

function ToggleDivider() {
  return (
    <div className="my-4 border-t border-[#ECEDE9]" />
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;

  onChange:
    (
      checked: boolean,
    ) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={
        checked
      }
      onClick={() =>
        onChange(
          !checked,
        )
      }
      className={`relative h-[24px] w-[42px] shrink-0 rounded-full transition ${
        checked
          ? "bg-[#0F4C3A]"
          : "bg-[#D8DDDA]"
      }`}
    >
      <span
        className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all ${
          checked
            ? "left-[21px]"
            : "left-[3px]"
        }`}
      />
    </button>
  );
}