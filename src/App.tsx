/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./lib/auth";
import { Layout } from "./components/Layout";
import { MySchedule } from "./pages/MySchedule";
import { DailyManifest } from "./pages/DailyManifest";

function AppContent() {
  const { appUser } = useAuth();
  const [activeTab, setActiveTab] = useState("my-schedule");

  // set default tab based on role
  useEffect(() => {
    if (appUser?.role === "driver") {
      setActiveTab("daily-manifest");
    } else {
      setActiveTab("my-schedule");
    }
  }, [appUser]);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "my-schedule" && appUser?.role !== "driver" ? <MySchedule /> : null}
      {activeTab === "daily-manifest" && (appUser?.role === "driver" || appUser?.role === "admin") ? <DailyManifest /> : null}
      {activeTab === "my-schedule" && appUser?.role === "driver" && <DailyManifest /> /* Fallback */}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

