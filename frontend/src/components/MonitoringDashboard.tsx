import "./MonitoringDashboard.css";
import { useEffect, useState } from "react";
import {
  Activity,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
  RefreshCw,
  Server,
  Bot,
  FileText,
} from "lucide-react";

import {
  getSystemStatus,
  getAIMonitoring,
  getDatabaseStatus,
  getApplicationLogs,
} from "../services/monitoringService";

import type {
  SystemStatus,
  AIMonitoring,
  DatabaseStatus,
  ApplicationLogs,
} from "../services/monitoringService";

function MonitoringDashboard() {
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [ai, setAI] = useState<AIMonitoring | null>(null);
  const [database, setDatabase] = useState<DatabaseStatus | null>(null);
  const [logs, setLogs] = useState<ApplicationLogs | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
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
      setAI(aiData);
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
    fetchDashboardData();

    const interval = setInterval(fetchDashboardData, 10000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="monitor-loading">Loading system monitoring...</div>;
  }

  if (error && !system) {
    return (
      <div className="monitor-error">
        <p>{error}</p>
        <button onClick={fetchDashboardData}>Try Again</button>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="monitor-dashboard">
      <div className="monitor-header">
        <div>
          <h1>
            <Activity size={28} />
            System Monitoring
          </h1>
          <p>Monitor your TripPlanner AI application health.</p>
        </div>

        <button
          className="monitor-refresh"
          onClick={fetchDashboardData}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && <div className="monitor-warning">{error}</div>}

      {/* System Overview */}
      <h2 className="monitor-section-title">
        <Server size={20} />
        System Overview
      </h2>

      <div className="monitor-grid">

        <div className="monitor-card">
          <div className="monitor-card-top">
            <Cpu />
            <span>CPU Usage</span>
          </div>

          <h2>{system?.cpu.usage_percent ?? 0}%</h2>

          <div className="monitor-progress">
            <div
              style={{
                width: `${system?.cpu.usage_percent ?? 0}%`,
              }}
            />
          </div>
        </div>

        <div className="monitor-card">
          <div className="monitor-card-top">
            <MemoryStick />
            <span>RAM Usage</span>
          </div>

          <h2>{system?.memory.usage_percent ?? 0}%</h2>

          <p>
            {system?.memory.used_gb ?? 0} GB /
            {" "}{system?.memory.total_gb ?? 0} GB
          </p>

          <div className="monitor-progress">
            <div
              style={{
                width: `${system?.memory.usage_percent ?? 0}%`,
              }}
            />
          </div>
        </div>

        <div className="monitor-card">
          <div className="monitor-card-top">
            <HardDrive />
            <span>Disk Usage</span>
          </div>

          <h2>{system?.disk.usage_percent ?? 0}%</h2>

          <p>
            {system?.disk.used_gb ?? 0} GB /
            {" "}{system?.disk.total_gb ?? 0} GB
          </p>

          <div className="monitor-progress">
            <div
              style={{
                width: `${system?.disk.usage_percent ?? 0}%`,
              }}
            />
          </div>
        </div>

        <div className="monitor-card">
          <div className="monitor-card-top">
            <Activity />
            <span>Application Uptime</span>
          </div>

          <h2>
            {system ? formatUptime(system.uptime_seconds) : "0h 0m"}
          </h2>

          <p>Since monitoring service started</p>
        </div>

      </div>

      {/* AI Monitoring */}
      <h2 className="monitor-section-title">
        <Bot size={20} />
        AI Assistant Monitoring
      </h2>

      <div className="monitor-grid">

        <div className="monitor-card">
          <span>Total AI Requests</span>
          <h2>{ai?.ai_monitoring.total_requests ?? 0}</h2>
        </div>

        <div className="monitor-card">
          <span>Successful Requests</span>
          <h2>
            {ai?.ai_monitoring.successful_requests ?? 0}
          </h2>
        </div>

        <div className="monitor-card">
          <span>Failed Requests</span>
          <h2>
            {ai?.ai_monitoring.failed_requests ?? 0}
          </h2>
        </div>

        <div className="monitor-card">
          <span>Average Response Time</span>
          <h2>
            {ai?.ai_monitoring.average_response_time ?? 0}s
          </h2>
        </div>

      </div>

      {/* Database Status */}
      <h2 className="monitor-section-title">
        <Database size={20} />
        Database Connection
      </h2>

      <div className="monitor-card database-card">
        <div>
          <h3>PostgreSQL Database</h3>
          <p>TripPlanner AI database connection</p>
        </div>

        <span
          className={
            database?.healthy
              ? "database-connected"
              : "database-disconnected"
          }
        >
          {database?.status ?? "Unknown"}
        </span>
      </div>

      {/* Application Logs */}
      <h2 className="monitor-section-title">
        <FileText size={20} />
        Application Logs
      </h2>

      <div className="monitor-card logs-card">
        <div className="logs-header">
          <h3>Recent Activity</h3>
          <span>{logs?.total_logs ?? 0} logs</span>
        </div>

        {logs?.logs.length ? (
          logs.logs.slice().reverse().map((log, index) => (
            <div className="log-item" key={`${index}-${log}`}>
              {log}
            </div>
          ))
        ) : (
          <p>No application logs available.</p>
        )}
      </div>

    </div>
  );
}

export default MonitoringDashboard;