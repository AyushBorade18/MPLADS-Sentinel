import { RiskCluster } from '../types';

export const mockRiskClusters: RiskCluster[] = [
  {
    id: 'cluster-1',
    title: 'Vendor Concentration',
    description: '74% of road repair contracts in District A awarded to single entity.',
    severity: 'High Severity',
    affectedProjectsCount: 14,
    category: 'vendor',
    districtOrState: 'Gorakhpur, UP',
  },
  {
    id: 'cluster-2',
    title: 'Equipment Cost Variance',
    description: 'Solar panel procurement costs +42% above state average.',
    severity: 'Med Severity',
    affectedProjectsCount: 8,
    category: 'cost',
    districtOrState: 'Baramati, MH',
  },
  {
    id: 'cluster-3',
    title: 'Timeline Discrepancy',
    description: '12 projects reporting 100% fund utilization with <20% physical progress.',
    severity: 'Med Severity',
    affectedProjectsCount: 12,
    category: 'timeline',
    districtOrState: 'Patna, BR',
  },
  {
    id: 'cluster-4',
    title: 'Geotagging Anomaly Cluster',
    description: 'Multiple projects reporting duplicate GPS coordinates for disparate civil works.',
    severity: 'Med Severity',
    affectedProjectsCount: 6,
    category: 'geotag',
    districtOrState: 'Bengaluru Rural, KA',
  }
];

export interface OutlierPoint {
  id: string;
  projectId: string;
  projectName: string;
  progressPercent: number;
  fundsReleasedPercent: number;
  expenditureLakhs: number;
  riskType: 'high_risk' | 'flagged' | 'normal';
}

export const mockOutlierData: OutlierPoint[] = [
  { id: '1', projectId: 'PRJ-2023-4921', projectName: 'Ward 12 PHC', progressPercent: 22, fundsReleasedPercent: 78, expenditureLakhs: 18.45, riskType: 'high_risk' },
  { id: '2', projectId: 'PRJ-2938', projectName: 'Skill Center Patna', progressPercent: 18, fundsReleasedPercent: 88, expenditureLakhs: 58.20, riskType: 'high_risk' },
  { id: '3', projectId: 'PRJ-8475', projectName: 'Fish Landing Jetty', progressPercent: 30, fundsReleasedPercent: 82, expenditureLakhs: 68.00, riskType: 'high_risk' },
  { id: '4', projectId: 'PRJ-24-0891', projectName: 'Solar Street Lights', progressPercent: 15, fundsReleasedPercent: 65, expenditureLakhs: 10.00, riskType: 'high_risk' },
  { id: '5', projectId: 'PRJ-7721', projectName: 'Solid Waste Unit', progressPercent: 85, fundsReleasedPercent: 18, expenditureLakhs: 20.00, riskType: 'flagged' },
  { id: '6', projectId: 'PRJ-3310', projectName: 'Mobile Medical Vans', progressPercent: 90, fundsReleasedPercent: 24, expenditureLakhs: 42.50, riskType: 'flagged' },
  { id: '7', projectId: 'PRJ-24-1042', projectName: 'Rural Road NH-24', progressPercent: 62, fundsReleasedPercent: 68, expenditureLakhs: 85.50, riskType: 'normal' },
  { id: '8', projectId: 'PRJ-23-2105', projectName: 'PHC Equipment', progressPercent: 100, fundsReleasedPercent: 100, expenditureLakhs: 80.00, riskType: 'normal' },
  { id: '9', projectId: 'PRJ-23-9912', projectName: 'Drip Irrigation Dam', progressPercent: 95, fundsReleasedPercent: 98, expenditureLakhs: 108.50, riskType: 'normal' },
  { id: '10', projectId: 'PRJ-24-0512', projectName: 'Cyclone Shelter', progressPercent: 70, fundsReleasedPercent: 72, expenditureLakhs: 92.00, riskType: 'normal' },
];

export const mockRiskTrendData = [
  { day: 'Day 1', anomalies: 4 },
  { day: 'Day 5', anomalies: 6 },
  { day: 'Day 10', anomalies: 14 },
  { day: 'Day 15', anomalies: 22 },
  { day: 'Day 20', anomalies: 12 },
  { day: 'Day 25', anomalies: 16 },
  { day: 'Day 30', anomalies: 28 },
];
