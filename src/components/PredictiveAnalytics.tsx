import React, { useState, useEffect } from "react";
import {
  ComposedChart, Line, Area, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Badge, Card, CardHeader, CardBody,
  Tabs, TabsList, TabsContent,
  Select, SelectTrigger, Box
} from "@chakra-ui/react";

const API_BASE = process.env.REACT_APP_API_BASE!;

// Alert interface
interface Alert {
  message: string;
  impact: string;
  confidence: string;
}

const PredictiveAnalytics: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [forecastData,   setForecastData]   = useState<any[]>([]);
  const [alerts,         setAlerts]         = useState<Alert[]>([]);

  useEffect(() => {
    const runDate = new Date().toISOString().slice(0, 10);

    // … your first fetch unchanged …

    // 2) Fetch & safely narrow your DQ‐log entries
    fetch(`${API_BASE}/dq_logs/date=${runDate}/dq_log.json`)
      .then(r => r.json())
      .then((logData: unknown) => {
        // Turn unknown into an array of [key, unknown]
        const entries = Object.entries(logData as Record<string, unknown>);

        // First filter: only the keys we care about, *and* ensure the value is a number > 0.05
        const numericNullPctEntries = entries.filter(
          (entry): entry is [string, number] =>
            entry[0].endsWith("_null_pct") &&
            typeof entry[1] === "number" &&
            entry[1] > 0.05
        );

        // Now TS knows each entry[1] is a number
        const newAlerts: Alert[] = numericNullPctEntries.map(([key, value]) => ({
          message: `${key.replace("_null_pct", "")} has ${Math.round(value * 100)}% nulls`,
          impact: "Medium",
          confidence: `${Math.round((1 - value) * 100)}%`,
        }));

        setAlerts(newAlerts);
      })
      .catch(() => setAlerts([]));
  }, []);

  return (
    <div className="space-y-3 max-w-7xl mx-auto h-full overflow-hidden">
      {/* ... rest of your JSX ... */}
    </div>
  );
};

export default PredictiveAnalytics;
