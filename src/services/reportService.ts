import { ReportItem } from '../types';
import { mockReportsList } from '../data/mockReports';

let reportsStore: ReportItem[] = [...mockReportsList];

export interface GenerateReportParams {
  category: string;
  financialYear: string;
  state: string;
  district?: string;
  format: 'PDF' | 'XLSX' | 'CSV';
  includeAnomalies: boolean;
  includeGeotagEvidence: boolean;
}

export const reportService = {
  getRecentReports: async (): Promise<ReportItem[]> => {
    return [...reportsStore];
  },

  generateReport: async (params: GenerateReportParams): Promise<ReportItem> => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const newReport: ReportItem = {
      id: `REP-${new Date().getFullYear()}-${String(reportsStore.length + 1).padStart(3, '0')}`,
      title: `${params.category} - ${params.state} (${params.financialYear})`,
      category: params.category,
      generatedDate: new Date().toISOString().split('T')[0],
      financialYear: params.financialYear,
      state: params.state,
      status: 'Ready',
      fileSize: `${(Math.random() * 3 + 1.2).toFixed(1)} MB`,
      format: params.format,
      description: `Targeted audit synthesis covering ${params.state} including ${params.includeAnomalies ? 'flagged anomaly clusters, ' : ''}${params.includeGeotagEvidence ? 'geotagged inspection logs, ' : ''}and fund utilization ledgers.`,
    };

    reportsStore = [newReport, ...reportsStore];
    return newReport;
  },

  downloadReport: async (reportId: string): Promise<string> => {
    const report = reportsStore.find((r) => r.id === reportId);
    if (!report) throw new Error('Report not found');
    
    // Simulate real text/csv or mock download blob
    const dummyContent = `MPLADS SENTINEL - INSTITUTIONAL OVERSIGHT REPORT
Report ID: ${report.id}
Title: ${report.title}
Generated: ${report.generatedDate}
State: ${report.state}
Financial Year: ${report.financialYear}
Summary: ${report.description}
----------------------------------------------------------------------
CONFIDENTIAL - INSTITUTIONAL GOVERNANCE AUDIT
`;
    const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.id}_${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.${report.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return report.id;
  },
};
