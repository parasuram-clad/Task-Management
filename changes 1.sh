#!/usr/bin/env bash
set -euo pipefail

ROOT="feature_pack_v3"
rm -rf "$ROOT"
mkdir -p "$ROOT"/{db,swagger,src/controllers,src/routes}

write() { # write <path> <EOF-name> ; content after call until EOF tag
  local path="$1"; local tag="$2"
  mkdir -p "$(dirname "$ROOT/$path")"
  cat > "$ROOT/$path" <<"$tag"
$tag
}

# README
write "README.txt" EOF_README
Feature Pack v3 (Leads CRM, Projects↔Leads, Sprints, Kanban, Burndown)
---------------------------------------------------------------------
This bundle adds:
- Leads management with activities
- Link projects to leads
- Sprints with task assignment + burndown view
- Kanban: columns per project, move task between columns
- Swagger JSON for the new endpoints

Apply in this order:
1) Run: db/schema_upgrade_v3.sql on your Postgres DB.
2) Copy src/controllers/*.js into your project's controllers folder.
3) Copy src/routes/*.js into your project's routes folder.
4) Wire routes in src/app.js:
     const leadRoutes = require('./routes/leadRoutes');
     const sprintRoutes = require('./routes/sprintRoutes');
     const kanbanRoutes = require('./routes/kanbanRoutes');

     app.use('/api/leads', leadRoutes);
     app.use('/api/sprints', sprintRoutes);
     app.use('/api/kanban', kanbanRoutes);

5) Merge swagger/swagger-extra.json into your main OpenAPI (or host it as a separate doc).

Notes:
- Servers URL uses relative '/api' so it works with http/https.
- Endpoints expect Bearer JWT like your existing APIs.
EOF_README

# SCHEMA
write "db/schema_upgrade_v3.sql" EOF_SQL
-- ====== SCHEMA UPGRADE v3 ======
CREATE EXTENSION IF NOT EXISTS citext;

------------------------------------------------------------
-- 1) LEADS (simple CRM)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead (
  id            BIGSERIAL PRIMARY KEY,
  company_id    BIGINT NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  contact_name  TEXT,
  contact_email CITEXT,
  contact_phone TEXT,
  source        TEXT,
  status        TEXT NOT NULL DEFAULT 'open',     -- open | qualified | converted | lost
  value_amount  NUMERIC(12,2),
  owner_id      BIGINT REFERENCES user_account(id) ON DELETE SET NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_company   ON lead(company_id);
CREATE INDEX IF NOT EXISTS idx_lead_owner     ON lead(owner_id);
CREATE INDEX IF NOT EXISTS idx_lead_status    ON lead(status);

CREATE TABLE IF NOT EXISTS lead_activity (
  id          BIGSERIAL PRIMARY KEY,
  lead_id     BIGINT NOT NULL REFERENCES lead(id) ON DELETE CASCADE,
  author_id   BIGINT REFERENCES user_account(id) ON DELETE SET NULL,
  type        TEXT NOT NULL,           -- note | call | email | meeting
  subject     TEXT,
  body        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lead_activity_lead ON lead_activity(lead_id);

-- Link project to a lead
ALTER TABLE project
  ADD COLUMN IF NOT EXISTS lead_id BIGINT REFERENCES lead(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_project_lead_id ON project(lead_id);

------------------------------------------------------------
-- 2) KANBAN BOARD
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanban_column (
  id           BIGSERIAL PRIMARY KEY,
  project_id   BIGINT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  position     INT  NOT NULL DEFAULT 0,
  wip_limit    INT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, name)
);

CREATE INDEX IF NOT EXISTS idx_kanban_col_project ON kanban_column(project_id);

ALTER TABLE task
  ADD COLUMN IF NOT EXISTS kanban_column_id BIGINT REFERENCES kanban_column(id);

CREATE INDEX IF NOT EXISTS idx_task_kanban_column ON task(kanban_column_id);

------------------------------------------------------------
-- 3) SPRINTS
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sprint (
  id            BIGSERIAL PRIMARY KEY,
  project_id    BIGINT NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  goal          TEXT,
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  status        TEXT NOT NULL DEFAULT 'planned',  -- planned | active | completed | canceled
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_sprint_dates CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_sprint_project   ON sprint(project_id);
CREATE INDEX IF NOT EXISTS idx_sprint_status    ON sprint(status);

ALTER TABLE task
  ADD COLUMN IF NOT EXISTS sprint_id BIGINT REFERENCES sprint(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_task_sprint ON task(sprint_id);

------------------------------------------------------------
-- 4) SPRINT BURNDOWN VIEW (remaining tasks per day)
------------------------------------------------------------
DROP VIEW IF EXISTS v_sprint_burndown;
CREATE VIEW v_sprint_burndown AS
SELECT
  s.id                AS sprint_id,
  d::date             AS day,
  COUNT(*) FILTER (WHERE t.status <> 'done') AS remaining_tasks
FROM sprint s
JOIN LATERAL generate_series(s.start_date::timestamp, s.end_date::timestamp, '1 day') d ON TRUE
LEFT JOIN task t
  ON t.sprint_id = s.id
  AND t.created_at::date <= d::date
GROUP BY s.id, d
ORDER BY s.id, d;

------------------------------------------------------------
-- 5) SEED DEFAULT KANBAN COLUMNS FOR EXISTING PROJECTS (idempotent)
------------------------------------------------------------
WITH x AS ( SELECT id AS project_id FROM project )
INSERT INTO kanban_column (project_id, name, position)
SELECT project_id, name, pos
FROM (
  SELECT project_id, 'Backlog' AS name, 1 AS pos FROM x
  UNION ALL SELECT project_id, 'In Progress', 2 FROM x
  UNION ALL SELECT project_id, 'Review', 3 FROM x
  UNION ALL SELECT project_id, 'Done', 4 FROM x
) seed
ON CONFLICT (project_id, name) DO NOTHING;
EOF_SQL

# CONTROLLERS
write "src/controllers/leadController.js" EOF_LEADC
const Joi = require('joi');
const db = require('../db');

const leadSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  contactName: Joi.string().allow('', null),
  contactEmail: Joi.string().email().allow('', null),
  contactPhone: Joi.string().allow('', null),
  source: Joi.string().allow('', null),
  status: Joi.string().valid('open','qualified','converted','lost').default('open'),
  valueAmount: Joi.number().precision(2).allow(null),
  ownerId: Joi.number().integer().allow(null),
  notes: Joi.string().allow('', null),
});

exports.listLeads = async (req, res, next) => {
  try {
    const r = await db.query(
      `SELECT l.*, ua.name AS owner_name
       FROM lead l
       LEFT JOIN user_account ua ON ua.id = l.owner_id
       WHERE l.company_id = $1
       ORDER BY l.created_at DESC
       LIMIT 500`,
      [req.user.company_id]
    );
    res.json(r.rows);
  } catch (e) { next(e); }
};

exports.createLead = async (req, res, next) => {
  try {
    const { error, value } = leadSchema.validate(req.body || {});
    if (error) { res.status(400); return next(error); }
    const { name, contactName, contactEmail, contactPhone, source, status, valueAmount, ownerId, notes } = value;

    const r = await db.query(
      `INSERT INTO lead
         (company_id, name, contact_name, contact_email, contact_phone, source, status, value_amount, owner_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [req.user.company_id, name, contactName || null, contactEmail || null, contactPhone || null,
       source || null, status, valueAmount || null, ownerId || null, notes || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { next(e); }
};

exports.getLead = async (req, res, next) => {
  try {
    const id = req.params.id;
    const leadRes = await db.query(
      `SELECT l.*, ua.name AS owner_name
       FROM lead l
       LEFT JOIN user_account ua ON ua.id = l.owner_id
       WHERE l.id = $1 AND l.company_id = $2`,
      [id, req.user.company_id]
    );
    if (leadRes.rows.length === 0) { res.status(404); return next(new Error('Lead not found')); }

    const acts = await db.query(
      `SELECT la.*, u.name AS author_name
       FROM lead_activity la
       LEFT JOIN user_account u ON u.id = la.author_id
       WHERE la.lead_id = $1
       ORDER BY la.created_at DESC`,
      [id]
    );

    const projects = await db.query(
      `SELECT p.id, p.name, p.status
       FROM project p
       WHERE p.lead_id = $1 AND p.company_id = $2
       ORDER BY p.created_at DESC NULLS LAST, p.id DESC`,
      [id, req.user.company_id]
    );

    const lead = leadRes.rows[0];
    lead.activities = acts.rows;
    lead.projects = projects.rows;
    res.json(lead);
  } catch (e) { next(e); }
};

exports.updateLead = async (req, res, next) => {
  try {
    const { error, value } = leadSchema.fork(['name'], f => f.optional()).validate(req.body || {});
    if (error) { res.status(400); return next(error); }
    const id = req.params.id;
    const { name, contactName, contactEmail, contactPhone, source, status, valueAmount, ownerId, notes } = value;

    const r = await db.query(
      `UPDATE lead
       SET name = COALESCE($2, name),
           contact_name = COALESCE($3, contact_name),
           contact_email = COALESCE($4, contact_email),
           contact_phone = COALESCE($5, contact_phone),
           source = COALESCE($6, source),
           status = COALESCE($7, status),
           value_amount = COALESCE($8, value_amount),
           owner_id = COALESCE($9, owner_id),
           notes = COALESCE($10, notes),
           updated_at = NOW()
       WHERE id = $1 AND company_id = $11
       RETURNING *`,
      [id, name || null, contactName || null, contactEmail || null, contactPhone || null,
       source || null, status || null, valueAmount || null, ownerId || null, notes || null, req.user.company_id]
    );
    if (r.rows.length === 0) { res.status(404); return next(new Error('Lead not found')); }
    res.json(r.rows[0]);
  } catch (e) { next(e); }
};

exports.addLeadActivity = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { type, subject, body } = req.body || {};
    if (!type) { res.status(400); return next(new Error('type is required')); }

    const own = await db.query(`SELECT id FROM lead WHERE id = $1 AND company_id = $2`, [id, req.user.company_id]);
    if (own.rows.length === 0) { res.status(404); return next(new Error('Lead not found')); }

    const r = await db.query(
      `INSERT INTO lead_activity (lead_id, author_id, type, subject, body)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [id, req.user.id, String(type), subject || null, body || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { next(e); }
};

exports.linkProject = async (req, res, next) => {
  try {
    const id = req.params.id;      // lead id
    const { projectId } = req.body || {};
    if (!projectId) { res.status(400); return next(new Error('projectId is required')); }

    const [lead, proj] = await Promise.all([
      db.query(`SELECT id FROM lead WHERE id = $1 AND company_id = $2`, [id, req.user.company_id]),
      db.query(`SELECT id FROM project WHERE id = $1 AND company_id = $2`, [projectId, req.user.company_id])
    ]);
    if (lead.rows.length === 0) { res.status(404); return next(new Error('Lead not found')); }
    if (proj.rows.length === 0) { res.status(404); return next(new Error('Project not found')); }

    const r = await db.query(
      `UPDATE project SET lead_id = $2 WHERE id = $1 RETURNING id, name, lead_id`,
      [projectId, id]
    );
    res.json(r.rows[0]);
  } catch (e) { next(e); }
};
EOF_LEADC

write "src/controllers/sprintController.js" EOF_SPRINTC
const Joi = require('joi');
const db = require('../db');

const sprintSchema = Joi.object({
  projectId: Joi.number().integer().required(),
  name: Joi.string().min(2).max(200).required(),
  goal: Joi.string().allow('', null),
  startDate: Joi.string().pattern(/^\\d{4}-\\d{2}-\\d{2}$/).required(),
  endDate: Joi.string().pattern(/^\\d{4}-\\d{2}-\\d{2}$/).required(),
  status: Joi.string().valid('planned','active','completed','canceled').default('planned'),
});

exports.listSprints = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    let q = `SELECT * FROM sprint WHERE project_id IN (SELECT id FROM project WHERE company_id = $1)`;
    const params = [req.user.company_id];
    if (projectId) { q += ` AND project_id = $2`; params.push(projectId); }
    q += ` ORDER BY start_date DESC`;
    const r = await db.query(q, params);
    res.json(r.rows);
  } catch (e) { next(e); }
};

exports.createSprint = async (req, res, next) => {
  try {
    const { error, value } = sprintSchema.validate(req.body || {});
    if (error) { res.status(400); return next(error); }
    const { projectId, name, goal, startDate, endDate, status } = value;

    const p = await db.query(`SELECT id FROM project WHERE id = $1 AND company_id = $2`, [projectId, req.user.company_id]);
    if (p.rows.length === 0) { res.status(404); return next(new Error('Project not found')); }

    const r = await db.query(
      `INSERT INTO sprint (project_id, name, goal, start_date, end_date, status)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [projectId, name, goal || null, startDate, endDate, status]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { next(e); }
};

exports.addTasksToSprint = async (req, res, next) => {
  try {
    const sprintId = req.params.id;
    const { taskIds } = req.body || {};
    if (!Array.isArray(taskIds) || taskIds.length === 0) { res.status(400); return next(new Error('taskIds array required')); }

    const s = await db.query(
      `SELECT s.id FROM sprint s JOIN project p ON p.id = s.project_id
       WHERE s.id = $1 AND p.company_id = $2`,
      [sprintId, req.user.company_id]
    );
    if (s.rows.length === 0) { res.status(404); return next(new Error('Sprint not found')); }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      for (const tid of taskIds) {
        await client.query(`UPDATE task SET sprint_id = $2 WHERE id = $1`, [tid, sprintId]);
      }
      await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }

    res.json({ message: 'Tasks added to sprint' });
  } catch (e) { next(e); }
};

exports.getBurndown = async (req, res, next) => {
  try {
    const sprintId = req.params.id;
    const s = await db.query(
      `SELECT s.id FROM sprint s JOIN project p ON p.id = s.project_id
       WHERE s.id = $1 AND p.company_id = $2`,
      [sprintId, req.user.company_id]
    );
    if (s.rows.length === 0) { res.status(404); return next(new Error('Sprint not found')); }

    const data = await db.query(
      `SELECT day, remaining_tasks FROM v_sprint_burndown WHERE sprint_id = $1 ORDER BY day`,
      [sprintId]
    );
    res.json(data.rows);
  } catch (e) { next(e); }
};
EOF_SPRINTC

write "src/controllers/kanbanController.js" EOF_KANBANC
const Joi = require('joi');
const db = require('../db');

exports.listColumns = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const r = await db.query(
      `SELECT kc.*
       FROM kanban_column kc
       JOIN project p ON p.id = kc.project_id
       WHERE p.company_id = $1
         AND ($2::bigint IS NULL OR kc.project_id = $2)
       ORDER BY kc.project_id, kc.position`,
      [req.user.company_id, projectId || null]
    );
    res.json(r.rows);
  } catch (e) { next(e); }
};

exports.createColumn = async (req, res, next) => {
  try {
    const schema = Joi.object({
      projectId: Joi.number().integer().required(),
      name: Joi.string().min(2).max(100).required(),
      position: Joi.number().integer().min(0).default(0),
      wipLimit: Joi.number().integer().min(0).allow(null),
    });
    const { error, value } = schema.validate(req.body || {});
    if (error) { res.status(400); return next(error); }
    const { projectId, name, position, wipLimit } = value;

    const p = await db.query(`SELECT id FROM project WHERE id = $1 AND company_id = $2`, [projectId, req.user.company_id]);
    if (p.rows.length === 0) { res.status(404); return next(new Error('Project not found')); }

    const r = await db.query(
      `INSERT INTO kanban_column (project_id, name, position, wip_limit)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [projectId, name, position, wipLimit || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) { next(e); }
};

exports.moveTask = async (req, res, next) => {
  try {
    const schema = Joi.object({ toColumnId: Joi.number().integer().required() });
    const { error, value } = schema.validate(req.body || {});
    if (error) { res.status(400); return next(error); }
    const taskId = req.params.id;
    const { toColumnId } = value;

    const col = await db.query(
      `SELECT kc.id FROM kanban_column kc
       JOIN project p ON p.id = kc.project_id
       WHERE kc.id = $1 AND p.company_id = $2`,
      [toColumnId, req.user.company_id]
    );
    if (col.rows.length === 0) { res.status(404); return next(new Error('Column not found')); }

    const r = await db.query(
      `UPDATE task SET kanban_column_id = $2 WHERE id = $1 RETURNING id, title, kanban_column_id`,
      [taskId, toColumnId]
    );
    if (r.rows.length === 0) { res.status(404); return next(new Error('Task not found')); }
    res.json(r.rows[0]);
  } catch (e) { next(e); }
};
EOF_KANBANC

# ROUTES
write "src/routes/leadRoutes.js" EOF_LEADR
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  listLeads, createLead, getLead, updateLead, addLeadActivity, linkProject
} = require('../controllers/leadController');

router.get('/', protect, listLeads);
router.post('/', protect, createLead);
router.get('/:id', protect, getLead);
router.put('/:id', protect, updateLead);
router.post('/:id/activities', protect, addLeadActivity);
router.post('/:id/link-project', protect, linkProject);

module.exports = router;
EOF_LEADR

write "src/routes/sprintRoutes.js" EOF_SPRINTR
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  listSprints, createSprint, addTasksToSprint, getBurndown
} = require('../controllers/sprintController');

router.get('/', protect, listSprints);
router.post('/', protect, createSprint);
router.post('/:id/tasks', protect, addTasksToSprint);
router.get('/:id/burndown', protect, getBurndown);

module.exports = router;
EOF_SPRINTR

write "src/routes/kanbanRoutes.js" EOF_KANBANR
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { listColumns, createColumn, moveTask } = require('../controllers/kanbanController');

router.get('/columns', protect, listColumns);
router.post('/columns', protect, createColumn);
router.post('/tasks/:id/move', protect, moveTask);

module.exports = router;
EOF_KANBANR

# SWAGGER
write "swagger/swagger-extra.json" EOF_SWAG
{
  "openapi": "3.0.0",
  "info": { "title": "Extra APIs: Leads, Sprints, Kanban", "version": "1.0.0" },
  "servers": [{ "url": "/api" }],
  "tags": [{ "name": "Leads" }, { "name": "Sprints" }, { "name": "Kanban" }],
  "components": {
    "securitySchemes": { "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" } },
    "schemas": {
      "Lead": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "company_id": { "type": "integer" },
          "name": { "type": "string" },
          "contact_name": { "type": "string", "nullable": true },
          "contact_email": { "type": "string", "format": "email", "nullable": true },
          "contact_phone": { "type": "string", "nullable": true },
          "source": { "type": "string", "nullable": true },
          "status": { "type": "string", "enum": ["open","qualified","converted","lost"] },
          "value_amount": { "type": "number", "format": "float", "nullable": true },
          "owner_id": { "type": "integer", "nullable": true },
          "notes": { "type": "string", "nullable": true },
          "created_at": { "type": "string", "format": "date-time" },
          "updated_at": { "type": "string", "format": "date-time" }
        }
      },
      "LeadCreate": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "contactName": { "type": "string" },
          "contactEmail": { "type": "string", "format": "email" },
          "contactPhone": { "type": "string" },
          "source": { "type": "string" },
          "status": { "type": "string", "enum": ["open","qualified","converted","lost"] },
          "valueAmount": { "type": "number", "format": "float" },
          "ownerId": { "type": "integer" },
          "notes": { "type": "string" }
        }
      },
      "LeadActivityCreate": {
        "type": "object",
        "required": ["type"],
        "properties": {
          "type": { "type": "string", "enum": ["note","call","email","meeting"] },
          "subject": { "type": "string" },
          "body": { "type": "string" }
        }
      },
      "ProjectLinkRequest": {
        "type": "object",
        "required": ["projectId"],
        "properties": { "projectId": { "type": "integer" } }
      },
      "Sprint": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "project_id": { "type": "integer" },
          "name": { "type": "string" },
          "goal": { "type": "string", "nullable": true },
          "start_date": { "type": "string", "format": "date" },
          "end_date": { "type": "string", "format": "date" },
          "status": { "type": "string", "enum": ["planned","active","completed","canceled"] },
          "created_at": { "type": "string", "format": "date-time" },
          "updated_at": { "type": "string", "format": "date-time" }
        }
      },
      "SprintCreate": {
        "type": "object",
        "required": ["projectId","name","startDate","endDate"],
        "properties": {
          "projectId": { "type": "integer" },
          "name": { "type": "string" },
          "goal": { "type": "string" },
          "startDate": { "type": "string", "format": "date" },
          "endDate": { "type": "string", "format": "date" },
          "status": { "type": "string", "enum": ["planned","active","completed","canceled"] }
        }
      },
      "AddTasksToSprint": {
        "type": "object",
        "required": ["taskIds"],
        "properties": { "taskIds": { "type": "array", "items": { "type": "integer" } } }
      },
      "BurndownPoint": {
        "type": "object",
        "properties": {
          "day": { "type": "string", "format": "date" },
          "remaining_tasks": { "type": "integer" }
        }
      },
      "KanbanColumn": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "project_id": { "type": "integer" },
          "name": { "type": "string" },
          "position": { "type": "integer" },
          "wip_limit": { "type": "integer", "nullable": true },
          "created_at": { "type": "string", "format": "date-time" }
        }
      },
      "KanbanColumnCreate": {
        "type": "object",
        "required": ["projectId","name"],
        "properties": {
          "projectId": { "type": "integer" },
          "name": { "type": "string" },
          "position": { "type": "integer" },
          "wipLimit": { "type": "integer" }
        }
      },
      "MoveTaskRequest": {
        "type": "object",
        "required": ["toColumnId"],
        "properties": { "toColumnId": { "type": "integer" } }
      }
    }
  },
  "security": [{ "bearerAuth": [] }],
  "paths": {
    "/leads": {
      "get": { "tags": ["Leads"], "summary": "List leads", "security": [{ "bearerAuth": [] }],
        "responses": { "200": { "description": "Leads", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Lead" } } } } } } },
      "post": { "tags": ["Leads"], "summary": "Create lead", "security": [{ "bearerAuth": [] }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/LeadCreate" } } } },
        "responses": { "201": { "description": "Created" }, "400": { "description": "Validation error" } } }
    },
    "/leads/{id}": {
      "get": { "tags": ["Leads"], "summary": "Get lead", "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }],
        "responses": { "200": { "description": "OK" }, "404": { "description": "Not found" } } },
      "put": { "tags": ["Leads"], "summary": "Update lead", "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/LeadCreate" } } } },
        "responses": { "200": { "description": "Updated" }, "404": { "description": "Not found" } } }
    },
    "/leads/{id}/activities": {
      "post": { "tags": ["Leads"], "summary": "Add activity", "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/LeadActivityCreate" } } } },
        "responses": { "201": { "description": "Created" }, "404": { "description": "Lead not found" } } }
    },
    "/leads/{id}/link-project": {
      "post": { "tags": ["Leads"], "summary": "Link project to lead", "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ProjectLinkRequest" } } } },
        "responses": { "200": { "description": "Linked" }, "404": { "description": "Lead/Project not found" } } }
    },
    "/sprints": {
      "get": { "tags": ["Sprints"], "summary": "List sprints", "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "projectId", "in": "query", "schema": { "type": "integer" } }],
        "responses": { "200": { "description": "Sprints", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Sprint" } } } } } } },
      "post": { "tags": ["Sprints"], "summary": "Create sprint", "security": [{ "bearerAuth": [] }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/SprintCreate" } } } },
        "responses": { "201": { "description": "Created" }, "404": { "description": "Project not found" } } }
    },
    "/sprints/{id}/tasks": {
      "post": { "tags": ["Sprints"], "summary": "Assign tasks to sprint", "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/AddTasksToSprint" } } } },
        "responses": { "200": { "description": "Tasks added" }, "404": { "description": "Sprint not found" } } }
    },
    "/sprints/{id}/burndown": {
      "get": { "tags": ["Sprints"], "summary": "Burndown data", "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }],
        "responses": { "200": { "description": "OK", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/BurndownPoint" } } } } }, "404": { "description": "Sprint not found" } } }
    },
    "/kanban/columns": {
      "get": { "tags": ["Kanban"], "summary": "List columns", "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "projectId", "in": "query", "schema": { "type": "integer" } }],
        "responses": { "200": { "description": "Columns", "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/KanbanColumn" } } } } } } },
      "post": { "tags": ["Kanban"], "summary": "Create column", "security": [{ "bearerAuth": [] }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/KanbanColumnCreate" } } } },
        "responses": { "201": { "description": "Created" }, "404": { "description": "Project not found" } } }
    },
    "/kanban/tasks/{id}/move": {
      "post": { "tags": ["Kanban"], "summary": "Move task to column", "security": [{ "bearerAuth": [] }],
        "parameters": [{ "name": "id", "in": "path", "required": true, "schema": { "type": "integer" } }],
        "requestBody": { "required": true, "content": { "application/json": { "schema": { "$ref": "#/components/schemas/MoveTaskRequest" } } } },
        "responses": { "200": { "description": "Moved" }, "404": { "description": "Task/Column not found" } } }
    }
  }
}
EOF_SWAG

# Create zip
( cd "$ROOT" && zip -rq ../feature_pack_v3.zip . )
echo "Created $ROOT and feature_pack_v3.zip"


#How to use it:

#Save the script as make_feature_pack_v3.sh.

#Run: bash make_feature_pack_v3.sh

#You’ll get:

#feature_pack_v3/ (folders: db, swagger, src/controllers, src/routes)

#feature_pack_v3.zip (ready to share/import)