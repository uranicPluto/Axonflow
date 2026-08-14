/**
 * Phase 20 — Feature 7: Strategic Priority Engine
 * Manages Company Objectives, Quarterly Goals, and OKRs, ranking strategic priorities into a unified PriorityRoadmap.
 */

export interface StrategicObjective {
  id: string;
  title: string;
  quarter: string;
  targetValue: string;
  currentValue: string;
  status: "on_track" | "watch" | "at_risk";
  impactScore: number;
}

export interface PriorityRoadmap {
  objectives: StrategicObjective[];
  topPriorityTitle: string;
  completionProgress: number; // %
}

export function getStrategicRoadmap(): PriorityRoadmap {
  const objectives: StrategicObjective[] = [
    {
      id: "obj-001",
      title: "Scale ARR to $1.2M Target",
      quarter: "Q4 2026",
      targetValue: "$1,200,000 ARR",
      currentValue: "$750,000 ARR",
      status: "on_track",
      impactScore: 98
    },
    {
      id: "obj-002",
      title: "Maintain Company Gross Margin >= 85%",
      quarter: "Q4 2026",
      targetValue: "85.0% Gross Margin",
      currentValue: "87.5% Gross Margin",
      status: "on_track",
      impactScore: 95
    },
    {
      id: "obj-003",
      title: "Zero Customer Churn Rate",
      quarter: "Q4 2026",
      targetValue: "0% Churn Rate",
      currentValue: "0% Churn Rate",
      status: "on_track",
      impactScore: 92
    }
  ];

  return {
    objectives,
    topPriorityTitle: "Scale ARR to $1.2M Target",
    completionProgress: 68
  };
}
