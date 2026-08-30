import { Project } from '../types';
import { supabase } from '../lib/supabase';

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

export const projectService = {
  getAllProjects: async (): Promise<Project[]> => {
    // Note: With 53,162 records, fetching all is dangerous, but kept for compatibility.
    // In a real app, this should only fetch a limited number or use infinite scroll.
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1000); // Limit to 1000 to prevent crashing the browser
      
    if (error) throw new Error(error.message);
    return data as Project[];
  },

  getProjectById: async (id: string): Promise<Project | null> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('projectId', id)
      .single();
      
    if (error) {
      // Fallback check for refCode
      const { data: refData, error: refError } = await supabase
        .from('projects')
        .select('*')
        .eq('refCode', id)
        .single();
        
      if (refError) return null;
      return refData as Project;
    }
    
    return data as Project;
  },

  filterProjects: async (filters: ProjectFilters): Promise<PaginatedProjectsResult> => {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize - 1;

    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' });

    // Apply Filters
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = `%${filters.searchQuery.trim()}%`;
      query = query.or(`projectId.ilike.${q},title.ilike.${q},mpName.ilike.${q},state.ilike.${q},district.ilike.${q},constituency.ilike.${q},implementingAgency.ilike.${q}`);
    }

    if (filters.status && filters.status !== 'All' && filters.status !== 'All Statuses') {
      query = query.eq('status', filters.status);
    }

    if (filters.riskLevel && filters.riskLevel !== 'All' && filters.riskLevel !== 'All Risk Levels') {
      query = query.eq('riskLevel', filters.riskLevel);
    }

    if (filters.financialYear && filters.financialYear !== 'All' && filters.financialYear !== 'All Years') {
      query = query.eq('financialYear', filters.financialYear);
    }

    if (filters.sector && filters.sector !== 'All' && filters.sector !== 'All Sectors') {
      query = query.eq('sector', filters.sector);
    }

    if (filters.state && filters.state !== 'All' && filters.state !== 'All States') {
      query = query.eq('state', filters.state);
    }

    if (filters.district && filters.district !== 'All' && filters.district !== 'All Districts') {
      query = query.eq('district', filters.district);
    }

    // Apply Sorting
    const sortOrder = filters.sortOrder === 'asc';
    switch (filters.sortBy) {
      case 'recommendedAmount':
        query = query.order('sanctionedAmountLakhs', { ascending: sortOrder });
        break;
      case 'totalPaid':
        query = query.order('spentAmountLakhs', { ascending: sortOrder });
        break;
      case 'riskScore':
        query = query.order('riskScore', { ascending: sortOrder });
        break;
      case 'recommendationDate':
        query = query.order('recommendationDate', { ascending: sortOrder });
        break;
      case 'progress':
        query = query.order('physicalProgressPercent', { ascending: sortOrder });
        break;
      default:
        query = query.order('riskScore', { ascending: false }); // Default sort
        break;
    }

    // Apply Pagination
    query = query.range(startIndex, endIndex);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(error.message);
    }

    const totalCount = count || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return {
      projects: data as Project[],
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  },

  updateProjectStatus: async (projectId: string, updates: any): Promise<Project> => {
    // Stub implementation for now
    return (await projectService.getProjectById(projectId)) as Project;
  },

  addEvidencePhoto: async (projectId: string, evidenceData: any): Promise<Project> => {
    // Stub implementation for now
    return (await projectService.getProjectById(projectId)) as Project;
  },

  createProject: async (newProject: any): Promise<Project> => {
    // Stub implementation for now
    return { ...newProject } as Project;
  },

  toggleBookmark: async (projectId: string): Promise<boolean> => {
    return true;
  },

  toggleFlag: async (projectId: string): Promise<boolean> => {
    return true;
  },
};
