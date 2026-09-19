import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OverviewPage } from "@/pages/OverviewPage";
import { DevelopmentsPage } from "@/pages/DevelopmentsPage";
import { DevelopmentDetailPage } from "@/pages/DevelopmentDetailPage";
import { ConcernsPage } from "@/pages/ConcernsPage";
import { MapPage } from "@/pages/MapPage";
import { InsightsPage } from "@/pages/InsightsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { ReportDetailPage } from "@/pages/ReportDetailPage";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/developments" element={<DevelopmentsPage />} />
        <Route path="/developments/:id" element={<DevelopmentDetailPage />} />
        <Route path="/concerns" element={<ConcernsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/reports/:id" element={<ReportDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  );
}
