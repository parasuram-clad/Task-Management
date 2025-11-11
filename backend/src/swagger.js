const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Attendance & Timesheet API',
    version: '1.0.0',
    description:
      'API for company attendance, timesheets, projects, tasks, employees, and ADFS SSO authentication.'
  },
  servers: [
    {
      url: '/api',
      description: 'API base path'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              email: { type: 'string' },
              role: { type: 'string' }
            }
          },
          accessToken: { type: 'string' }
        }
      },
      AttendanceDay: {
        type: 'object',
        properties: {
          id: { type: 'integer', nullable: true },
          user_id: { type: 'integer' },
          work_date: { type: 'string', format: 'date' },
          status: { type: 'string' },
          check_in_at: { type: 'string', format: 'date-time', nullable: true },
          check_out_at: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      Timesheet: {
        type: 'object',
        properties: {
          id: { type: 'integer', nullable: true },
          user_id: { type: 'integer' },
          week_start_date: { type: 'string', format: 'date' },
          status: { type: 'string' },
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                project_id: { type: 'integer' },
                task_id: { type: 'integer', nullable: true },
                work_date: { type: 'string', format: 'date' },
                hours: { type: 'number' },
                note: { type: 'string', nullable: true }
              }
            }
          }
        }
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful login',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          '401': { description: 'Invalid credentials' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Current user info' },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/sso/adfs/login': {
      get: {
        tags: ['SSO'],
        summary: 'Redirect to ADFS for SSO login',
        responses: {
          '302': { description: 'Redirect to ADFS' }
        }
      }
    },
    '/sso/adfs/callback': {
      post: {
        tags: ['SSO'],
        summary: 'ADFS SAML callback endpoint',
        responses: {
          '200': { description: 'SSO login success' },
          '401': { description: 'SSO login failed' }
        }
      }
    },
    '/attendance/me/today': {
      get: {
        tags: ['Attendance'],
        summary: 'Get today attendance for current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Attendance info',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AttendanceDay' }
              }
            }
          },
          '401': { description: 'Unauthorized' }
        }
      }
    },
    '/attendance/me/clock-in': {
      post: {
        tags: ['Attendance'],
        summary: 'Clock in for current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Updated attendance',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AttendanceDay' }
              }
            }
          }
        }
      }
    },
    '/attendance/me/clock-out': {
      post: {
        tags: ['Attendance'],
        summary: 'Clock out for current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'Updated attendance',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AttendanceDay' }
              }
            }
          }
        }
      }
    },
    '/timesheets/me': {
      get: {
        tags: ['Timesheets'],
        summary: 'Get weekly timesheet for current user',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'weekStartDate',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date' }
          }
        ],
        responses: {
          '200': {
            description: 'Timesheet data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Timesheet' }
              }
            }
          }
        }
      }
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List projects',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of projects' }
        }
      },
      post: {
        tags: ['Projects'],
        summary: 'Create project',
        security: [{ bearerAuth: [] }],
        responses: {
          '201': { description: 'Project created' },
          '403': { description: 'Forbidden' }
        }
      }
    },
    '/tasks/me': {
      get: {
        tags: ['Tasks'],
        summary: 'Get tasks assigned to current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of tasks' }
        }
      }
    },
    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'List employees (admin/hr/manager)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of employees' },
          '403': { description: 'Forbidden' }
        }
      }
    },
    '/reports/attendance': {
      get: {
        tags: ['Reports'],
        summary: 'Attendance report',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Attendance report rows' }
        }
      }
    },
    '/reports/timesheets': {
      get: {
        tags: ['Reports'],
        summary: 'Timesheet report',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Timesheet report rows' }
        }
      }
    }
  }
};

module.exports = swaggerDocument;
