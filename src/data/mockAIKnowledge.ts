export interface AIQueryResponse {
  query: string;
  summary: string;
  keyInsights: string[];
  suggestedAction: string;
  sourceDocuments: string[];
  contextType: 'delayed_projects' | 'vendor_concentration' | 'financial_trends' | 'project_risk' | 'state_summary' | 'general';
  relatedProjectIds?: string[];
  chartData?: any;
}

export const mockAIResponses: Record<string, AIQueryResponse> = {
  'delayed_projects_bihar': {
    query: 'Identify top 5 delayed projects in Bihar',
    summary: 'Our forensic scan identified 5 projects in Bihar facing acute timeline overruns exceeding 120 days past target sanction deadlines, with an aggregate delayed value of ₹4.85 Crore.',
    keyInsights: [
      'PRJ-2938 (Patna Sahib): Community Skill Training Center is delayed by 180 days with a 98/100 risk score due to duplicate beneficiary tags.',
      'PRJ-BR-102 (Gaya): Rural drinking water pipe grid halted due to right-of-way clearance delays.',
      'Average physical progress among delayed Bihar works is 23.4% despite 68.2% fund disbursements.',
      'Executing agencies cite slow vendor material mobilization as primary impediment.'
    ],
    suggestedAction: 'Issue formal notice to Bihar State Educational Infrastructure Dev Corp and initiate on-ground physical audit for PRJ-2938.',
    sourceDocuments: [
      'MPLADS Operational Guidelines 2023 § 4.3 (Delayed Works)',
      'District Collectorate Patna - Quarterly Progress Ledger Q3',
      'Geotagged Site Verification Stream #BR-882'
    ],
    contextType: 'delayed_projects',
    relatedProjectIds: ['PRJ-2938', 'PRJ-2023-4921'],
    chartData: [
      { name: 'Patna Sahib', delayDays: 180, sanctioned: 95.0, spent: 58.2 },
      { name: 'Gaya', delayDays: 145, sanctioned: 80.0, spent: 44.0 },
      { name: 'Muzaffarpur', delayDays: 130, sanctioned: 60.0, spent: 38.0 },
      { name: 'Bhagalpur', delayDays: 110, sanctioned: 110.0, spent: 70.0 },
      { name: 'Darbhanga', delayDays: 95, sanctioned: 50.0, spent: 25.0 },
    ]
  },
  'vendor_concentration_kerala': {
    query: 'Check for vendor concentration in Kerala',
    summary: 'High vendor concentration detected across 3 coastal constituencies in Kerala. A single consortium network controls 74% of coastal civil works and fish landing infrastructure contracts.',
    keyInsights: [
      'PRJ-8475 (Ernakulam): Fish Landing Center modernization flagged for shared director linkage between contractor and local quality audit firm.',
      'Cross-bidding patterns indicate non-competitive bidding in 8 consecutive road and jetty tenders.',
      'Disbursement velocity is 3.1x faster than physical concrete curing benchmark rates.'
    ],
    suggestedAction: 'Recommend State Vigilance and Anti-Corruption Bureau review vendor registration clusters and cross-entity ownership filings.',
    sourceDocuments: [
      'Public Procurement Integrity Standards (MoSPI, 2023)',
      'Harbour Engineering Department Kerala - Contract Allocations',
      'Corporate Affairs Registry ROC-Ernakulam Filings 2023'
    ],
    contextType: 'vendor_concentration',
    relatedProjectIds: ['PRJ-8475'],
    chartData: [
      { name: 'Apex Coastal Infra (Consortium A)', share: 64, amountCr: 18.2 },
      { name: 'Southern Marine Build (Consortium A)', share: 10, amountCr: 2.8 },
      { name: 'Independent Contractors', share: 26, amountCr: 7.4 }
    ]
  },
  'financial_trends_breakdown': {
    query: 'Summarize expenditure trends for FY 23-24 with sector breakdown',
    summary: 'Total MPLADS allocations for FY 23-24 reached ₹12,450 Cr with ₹9,820 Cr (78.8%) currently disbursed. Infrastructure and Health account for 58% of cumulative outlays.',
    keyInsights: [
      'Infrastructure: ₹5,400 Cr allocated (82% utilization, highest across all sectors).',
      'Health: ₹2,100 Cr allocated (74% utilization with 42 new primary health centers).',
      'Water & Sanitation: ₹1,650 Cr allocated (79% utilization).',
      'Energy (Solar): ₹1,200 Cr allocated (61% utilization, constrained by battery supply bottlenecks).'
    ],
    suggestedAction: 'Accelerate fund release certifications for Energy sector and review unutilized balances in educational smart labs.',
    sourceDocuments: [
      'MoSPI Financial Year Summary Ledger 2023-24',
      'State-wise Tranche Release Certificates FY23-24',
      'Comptroller and Auditor General (CAG) Interim Note'
    ],
    contextType: 'financial_trends',
    chartData: [
      { sector: 'Infrastructure', allocated: 5400, expenditure: 4428 },
      { sector: 'Health', allocated: 2100, expenditure: 1554 },
      { sector: 'Water & San.', allocated: 1650, expenditure: 1303 },
      { sector: 'Education', allocated: 1450, expenditure: 1087 },
      { sector: 'Energy', allocated: 1200, expenditure: 732 },
      { sector: 'Others', allocated: 650, expenditure: 516 },
    ]
  },
  'high_risk_maharashtra': {
    query: 'Show me high-risk projects in Maharashtra',
    summary: '24 projects across Maharashtra are currently classified under High Risk or Anomaly status, predominantly centered around solar electrification and rural water supply schemes.',
    keyInsights: [
      'PRJ-24-0891 (Baramati): Solar Street Lights flagged for equipment cost variance 42% above state median.',
      'Pune & Nashik clusters: 6 rural piped water schemes reporting stalled physical progress due to missing vendor warranties.',
      'Total estimated value at risk in Maharashtra is ₹31.4 Crore.'
    ],
    suggestedAction: 'Initiate mandatory third-party geotagged drone re-verification for all solar installations in Baramati.',
    sourceDocuments: [
      'Maharashtra Rural Development Department Gazette #MH-44',
      'District Vigilance Committee Baramati - Minutes of Meeting Q2',
      'Sentinel GIS Geofence Database'
    ],
    contextType: 'project_risk',
    relatedProjectIds: ['PRJ-24-0891'],
    chartData: [
      { category: 'Solar / Energy', count: 10, valueCr: 14.5 },
      { category: 'Rural Roads', count: 8, valueCr: 11.2 },
      { category: 'Water Works', count: 4, valueCr: 4.1 },
      { category: 'Health Clinics', count: 2, valueCr: 1.6 },
    ]
  },
  'why_flagged_4921': {
    query: 'Why was project PRJ-2023-4921 flagged?',
    summary: 'Project PRJ-2023-4921 (Construction of Primary Health Center - Ward 12, Gorakhpur, UP) was flagged with an Anomaly Score of 88/100 due to dual risk signals: material cost inflation and unverified milestone claims.',
    keyInsights: [
      'Signal 1: Cement and reinforcement steel expenditure surged 42% in Q3 despite zero corresponding physical plinth elevation progress.',
      'Signal 2: Foundation laying is 45 days past schedule with missing Tranche 2 photographic inspection evidence.',
      'Signal 3: Executing agency has drawn ₹18.45 Lakhs (73.8% of Tranche 1) while on-site physical evaluation stands at 35%.'
    ],
    suggestedAction: 'Hold Tranche 2 disbursement until physical site inspection by District Auditor Ramesh K. confirms foundation depth.',
    sourceDocuments: [
      'District Public Works Department Inspection Record #UP-GOR-4921',
      'Sentinel Automated Anomaly Detector Flag #A-901',
      'Schedule of Rates (SoR) PWD Gorakhpur 2023-24'
    ],
    contextType: 'project_risk',
    relatedProjectIds: ['PRJ-2023-4921']
  }
};
