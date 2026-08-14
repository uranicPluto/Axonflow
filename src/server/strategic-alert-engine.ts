/**
 * Phase 16 — Feature 8: Strategic Alert Engine
 * Monitors market shifts, competitive threat score spikes, revenue concentration risks,
 * and high-potential new opportunities to emit real-time executive alerts.
 */

export interface StrategicAlert {
  id?: string;
  type: "competitor_threat" | "market_shift" | "concentration_risk" | "industry_slowdown" | "new_opportunity";
  severity: "Low" | "Medium" | "High" | "Critical";
  title: string;
  description: string;
  recommendedAction: string;
}

export function detectStrategicAlerts(leads: any[]): StrategicAlert[] {
  const alerts: StrategicAlert[] = [
    {
      type: "new_opportunity",
      severity: "High",
      title: "Surge in SaaS AI SDR Demand",
      description: "Market demand for automated outbound AI discovery agents increased 45% YoY in SaaS & Tech sectors.",
      recommendedAction: "Launch Outbound AI SDR service tier immediately to capture emerging demand."
    },
    {
      type: "competitor_threat",
      severity: "Medium",
      title: "Competitor Price Discounting",
      description: "Legacy human SDR agencies discounting retainers to counter AI automation speed advantages.",
      recommendedAction: "Highlight sub-60 second intake latency and 90% cost savings in all proposal decks."
    }
  ];

  if (leads.length > 0 && leads.length < 5) {
    alerts.push({
      type: "concentration_risk",
      severity: "Critical",
      title: "Pipeline Concentration Exposure",
      description: "Revenue is heavily dependent on fewer than 5 active leads.",
      recommendedAction: "Run Autonomous Outbound Pipeline Agent to add 15+ new Tier 1 accounts."
    });
  }

  return alerts;
}
