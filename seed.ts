import { db, initDb } from './db.js';
import { mockProjects } from './src/data/mockProjects.js';

// We just run this once
initDb();

const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
if (projectCount.count === 0) {
  console.log('Seeding projects...');
  const insertProject = db.prepare(`
    INSERT INTO projects (
      projectId, refCode, title, workDescription, mpName, state, district, constituency,
      sector, implementingAgency, financialYear, sanctionedAmountLakhs, releasedAmountLakhs,
      spentAmountLakhs, status, riskScore, riskLevel, primaryFlag, recommendationDate,
      sanctionDate, tenderDate, workOrderDate, completedDate, latitude, longitude,
      physicalProgressPercent, fundUtilizationPercent
    ) VALUES (
      @projectId, @refCode, @title, @workDescription, @mpName, @state, @district, @constituency,
      @sector, @implementingAgency, @financialYear, @sanctionedAmountLakhs, @releasedAmountLakhs,
      @spentAmountLakhs, @status, @riskScore, @riskLevel, @primaryFlag, @recommendationDate,
      @sanctionDate, @tenderDate, @workOrderDate, @completedDate, @latitude, @longitude,
      @physicalProgressPercent, @fundUtilizationPercent
    )
  `);

  const insertMilestone = db.prepare(`
    INSERT INTO project_milestones (projectId, step, date, status, description)
    VALUES (@projectId, @step, @date, @status, @description)
  `);

  const insertRisk = db.prepare(`
    INSERT INTO project_risk_factors (id, projectId, type, title, description, severity)
    VALUES (@id, @projectId, @type, @title, @description, @severity)
  `);

  const insertEvidence = db.prepare(`
    INSERT INTO project_evidence (id, projectId, title, description, imageUrl, missing, verifiedBy, timestamp, latitude, longitude, locationName)
    VALUES (@id, @projectId, @title, @description, @imageUrl, @missing, @verifiedBy, @timestamp, @latitude, @longitude, @locationName)
  `);

  const insertAudit = db.prepare(`
    INSERT INTO project_audit_logs (id, projectId, timestamp, actor, role, action, details)
    VALUES (@id, @projectId, @timestamp, @actor, @role, @action, @details)
  `);

  const transaction = db.transaction((projects) => {
    for (const p of projects) {
      insertProject.run({
        ...p,
        sanctionedAmountLakhs: p.sanctionedAmountLakhs ?? null,
        releasedAmountLakhs: p.releasedAmountLakhs ?? null,
        spentAmountLakhs: p.spentAmountLakhs ?? null,
        physicalProgressPercent: p.physicalProgressPercent ?? null,
        fundUtilizationPercent: p.fundUtilizationPercent ?? null,
        tenderDate: p.tenderDate ?? null,
        workOrderDate: p.workOrderDate ?? null,
        completedDate: p.completedDate ?? null,
        primaryFlag: p.primaryFlag ?? null,
        recommendationDate: p.recommendationDate ?? null,
        sanctionDate: p.sanctionDate ?? null,
      });

      if (p.milestones) {
        for (const m of p.milestones) {
          insertMilestone.run({ 
            ...m, 
            date: m.date ?? null,
            description: m.description ?? null,
            projectId: p.projectId 
          });
        }
      }

      if (p.riskFactors) {
        for (const r of p.riskFactors) {
          insertRisk.run({ 
            ...r, 
            description: r.description ?? null,
            severity: r.severity ?? null,
            projectId: p.projectId 
          });
        }
      }

      if (p.evidence) {
        for (const e of p.evidence) {
          insertEvidence.run({ 
            ...e, 
            imageUrl: e.imageUrl ?? null,
            verifiedBy: e.verifiedBy ?? null,
            timestamp: e.timestamp ?? null,
            latitude: e.latitude ?? null,
            longitude: e.longitude ?? null,
            locationName: e.locationName ?? null,
            missing: e.missing ? 1 : 0, 
            projectId: p.projectId 
          });
        }
      }

      if (p.auditLogs) {
        for (const a of p.auditLogs) {
          insertAudit.run({ 
            ...a, 
            details: a.details ?? null,
            projectId: p.projectId 
          });
        }
      }
    }
  });

  transaction(mockProjects);
  console.log('Seeded successfully!');
} else {
  console.log('Database already has data, skipping seed.');
}
