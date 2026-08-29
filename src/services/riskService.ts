import { mockRiskClusters, mockOutlierData, mockRiskTrendData, OutlierPoint } from '../data/mockRiskClusters';
import { Project, RiskCluster } from '../types';
import { projectService } from './projectService';

export interface RiskIntelligenceSummary {
  totalFlagged: number;
  highSeverityCount: number;
  estimatedValueAtRiskCr: number;
  lastScanTime: string;
}

export const riskService = {
  getRiskSummary: async (): Promise<RiskIntelligenceSummary> => {
    return {
      totalFlagged: 142,
      highSeverityCount: 38,
      estimatedValueAtRiskCr: 4.2,
      lastScanTime: '14 mins ago',
    };
  },

  getRiskClusters: async (): Promise<RiskCluster[]> => {
    return [...mockRiskClusters];
  },

  getOutliersData: async (): Promise<OutlierPoint[]> => {
    return [...mockOutlierData];
  },

  getRiskTrendData: async () => {
    return [...mockRiskTrendData];
  },

  getPrioritizationQueue: async (): Promise<Project[]> => {
    const all = await projectService.getAllProjects();
    // Return high risk projects first
    return all.filter((p) => p.riskScore >= 70).sort((a, b) => b.riskScore - a.riskScore);
  },

  runDeepScan: async (): Promise<{ newAnomaliesCount: number; scanDurationMs: number }> => {
    // Simulate real scan delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      newAnomaliesCount: 3,
      scanDurationMs: 1420,
    };
  },
};
