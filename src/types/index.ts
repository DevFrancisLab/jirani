export type DevelopmentType = "Mixed-use" | "Residential" | "Commercial";
export type DevelopmentStage =
  | "Proposed"
  | "Approved"
  | "Construction"
  | "Completed";
export type ConcernCategory =
  | "Traffic"
  | "Water / Sewer"
  | "Drainage"
  | "Environment"
  | "Other";
export type ConcernStatus = "Open" | "Recurring" | "Aggregated";
export type ParticipationStatus = "Active" | "Monitoring" | "Limited";
export type MapLayerFilter =
  | "all"
  | "developments"
  | "Traffic"
  | "Water / Sewer"
  | "Drainage"
  | "Environment";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ConcernBreakdown {
  category: ConcernCategory;
  count: number;
}

export interface Development {
  id: string;
  name: string;
  location: string;
  coordinates: Coordinates;
  type: DevelopmentType;
  stage: DevelopmentStage;
  responseCount: number;
  concernBreakdown: ConcernBreakdown[];
  lastUpdated: string;
  participationStatus: ParticipationStatus;
  summary: string;
}

export interface Concern {
  id: string;
  category: ConcernCategory;
  developmentId: string;
  location: string;
  createdAt: string;
  status: ConcernStatus;
  relatedConcernCount: number;
  buildingCount: number;
  excerpt: string;
  coordinates: Coordinates;
}

export interface ConcernCluster {
  id: string;
  category: Exclude<ConcernCategory, "Other"> | ConcernCategory;
  coordinates: Coordinates;
  relatedConcernCount: number;
  developmentId?: string;
  location: string;
}

export interface Hotspot {
  id: string;
  name: string;
  category: ConcernCategory;
  coordinates: Coordinates;
  relatedConcernCount: number;
  buildingCount: number;
  developmentIds: string[];
  description: string;
}

export interface OverviewMetrics {
  activeDevelopments: number;
  communityResponses: number;
  recurringConcerns: number;
  potentialHotspots: number;
}

export interface TimeSeriesPoint {
  month: string;
  count: number;
}

export interface InsightPattern {
  id: string;
  title: string;
  category: ConcernCategory;
  relatedConcernCount: number;
  buildingCount: number;
  description: string;
}

export interface InsightsData {
  topCategories: ConcernBreakdown[];
  concernsOverTime: TimeSeriesPoint[];
  buildingsRepresented: number;
  developmentsRepresented: number;
  emergingPatterns: InsightPattern[];
  aiInsight: string;
}

export interface Report {
  id: string;
  title: string;
  period: string;
  area: string;
  summary: string;
  includes: string[];
  generatedAt: string;
}

export interface ReportPacket {
  report: Report;
  metrics: OverviewMetrics;
  concernBreakdown: ConcernBreakdown[];
  developments: Development[];
  hotspots: Hotspot[];
  insights: InsightsData;
  sampleConcerns: Concern[];
}

export interface OrganizationProfile {
  name: string;
  product: string;
  area: string;
  contactEmail: string;
  focus: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
}

export interface NotificationPreferences {
  weeklyDigest: boolean;
  emergingPatterns: boolean;
  newDevelopments: boolean;
}

export interface ReportingPreferences {
  defaultPeriod: "monthly" | "quarterly";
  includeMap: boolean;
  includeAiSummary: boolean;
}

export interface SettingsData {
  organization: OrganizationProfile;
  team: TeamMember[];
  notifications: NotificationPreferences;
  reporting: ReportingPreferences;
}

export interface OverviewData {
  metrics: OverviewMetrics;
  concernBreakdown: ConcernBreakdown[];
  recentDevelopments: Development[];
  emergingPatterns: Hotspot[];
}

export interface DevelopmentFilters {
  search?: string;
  type?: DevelopmentType | "all";
  stage?: DevelopmentStage | "all";
}

export interface ConcernFilters {
  search?: string;
  category?: ConcernCategory | "all";
  developmentId?: string | "all";
  location?: string | "all";
  status?: ConcernStatus | "all";
  date?: string | "all";
}

export interface MapSelection {
  kind: "development" | "hotspot" | "cluster";
  id: string;
}
