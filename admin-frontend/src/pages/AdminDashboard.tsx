import { useEffect, useState } from "react";
import {
  Activity,
  Cpu,
  HardDrive,
  Database,
  Brain,
  RefreshCw,
  LogOut,
  MemoryStick,
} from "lucide-react";

import {
  getSystemStatus,
  getAIMonitoring,
  getDatabaseStatus,
  getApplicationLogs,
  adminLogout,
} from "../services/adminService";

function AdminDashboard() {
  const [system, setSystem] = useState<any>(null);
  const [ai, setAI] = useState<any>(null);
  const [database, setDatabase] = useState<any>(null);
  const [logs, setLogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMonitoringData = async () => {
    try {
      setError("");

      const [systemData, aiData, databaseData, logsData] =
        await Promise.all([
          getSystemStatus(),
          getAIMonitoring(),
          getDatabaseStatus(),
          getApplicationLogs(),
        ]);

      setSystem(systemData);
      setAI(aiData.ai_monitoring);
      setDatabase(databaseData);
      setLogs(logsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load monitoring data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonitoringData();

    const interval = setInterval(loadMonitoringData, 10000);

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({
    title,
    value,
    icon,
    description,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    description: string;
  }) => (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <span>{description}</span>
      </div>
    </div>
  );

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">

      <header className="dashboard-header">
        <div>
          <h1>System Monitoring</h1>
          <p>TripPlanner AI administration dashboard</p>
        </div>

        <div className="dashboard-actions">
          <button onClick={loadMonitoringData}>
            <RefreshCw size={17} />
            Refresh
          </button>

          <button onClick={adminLogout}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      {error && (
        <div className="dashboard-error">{error}</div>
      )}

      <section className="dashboard-grid">

        <StatCard
          title="CPU Usage"
          value={`${system?.cpu?.usage_percent ?? 0}%`}
          icon={<Cpu />}
          description="Processor usage"
        />

        <StatCard
          title="Memory Usage"
          value={`${system?.memory?.usage_percent ?? 0}%`}
          icon={<MemoryStick />}
          description={`${system?.memory?.used_gb ?? 0} GB used`}
        />

        <StatCard
          title="Disk Usage"
          value={`${system?.disk?.usage_percent ?? 0}%`}
          icon={<HardDrive />}
          description={`${system?.disk?.used_gb ?? 0} GB used`}
        />

        <StatCard
          title="AI Requests"
          value={`${ai?.total_requests ?? 0}`}
          icon={<Brain />}
          description="Total AI requests"
        />

      </section>

      <section className="dashboard-grid">

        <div className="monitor-panel">
          <h2>
            <Activity size={20} />
            AI Performance
          </h2>

          <p>Successful requests: {ai?.successful_requests ?? 0}</p>
          <p>Failed requests: {ai?.failed_requests ?? 0}</p>
          <p>Average response time: {ai?.average_response_time ?? 0} seconds</p>
        </div>

        <div className="monitor-panel">
          <h2>
            <Database size={20} />
            Database Status
          </h2>

          <div className={
            database?.healthy ? "status-connected" : "status-disconnected"
          }>
            {database?.status ?? "Unknown"}
          </div>

          <p>Database: {database?.database ?? "PostgreSQL"}</p>
        </div>

      </section>

      <section className="monitor-panel logs-panel">
        <h2>Application Logs</h2>

        {logs?.logs?.length > 0 ? (
          logs.logs.map((log: string, index: number) => (
            <div className="log-item" key={index}>
              {log}
            </div>
          ))
        ) : (
          <p>No application logs available.</p>
        )}
      </section>

    </div>
  );
}

export default AdminDashboard;