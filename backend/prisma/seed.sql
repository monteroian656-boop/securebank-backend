-- Datos de demo. Password para ambos usuarios: SecureBank123!

TRUNCATE users, roles, tenants, audit_log_entries, role_change_entries,
  sla_metrics, security_policies, sessions, password_reset_tokens CASCADE;

INSERT INTO tenants (id, name) VALUES
  ('t_1','Banco Central de Costa Rica'),
  ('t_2','Banco Nacional');

INSERT INTO roles (id, name, permissions, "tenantId") VALUES
  ('r_admin','Administrador', ARRAY['roles:write','users:write','audit:read'], 't_1'),
  ('r_auditor','Auditor', ARRAY['audit:read'], 't_1');

-- Hash bcrypt real de "SecureBank123!" (costo 10) — verificado, no un placeholder.
INSERT INTO users (id,"fullName",email,"passwordHash","isActive","roleId","tenantId","createdAt") VALUES
  ('u_1','Ana Solano','ana.solano@bancocr.fi.cr','$2a$10$werqhvqvo2tF7FocYIlui.5iudchDaDcHhoKAsn5KXUnA09W5EDP6',true,'r_admin','t_1','2026-02-10T09:00:00Z'),
  ('u_2','Jorge Vindas','jorge.vindas@bancocr.fi.cr','$2a$10$werqhvqvo2tF7FocYIlui.5iudchDaDcHhoKAsn5KXUnA09W5EDP6',true,'r_auditor','t_1','2025-11-02T09:00:00Z');

INSERT INTO audit_log_entries (id,"userId",action,result,"ipAddress","riskLevel","tenantId","createdAt") VALUES
  ('a_1','u_1','LOGIN','success','190.10.4.2','low','t_1','2026-08-08T14:02:00Z'),
  ('a_2','u_2','LOGIN','failure','84.21.9.15','high','t_1','2026-08-08T14:05:00Z'),
  ('a_3','u_1','ROLE_UPDATED','success','190.10.4.2','medium','t_1','2026-08-08T15:10:00Z');

INSERT INTO role_change_entries (id,"roleId","changedBy","previousState","newState","createdAt") VALUES
  ('h_1','r_auditor','u_1','audit:read','audit:read, reports:export','2026-08-01T10:00:00Z');

INSERT INTO sla_metrics (id,"tenantId",availability,"avgResponseMs",breached,"recordedAt") VALUES
  ('s_0','t_1',99.94,180,false,'2026-08-09T12:00:00Z'),
  ('s_1','t_1',99.70,190,false,'2026-08-10T12:00:00Z'),
  ('s_2','t_1',99.62,175,false,'2026-08-11T12:00:00Z'),
  ('s_3','t_1',99.53,200,false,'2026-08-12T12:00:00Z'),
  ('s_4','t_1',99.53,165,false,'2026-08-13T12:00:00Z'),
  ('s_5','t_1',99.65,185,false,'2026-08-14T12:00:00Z'),
  ('s_6','t_1',99.51,170,false,'2026-08-15T12:00:00Z');

INSERT INTO security_policies ("tenantId","minLength","expirationDays","requireComplexity","inactivityDays","lockoutMinutes") VALUES
  ('t_1',10,90,true,60,15);
