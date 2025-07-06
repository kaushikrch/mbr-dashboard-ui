// src/components/PredictiveAnalytics.tsx
import React, { useState, useEffect } from "react";
import { 
  Card, CardHeader, CardContent, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button }       from "@/components/ui/button";
import { Badge }        from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider }       from "@/components/ui/slider";
import { Label }        from "@/components/ui/label";
import { ScrollArea }   from "@/components/ui/scroll-area";

import {
  TrendingUp, Target, AlertTriangle, Zap,
  Brain, Play, Settings
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from "recharts";

// helper: last N dates as YYYY-MM-DD
const lastNDates = (n: number) => {
  const today = new Date();
  return Array.from({ length: n }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().slice(0,10);
  });
};

// color palette for Pie
const COLORS = ["#D22630", "#3182ce", "#38a169", "#dd6b20", "#805ad5"];

const PredictiveAnalytics: React.FC = () => {
  const API = process.env.REACT_APP_API_BASE!; // e.g. https://…/json
  const [brand, setBrand]   = useState("all");
  const [mediaSpend, setMediaSpend]   = useState([0]);
  const [priceChange, setPriceChange] = useState([0]);

  // our dynamic state
  const [dailyData,       setDailyData]       = useState<{period:string; nsv:number}[]>([]);
  const [wowGrowth,       setWowGrowth]       = useState<number| null>(null);
  const [marketShareData, setMarketShareData] = useState<{name:string;value:number}[]>([]);
  const [retailerData,    setRetailerData]    = useState<{retailer:string;nsv:number}[]>([]);
  const [digitalData,     setDigitalData]     = useState<{period:string;penetration:number}[]>([]);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);

      // --- 1) Fetch 91-day daily NSV (filtered by brand) ---
      const dates = lastNDates(91);
      const raw = await Promise.all(dates.map(async date => {
        try {
          const res = await fetch(`${API}/curated/dcom/date=${date}/curated.json`);
          if (!res.ok) return null;
          const rows: any[] = await res.json();
          const filtered = brand === "all"
            ? rows
            : rows.filter(r => r.brand.toLowerCase() === brand);
          const total = filtered.reduce((sum,r) => sum + (r.nsv||0), 0);
          return { period: date, nsv: total };
        } catch {
          return null;
        }
      }));
      const clean = raw.filter((x): x is {period:string;nsv:number} => !!x);
      setDailyData(clean);

      // --- 2) Compute WoW growth ---
      if (clean.length > 7) {
        const last    = clean[clean.length-1].nsv;
        const weekAgo = clean[clean.length-8].nsv;
        setWowGrowth( weekAgo>0 ? (last-weekAgo)/weekAgo*100 : null );
      }

      // --- 3) Market share & retailer perf (based on last date) ---
      if (clean.length) {
        const lastDate = clean[clean.length-1].period;
        const res      = await fetch(`${API}/curated/dcom/date=${lastDate}/curated.json`);
        if (res.ok) {
          const rows: any[] = await res.json();
          // brand totals
          const bt: Record<string,number> = {};
          rows.forEach(r => bt[r.brand] = (bt[r.brand]||0) + r.nsv);
          const total = Object.values(bt).reduce((a,b) => a+b, 0) || 1;
          setMarketShareData(
            Object.entries(bt).map(([name,value]) => ({
              name, value: (value/total)*100
            }))
          );
          // retailer totals
          const rt: Record<string,number> = {};
          rows.forEach(r => rt[r.retailer] = (rt[r.retailer]||0) + r.nsv);
          setRetailerData(
            Object.entries(rt).map(([retailer,nsv]) => ({ retailer, nsv }))
          );
        }
      }

      // --- 4) Digital penetration (per day) ---
      const dig = await Promise.all(dates.map(async date => {
        try {
          const res = await fetch(`${API}/curated/dcom/date=${date}/curated.json`);
          if (!res.ok) return null;
          const rows: any[] = await res.json();
          // assume each row has r.channel === 'digital' or 'offline'
          const digitalSum = rows.filter(r=>r.channel==="digital")
                                 .reduce((s,r)=>s+(r.nsv||0),0);
          const totalSum   = rows.reduce((s,r)=>s+(r.nsv||0),0) || 1;
          return { period: date, penetration: digitalSum/totalSum*100 };
        } catch {
          return null;
        }
      }));
      setDigitalData(dig.filter((x): x is {period:string;penetration:number} => !!x));

      setLoading(false);
    }

    loadAll();
  }, [brand, API]);

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-4">
      {/* ===== Header & Summary Badges ===== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Predictive Analytics</h1>
          <p className="text-sm text-gray-600">91-day NSV, market share & more</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {loading
            ? <Badge>Loading…</Badge>
            : <>
                <Badge>
                  Today NSV: ${dailyData.at(-1)?.nsv.toLocaleString()}M
                </Badge>
                <Badge variant={wowGrowth!>=0?"success":"destructive"}>
                  WoW Growth: {wowGrowth?.toFixed(1)}%
                </Badge>
              </>
          }
          <Badge variant="outline">
            <Brain size={14} className="inline-block mr-1"/> ML Models
          </Badge>
          <Badge variant="outline">
            <Target size={14} className="inline-block mr-1"/> 87% Conf.
          </Badge>
        </div>
      </div>

      {/* ===== Top-Level Tabs ===== */}
      <Tabs defaultValue="trend" className="space-y-4">
        <TabsList className="grid grid-cols-7">
          <TabsTrigger value="trend">Trend</TabsTrigger>
          <TabsTrigger value="market">Market Share</TabsTrigger>
          <TabsTrigger value="retailer">Retailer</TabsTrigger>
          <TabsTrigger value="digital">Digital Penetration</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>

        {/* --- Trend: Daily NSV Line Chart --- */}
        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>NSV – Last 91 Days</CardTitle>
              <CardDescription className="text-xs">
                {brand==="all"? "All Brands" : brand} Daily NSV
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v:number) => `$${v.toLocaleString()}M`} />
                  <Line dataKey="nsv" stroke="#D22630" strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Market Share: Pie Chart --- */}
        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>Market Share (Last Day)</CardTitle>
              <CardDescription className="text-xs">
                Brand share of NSV on most recent date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    nameKey="name"
                    data={marketShareData}
                    outerRadius={100}
                    label
                  >
                    {marketShareData.map((_,i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Retailer Performance: Bar Chart --- */}
        <TabsContent value="retailer">
          <Card>
            <CardHeader>
              <CardTitle>Retailer Performance</CardTitle>
              <CardDescription className="text-xs">
                NSV by retailer (last day)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={retailerData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="retailer" />
                  <YAxis />
                  <Tooltip formatter={(v:number) => `$${v.toLocaleString()}M`}/>
                  <Bar dataKey="nsv" fill="#3182ce" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Digital Penetration: Line Chart --- */}
        <TabsContent value="digital">
          <Card>
            <CardHeader>
              <CardTitle>Digital Penetration</CardTitle>
              <CardDescription className="text-xs">
                % of NSV attributed to digital channel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={digitalData}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="period"/>
                  <YAxis unit="%" />
                  <Tooltip formatter={(v:number) => `${v.toFixed(1)}%`} />
                  <Line dataKey="penetration" stroke="#805ad5" strokeWidth={2} dot={false}/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Scenarios, Alerts & Controls remain exactly as before --- */}
        <TabsContent value="scenarios">
          {/* … your existing scenarios cards … */}
        </TabsContent>
        <TabsContent value="alerts">
          <ScrollArea className="h-80">
            {/* … your existing alerts list … */}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="controls">
          {/* … your existing controls panel … */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PredictiveAnalytics;
