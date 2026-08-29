export type ProjectStatus = 'Completed' | 'Ongoing' | 'Delayed' | 'Sanctioned' | 'Proposed';

export type RiskLevel = 'High' | 'Medium' | 'Low';

export type Sector = 'Infrastructure' | 'Energy' | 'Health' | 'Education' | 'Water & Sanitation' | 'Agriculture' | 'Community Facilities';

export interface TimelineMilestone {
  step: string;
  date: string;
  status: 'completed' | 'current' | 'pending' | 'delayed';
  description?: string;
}

export interface RiskFactor {
  id: string;
  type: 'expenditure_spike' | 'delay' | 'vendor_concentration' | 'geotag_mismatch' | 'cost_overrun' | 'duplicate_record';
  title: string;
  name?: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface GeotaggedEvidence {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  missing?: boolean;
  verifiedBy?: string;
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

export interface Project {
  projectId: string;
  refCode: string;
  title: string;
  workDescription: string;
  mpName: string;
  state: string;
  district: string;
  constituency: string;
  sector: Sector;
  implementingAgency: string;
  financialYear: string;
  
  // Financials in Lakhs (or INR)
  sanctionedAmountLakhs: number;
  releasedAmountLakhs: number;
  spentAmountLakhs: number;
  
  status: ProjectStatus;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  primaryFlag?: string;
  
  recommendationDate: string;
  sanctionDate: string;
  tenderDate?: string;
  workOrderDate?: string;
  completedDate?: string;
  targetCompletionDate?: string;
  
  latitude: number;
  longitude: number;
  
  physicalProgressPercent: number;
  fundUtilizationPercent: number; // spent / released * 100
  
  milestones: TimelineMilestone[];
  riskFactors: RiskFactor[];
  evidence: GeotaggedEvidence[];
  auditLogs: AuditLogEntry[];
  
  isBookmarked?: boolean;
  isFlaggedForReview?: boolean;
}

export interface RiskCluster {
  id: string;
  title: string;
  description: string;
  severity: 'High Severity' | 'Med Severity' | 'Low Severity';
  affectedProjectsCount: number;
  category: 'vendor' | 'cost' | 'timeline' | 'geotag';
  districtOrState: string;
}

export interface ReportItem {
  id: string;
  title: string;
  category: string;
  generatedDate: string;
  financialYear: string;
  state: string;
  status: 'Ready' | 'Generating' | 'Archived';
  fileSize: string;
  format: 'PDF' | 'XLSX' | 'CSV';
  description: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'warning' | 'info' | 'success' | 'alert';
  link?: string;
}

export interface StateRiskData {
  id: string;
  name: string;
  totalProjects: number;
  allocatedCr: number;
  expenditureCr: number;
  highRiskCount: number;
  medRiskCount: number;
  lowRiskCount: number;
  utilizationRate: number;
  coordinates: [number, number]; // [lat, lng]
}
