import React, { useState, useEffect } from "react";
import {
  ComposedChart,
  Line,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Box, Card, CardHeader, CardBody } from "@chakra-ui/react";

const API_BASE = process.env.REACT_APP_API_BASE!;

// Alert interface
interface Alert {
  message: string;
  impact: string;
  confidence: string;
}

const PredictiveAnalytics: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const runDate = new Date().toISOString().slice(0, 10);

    // 1) Fetch KPI data
    fetch(`${API_BASE}/curated/dcom/date=${runDate}/curated.json`)
      .then((r) => r.json())
      .then((data: any[]) => {
        const hist = data.slice(0, 6).map((d) => ({
          period: d.date,
          actual: d.nsv,
          forecast: d.target_nsv,
        }));
        const fc = data.slice(-6).map((d) => ({
          period: d.date,
          forecast: d.nsv,
          confidence_upper: d.nsv * 1.05,
          confidence_lower: d.nsv * 0.95,
          scenario: d.nsv,
        }));
        setHistoricalData(hist);
        setForecastData(fc);
      })
      .catch(console.error);

    // 2) Fetch & narrow DQ log entries
    fetch(`${API_BASE}/dq_logs/date=${runDate}/dq_log.json`)
      .then((r) => r.json())
      .then((logData: unknown) => {
        const entries = Object.entries(logData as Record<string, unknown>);

        const numericNullPct = entries.filter(
          (e): e is [string, number] =>
            e[0].endsWith("_null_pct") &&
            typeof e[1] === "number" &&
            e[1] > 0.05
        );

        const newAlerts: Alert[] = numericNullPct.map(([key, value]) => ({
          message: `${key.replace("_null_pct", "")} has ${Math.round(
            value * 100
          )}% nulls`,
          impact: "Medium",
          confidence: `${Math.round((1 - value) * 100)}%`,
        }));

        setAlerts(newAlerts);
      })
      .catch(() => setAlerts([]));
  }, []);

  return (
    <Box className="space-y-3 max-w-7xl mx-auto h-full overflow-hidden">
      {/* NSV Forecast vs Actual Chart */}
      <Card>
        <CardHeader>
          <h2>NSV Forecast vs Actual</h2>
        </CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={[...historicalData, ...forecastData]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Area
                dataKey="confidence_upper"
                fill="#E5E7EB"
                stroke="none"
              />
              <Area
                dataKey="confidence_lower"
                fill="#FFFFFF"
                stroke="none"
              />
              <Line dataKey="actual" stroke="#1F2937" dot />
              <Line
                dataKey="forecast"
                stroke="#D22630"
                strokeDasharray="5 5"
                dot
              />
              <Line dataKey="scenario" stroke="#FF6B35" dot />
            </ComposedChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Data Quality Alerts */}
      <Card>
        <CardHeader>
          <h3>Data Quality Alerts</h3>
        </CardHeader>
        <CardBody>
          <Box maxH="48" overflowY="auto" p={2}>
            {alerts.map((a, i) => (
              <div key={i} className="p-2 border-b">
                <p className="text-sm">{a.message}</p>
                <p className="text-xs text-gray-500">
                  Impact: {a.impact}, Confidence: {a.confidence}
                </p>
              </div>
            ))}
          </Box>
        </CardBody>
      </Card>
    </Box>
  );
};

export default PredictiveAnalytics;
