import { mockStatesData } from '../data/mockStates';
import { projectService } from './projectService';

export interface DashboardStats {
  totalProjects: number;
  totalAllocatedCr: number;
  totalExpenditureCr: number;
  completedCount: number;
  pendingCount: number;
  highRiskCount: number;
  utilizationRatePercent: number;
  completedRatePercent: number;
}

export interface FinancialTrendQuarter {
  quarter: string;
  allocation: number;
  expenditure: number;
}

export interface StatusDistributionItem {
  name: string;
  count: number;
  color: string;
  percent: number;
}

export const dashboardService = {
  getStats: async (stateFilter?: string, districtFilter?: string): Promise<DashboardStats> => {
    // Default national numbers matching screenshot 1 (Total: 4,520, Allocated: ₹12,450 Cr, Exp: ₹9,820 Cr, Completed: 2,100, Pending: 2,420, High-Risk: 124)
    if (!stateFilter || stateFilter === 'All' || stateFilter === 'All States') {
      return {
        totalProjects: 4520,
        totalAllocatedCr: 12450,
        totalExpenditureCr: 9820,
        completedCount: 2100,
        pendingCount: 2420,
        highRiskCount: 124,
        utilizationRatePercent: 78.8,
        completedRatePercent: 46.5,
      };
    }

    const stateObj = mockStatesData.find((s) => s.name.toLowerCase() === stateFilter.toLowerCase());
    if (stateObj) {
      const total = stateObj.totalProjects;
      const completed = Math.round(total * 0.45);
      const pending = total - completed;
      return {
        totalProjects: total,
        totalAllocatedCr: stateObj.allocatedCr,
        totalExpenditureCr: stateObj.expenditureCr,
        completedCount: completed,
        pendingCount: pending,
        highRiskCount: stateObj.highRiskCount,
        utilizationRatePercent: stateObj.utilizationRate,
        completedRatePercent: 45.0,
      };
    }

    return {
      totalProjects: 4520,
      totalAllocatedCr: 12450,
      totalExpenditureCr: 9820,
      completedCount: 2100,
      pendingCount: 2420,
      highRiskCount: 124,
      utilizationRatePercent: 78.8,
      completedRatePercent: 46.5,
    };
  },

  getFinancialTrends: async (): Promise<FinancialTrendQuarter[]> => {
    return [
      { quarter: 'Q1', allocation: 2800, expenditure: 2100 },
      { quarter: 'Q2', allocation: 3100, expenditure: 2450 },
      { quarter: 'Q3', allocation: 3400, expenditure: 2720 },
      { quarter: 'Q4', allocation: 3150, expenditure: 2550 },
      { quarter: "Q1 '24", allocation: 3600, expenditure: 2890 },
    ];
  },

  getStatusDistribution: async (): Promise<StatusDistributionItem[]> => {
    return [
      { name: 'Completed', count: 2100, color: '#10B981', percent: 46.5 },
      { name: 'Ongoing', count: 1580, color: '#1E293B', percent: 35.0 },
      { name: 'Sanctioned', count: 680, color: '#F59E0B', percent: 15.0 },
      { name: 'Proposed', count: 160, color: '#94A3B8', percent: 3.5 },
    ];
  },
};
