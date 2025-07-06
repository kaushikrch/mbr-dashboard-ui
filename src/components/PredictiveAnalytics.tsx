import React, { useState, useEffect } from "react";
import {
  ComposedChart, Line, Area, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Badge, Card, CardHeader, CardBody,
  Tabs, TabList, Tab, TabsContent,
  Label, Select, SelectTrigger, SelectValue,
  Slider, Button, ScrollArea
} from "your-ui-library"; // ← adjust to your actual UI package

const API_BASE = process.env.REACT_APP_API_BASE!;

const PredictiveAnalytics: React.FC = () => {
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [forecastData,   setForecastData]   = useState<any[]>([]);
  const [alerts,         setAlerts]         = useState<any[]>([]);
  // … other state like scenarios, drivers …

  useEffect(() => {
    const runDate = new Date().toISOString().slice(0,10);

    // 1) Fetch curated KPI JSON
    fetch(`${API_BASE}/curated/dcom/date=${runDate}/curated.json`)
      .then(r => r.json())
      .then(data => {
        // split first 6 vs last 6 records for historical vs forecast
        const hist = data.slice(0,6).map((d:any) => ({
          period: d.date, actual: d.nsv, forecast: d.target_nsv
        }));
        const fc = data.slice(-6).map((d:any) => ({
          period: d.date,
          forecast: d.nsv,
          confidence_upper: d.nsv * 1.05,
          confidence_lower: d.nsv * 0.95,
          scenario: d.nsv
        }));
        setHistoricalData(hist);
        setForecastData(fc);
      })
      .catch(console.error);

    // 2) (Optional) Fetch alerts from DQ logs or anomaly endpoint
    fetch(`${API_BASE}/dq_logs/date=${runDate}/dq_log.json`)
      .then(r => r.json())
      .then(log => {
        // for example, turn rows with null_pct > threshold into warnings
        const newAlerts = Object.entries(log)
          .filter(([k,v]) => k.endsWith("_null_pct") && v > 0.05)
          .map(([k,v]) => ({
            message: `${k.replace("_null_pct","")} has ${Math.round(v*100)}% nulls`,
            impact: "Medium",
            confidence: `${Math.round((1-v)*100)}%`,
          }));
        setAlerts(newAlerts);
      })
      .catch(() => setAlerts([]));
  }, []);

  return (
    <div className="space-y-3 max-w-7xl mx-auto h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Predictive Analytics</h1>
      </div>

      {/* Charts */}
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
              <Area dataKey="confidence_upper" fill="#E5E7EB" stroke="none" />
              <Area dataKey="confidence_lower" fill="#FFFFFF" stroke="none" />
              <Line dataKey="actual" stroke="#1F2937" dot />
              <Line dataKey="forecast" stroke="#D22630" strokeDasharray="5 5" dot />
              <Line dataKey="scenario" stroke="#FF6B35" dot />
            </ComposedChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader><h3>Data Quality Alerts</h3></CardHeader>
        <CardBody>
          <ScrollArea className="h-48">
            {alerts.map((a, i) => (
              <div key={i} className="p-2 border-b">
                <p className="text-sm">{a.message}</p>
                <p className="text-xs text-gray-500">Impact: {a.impact}, Confidence: {a.confidence}</p>
              </div>
            ))}
          </ScrollArea>
        </CardBody>
      </Card>
    </div>
  );
};

export default PredictiveAnalytics;
