import {
  concernBreakdown,
  concernClusters,
  concerns,
  developments,
  hotspots,
  insights,
  locations,
  overviewMetrics,
  reports,
  settings,
} from "@/data/mock";
import type {
  Concern,
  ConcernCluster,
  ConcernFilters,
  Development,
  DevelopmentFilters,
  Hotspot,
  InsightsData,
  OverviewData,
  Report,
  ReportPacket,
  SettingsData,
} from "@/types";

const LATENCY_MS = 280;

function wait(ms = LATENCY_MS): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function matchesDevelopment(
  development: Development,
  filters: DevelopmentFilters,
): boolean {
  const search = filters.search?.trim().toLowerCase() ?? "";
  const matchesSearch =
    search.length === 0 ||
    development.name.toLowerCase().includes(search) ||
    development.location.toLowerCase().includes(search) ||
    development.type.toLowerCase().includes(search);
  const matchesType =
    !filters.type || filters.type === "all" || development.type === filters.type;
  const matchesStage =
    !filters.stage ||
    filters.stage === "all" ||
    development.stage === filters.stage;
  return matchesSearch && matchesType && matchesStage;
}

function matchesConcern(concern: Concern, filters: ConcernFilters): boolean {
  const search = filters.search?.trim().toLowerCase() ?? "";
  const matchesSearch =
    search.length === 0 ||
    concern.excerpt.toLowerCase().includes(search) ||
    concern.category.toLowerCase().includes(search) ||
    concern.location.toLowerCase().includes(search);
  const matchesCategory =
    !filters.category ||
    filters.category === "all" ||
    concern.category === filters.category;
  const matchesDevelopment =
    !filters.developmentId ||
    filters.developmentId === "all" ||
    concern.developmentId === filters.developmentId;
  const matchesLocation =
    !filters.location ||
    filters.location === "all" ||
    concern.location === filters.location;
  const matchesStatus =
    !filters.status ||
    filters.status === "all" ||
    concern.status === filters.status;
  const matchesDate =
    !filters.date ||
    filters.date === "all" ||
    concern.createdAt.startsWith(filters.date);
  return (
    matchesSearch &&
    matchesCategory &&
    matchesDevelopment &&
    matchesLocation &&
    matchesStatus &&
    matchesDate
  );
}

export const dashboardService = {
  async getOverview(): Promise<OverviewData> {
    await wait();
    return {
      metrics: overviewMetrics,
      concernBreakdown,
      recentDevelopments: developments.slice(0, 6),
      emergingPatterns: hotspots.slice(0, 3),
    };
  },

  async getDevelopments(filters: DevelopmentFilters = {}): Promise<Development[]> {
    await wait();
    return developments.filter((item) => matchesDevelopment(item, filters));
  },

  async getDevelopment(id: string): Promise<Development | null> {
    await wait();
    return developments.find((item) => item.id === id) ?? null;
  },

  async getConcerns(filters: ConcernFilters = {}): Promise<Concern[]> {
    await wait();
    return concerns.filter((item) => matchesConcern(item, filters));
  },

  async getConcern(id: string): Promise<Concern | null> {
    await wait();
    return concerns.find((item) => item.id === id) ?? null;
  },

  async getHotspots(): Promise<Hotspot[]> {
    await wait();
    return hotspots;
  },

  async getHotspot(id: string): Promise<Hotspot | null> {
    await wait();
    return hotspots.find((item) => item.id === id) ?? null;
  },

  async getConcernClusters(): Promise<ConcernCluster[]> {
    await wait();
    return concernClusters;
  },

  async getMapData(): Promise<{
    developments: Development[];
    hotspots: Hotspot[];
    clusters: ConcernCluster[];
  }> {
    await wait(220);
    return {
      developments,
      hotspots,
      clusters: concernClusters,
    };
  },

  async getInsights(): Promise<InsightsData> {
    await wait();
    return insights;
  },

  async getReports(): Promise<Report[]> {
    await wait();
    return reports;
  },

  async getReport(id: string): Promise<Report | null> {
    await wait();
    return reports.find((item) => item.id === id) ?? null;
  },

  async getReportPacket(id: string): Promise<ReportPacket | null> {
    await wait(120);
    const report = reports.find((item) => item.id === id);
    if (!report) return null;
    return {
      report,
      metrics: overviewMetrics,
      concernBreakdown,
      developments,
      hotspots,
      insights,
      sampleConcerns: concerns
        .filter((item) => item.status === "Recurring")
        .slice(0, 3),
    };
  },

  async getSettings(): Promise<SettingsData> {
    await wait();
    return structuredClone(settings);
  },

  async getLocations(): Promise<string[]> {
    await wait(80);
    return locations;
  },
};
