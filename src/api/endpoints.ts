export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/b9d6731e-788e-476b-bad5-047bd3d6adc1?action=login',
    REGISTER: '/448ad9ac-b820-4587-b3cc-0a988ebaa4e8?action=register',
    VERIFY: '/b9d6731e-788e-476b-bad5-047bd3d6adc1?action=verify',
    VERIFY_CODE: '/09b6a02f-8537-4a53-875d-3a46d3fdc278',
    SEND_CODE: '/ff8b8a8a-815e-455b-a052-81b59ae4cab2',
  },
  
  USER: {
    DATA: '/bdee636b-a6c0-42d0-8f77-23c316751e34',
    PROFILE: '/user-profile',
  },

  ENTITIES: {
    CREATE: '/8d57b03e-49c5-4589-abfb-691e6e084c6a',
    UPDATE: '/b69598bf-df90-4a71-93a1-6108c6c39317',
    DELETE: '/b69598bf-df90-4a71-93a1-6108c6c39317',
    DATA: '/c30e1bf9-0423-48e8-b295-07120e205fa7',
  },

  FEED: '/f38edb91-216d-4887-b091-ef224db01905',

  INSPECTION: {
    EVENTS: '/0b3a32ce-bc6d-455c-a189-7cd294c69c95',
  },

  WORK: {
    STATUS: '/ce0181f5-d513-442e-a0ae-fbfb21271c60',
    TYPES: '/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf',
    LIST: '/3910c724-a679-45d8-abd9-2c463bcc525a',
  },

  OBJECTS: {
    LIST: '/354c1d24-5775-4678-ba82-bb1acd986337',
  },

  CONTRACTORS: {
    LIST: '/4bcd4efc-3b22-4eea-9434-44cc201a86f8',
    INVITE: '/5865695e-cb4a-4795-bc42-5465c2b7ad0b',
    LINK: '/f25f4572-bf91-47c2-aca5-059ebc3b870e',
    TASKS: '/facbe7eb-8f9d-4e2a-840a-9404ec0c5715',
  },

  DEFECTS: {
    REPORTS: '/d230b3d9-8dbd-410c-b023-9c021131a15b',
    REMEDIATION: '/ef8edfd4-ef48-48a9-95fb-78f5a4982949',
  },

  ADMIN: {
    LOGIN: '/0b65962d-5a9a-40b3-8108-41e8d32b4a76',
    USERS: '/3f6bb7ff-3e84-4770-8884-3e96062db7f2',
    WORK_TYPES: '/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf',
  },

  MARK_SEEN: '/e9dd5b4f-67a6-44f8-9e1a-9108341f41df',
} as const;