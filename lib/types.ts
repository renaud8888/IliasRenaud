export type GoalType = "loss" | "gain";
export type ProgressStatus = "en avance" | "dans les temps" | "en retard";

export type PersonSlug = "ilias" | "renaud";

export interface ProfileRecord {
  id: string;
  slug: PersonSlug;
  first_name: string;
  goal_type: GoalType;
  start_weight: number;
  target_weight: number;
  accent_color: string;
  order_index: number;
}

export interface GlobalSettingsRecord {
  id: number;
  start_date: string;
  end_date: string;
  status_tolerance_pct: number;
  reminder_cooldown_days: number;
  weekly_email_enabled: boolean;
  missed_entry_email_enabled: boolean;
  weekly_email_hour_local: string;
}

export interface AppRuntimeSettingsRecord {
  id: number;
  simulation_enabled: boolean;
  simulated_now: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WeightEntryRecord {
  id: string;
  profile_id: string;
  entry_date: string;
  weight_kg: number;
  is_test_data?: boolean;
  scenario_key?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MotivationalMessageRecord {
  id: string;
  profile_id: string;
  tone: string;
  content: string;
  is_active: boolean;
}

export interface EmailLogRecord {
  id: string;
  profile_id: string;
  email_type: "weekly_summary" | "missed_entry_reminder";
  sent_at: string;
  reminder_window_start: string | null;
  is_test_data?: boolean;
  scenario_key?: string | null;
}

export interface WeeklyPoint {
  weekStart: string;
  weekEnd: string;
  label: string;
  averageWeight: number | null;
  theoreticalWeight: number;
}

export interface ParticipantDashboard {
  id: string;
  slug: PersonSlug;
  firstName: string;
  goalType: GoalType;
  startWeight: number;
  targetWeight: number;
  currentWeeklyWeight: number;
  latestWeeklyLabel: string;
  realProgressPct: number;
  theoreticalProgressPct: number;
  status: ProgressStatus;
  gaugeColor: string;
  messagePoolSize: number;
  chart: WeeklyPoint[];
  history: Array<{
    weekLabel: string;
    averageWeight: number;
  }>;
}

export interface DashboardPayload {
  generatedAt: string;
  dateContext: AppDateContext;
  period: {
    startDate: string;
    endDate: string;
    totalDays: number;
    tolerancePct: number;
  };
  participants: ParticipantDashboard[];
}

export interface AdminPayload {
  settings: GlobalSettingsRecord;
  runtime: {
    settings: AppRuntimeSettingsRecord;
    dateContext: AppDateContext;
    devToolsEnabled: boolean;
    scenarios: DevScenarioDefinition[];
  };
  profiles: Array<
    ProfileRecord & {
      email: string;
      messages: MotivationalMessageRecord[];
    }
  >;
  weightEntries: Array<
    WeightEntryRecord & {
      first_name: string;
      slug: PersonSlug;
    }
  >;
}

export interface WeightMutationResponse {
  success: boolean;
  participant: PersonSlug;
  entryDate: string;
  weightKg: number;
  motivationalMessage: string | null;
}

export interface AppDateContext {
  currentDate: string;
  systemDate: string;
  simulatedDate: string | null;
  isSimulated: boolean;
  source: "system" | "env" | "admin";
}

export type DevFrequencyMode = "daily" | "partial" | "gaps";
export type DevTrendMode = "realistic" | "behind" | "ahead" | "flat";
export type OverwriteMode = "replace" | "ignore";

export interface DevGenerateRequest {
  startDate: string;
  endDate: string;
  frequency: DevFrequencyMode;
  trend: DevTrendMode;
  overwriteMode: OverwriteMode;
  includeNoise: boolean;
  includeMissingDays: boolean;
  scenarioKey?: string | null;
}

export interface DevScenarioDefinition {
  key: string;
  title: string;
  description: string;
}

export interface DevEmailDryRunItem {
  profileSlug: PersonSlug;
  firstName: string;
  to: string;
  subject: string;
  reason: string;
  html: string;
}

export interface DevSnapshot {
  exportedAt: string;
  runtimeSettings: AppRuntimeSettingsRecord;
  globalSettings: GlobalSettingsRecord;
  profiles: ProfileRecord[];
  messages: MotivationalMessageRecord[];
  weightEntries: WeightEntryRecord[];
  emailLogs: EmailLogRecord[];
}
