import { Project, ProjectStatus, RiskLevel, Sector } from '../types';

export interface ProjectFilters {
  searchQuery?: string;
  status?: string;
  riskLevel?: string;
  financialYear?: string;
  sector?: string;
  state?: string;
  district?: string;
  sortBy?: 'recommendedAmount' | 'totalPaid' | 'riskScore' | 'recommendationDate' | 'completedDate' | 'progress';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PaginatedProjectsResult {
  projects: Project[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const getHeaders = () => {
  const token = localStorage.getItem('sentinel_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const projectService = {
  getAllProjects: async (): Promise<Project[]> => {
    const res = await fetch('/api/projects', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return await res.json();
  },

  getProjectById: async (id: string): Promise<Project | null> => {
    const res = await fetch(`/api/projects/${id}`, { headers: getHeaders() });
    if (!res.ok) return null;
    return await res.json();
  },

  filterProjects: async (filters: ProjectFilters): Promise<PaginatedProjectsResult> => {
    const allProjects = await projectService.getAllProjects();
    let filtered = [...allProjects];

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.projectId.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q) ||
          p.mpName.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.constituency.toLowerCase().includes(q) ||
          (p.workDescription && p.workDescription.toLowerCase().includes(q)) ||
          p.implementingAgency.toLowerCase().includes(q) ||
          (p.refCode && p.refCode.toLowerCase().includes(q))
      );
    }

    if (filters.status && filters.status !== 'All' && filters.status !== 'All Statuses') {
      filtered = filtered.filter((p) => p.status.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters.riskLevel && filters.riskLevel !== 'All' && filters.riskLevel !== 'All Risk Levels') {
      filtered = filtered.filter((p) => p.riskLevel.toLowerCase() === filters.riskLevel!.toLowerCase());
    }

    if (filters.financialYear && filters.financialYear !== 'All' && filters.financialYear !== 'All Years') {
      filtered = filtered.filter((p) => p.financialYear === filters.financialYear);
    }

    if (filters.sector && filters.sector !== 'All' && filters.sector !== 'All Sectors') {
      filtered = filtered.filter((p) => p.sector.toLowerCase() === filters.sector!.toLowerCase());
    }

    if (filters.state && filters.state !== 'All' && filters.state !== 'All States') {
      filtered = filtered.filter((p) => p.state.toLowerCase() === filters.state!.toLowerCase());
    }

    if (filters.district && filters.district !== 'All' && filters.district !== 'All Districts') {
      filtered = filtered.filter((p) => p.district.toLowerCase() === filters.district!.toLowerCase());
    }

    // Sorting
    const sortBy = filters.sortBy || 'riskScore';
    const sortOrder = filters.sortOrder || 'desc';

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'recommendedAmount') {
        comparison = (a.sanctionedAmountLakhs || 0) - (b.sanctionedAmountLakhs || 0);
      } else if (sortBy === 'totalPaid') {
        comparison = (a.spentAmountLakhs || 0) - (b.spentAmountLakhs || 0);
      } else if (sortBy === 'riskScore') {
        comparison = (a.riskScore || 0) - (b.riskScore || 0);
      } else if (sortBy === 'recommendationDate') {
        comparison = new Date(a.recommendationDate || 0).getTime() - new Date(b.recommendationDate || 0).getTime();
      } else if (sortBy === 'progress') {
        comparison = (a.physicalProgressPercent || 0) - (b.physicalProgressPercent || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const totalCount = filtered.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    return {
      projects: paginated,
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  },

  // Stub out mutations to just return the current project for now, 
  // since this requires backend endpoints we haven't built in this scope.
  updateProjectStatus: async (projectId: string, updates: any): Promise<Project> => {
    return (await projectService.getProjectById(projectId)) as Project;
  },

  addEvidencePhoto: async (projectId: string, evidenceData: any): Promise<Project> => {
    return (await projectService.getProjectById(projectId)) as Project;
  },

  createProject: async (newProject: any): Promise<Project> => {
    return { ...newProject } as Project;
  },

  toggleBookmark: async (projectId: string): Promise<boolean> => {
    return true;
  },

  toggleFlag: async (projectId: string): Promise<boolean> => {
    return true;
  },
};
