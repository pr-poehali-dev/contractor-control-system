export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/b9d6731e-788e-476b-bad5-047bd3d6adc1',
    REGISTER: '/c5e75b31-8f52-43c8-bdb0-0c8ceef33937',
    VERIFY_CODE: '/09b6a02f-8537-4a53-875d-3a46d3fdc278',
    SEND_CODE: '/c88ca3c4-7430-4a74-8b16-3ebafe7e8e34',
  },
  
  USER: {
    DATA: '/bdee636b-a6c0-42d0-8f77-23c316751e34',
    PROFILE: '/user-profile',
  },

  ENTITIES: {
    CREATE: '/8d57b03e-49c5-4589-abfb-691e6e084c6a',
    UPDATE: '/b69598bf-df90-4a71-93a1-6108c6c39317',
    DELETE: '/b69598bf-df90-4a71-93a1-6108c6c39317',
  },

  FEED: '/f38edb91-216d-4887-b091-ef224db01905',

  INSPECTION: {
    EVENTS: '/0b3a32ce-bc6d-455c-a189-7cd294c69c95',
  },

  WORK: {
    STATUS: '/d8e73f12-3c97-4a2e-9f86-f5a8d7e4b2c1',
  },

  CONTRACTORS: {
    LIST: '/contractors',
    INVITE: '/invite-contractor',
    LINK: '/link-contractor',
    TASKS: '/get-contractor-tasks',
  },

  DEFECTS: {
    REPORTS: '/defect-reports',
    REMEDIATION: '/defect-remediation',
  },

  ADMIN: {
    LOGIN: '/admin',
    USERS: '/admin-users',
    WORK_TYPES: '/work-types',
  },

  MARK_SEEN: '/mark-seen',
} as const;
