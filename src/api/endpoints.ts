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
    INVITE: '/4bcd4efc-3b22-4eea-9434-44cc201a86f8?action=invite',
    LINK: '/4bcd4efc-3b22-4eea-9434-44cc201a86f8?action=link',
    CHECK_INN: '/4bcd4efc-3b22-4eea-9434-44cc201a86f8?action=check-inn',
    TASKS: '/facbe7eb-8f9d-4e2a-840a-9404ec0c5715',
  },

  DEFECTS: {
    REPORTS: '/d230b3d9-8dbd-410c-b023-9c021131a15b',
    REMEDIATION: '/ef8edfd4-ef48-48a9-95fb-78f5a4982949',
  },

  ADMIN: {
    USERS: '/3f6bb7ff-3e84-4770-8884-3e96062db7f2',
    WORK_TYPES: '/f7c65aa6-e261-44c6-a6cb-65fd7bac3fdf',
    WORK_TYPES_CRUD: '/f9fe23c7-be87-4fc8-9d46-4c10f5930ee3',
  },

  MARK_SEEN: '/e9dd5b4f-67a6-44f8-9e1a-9108341f41df',

  ORGANIZATIONS: {
    LIST: '/b2540d24-831a-4ac0-b3e8-b128f51c0033',
    CREATE: '/b2540d24-831a-4ac0-b3e8-b128f51c0033',
    UPDATE: '/b2540d24-831a-4ac0-b3e8-b128f51c0033',
    DETAIL: '/b2540d24-831a-4ac0-b3e8-b128f51c0033',
  },

  ORGANIZATION_INVITES: {
    SEND: '/654d7aa7-8c67-40a4-af12-8c70b817b9b9',
    ACCEPT: '/654d7aa7-8c67-40a4-af12-8c70b817b9b9',
    CHECK: '/654d7aa7-8c67-40a4-af12-8c70b817b9b9',
  },

  DOCUMENTS: {
    LIST: '/b12e1795-0474-4db7-90d4-c95c29efd2d9',
    CREATE: '/b12e1795-0474-4db7-90d4-c95c29efd2d9',
    UPDATE: '/b12e1795-0474-4db7-90d4-c95c29efd2d9',
    DELETE: '/b12e1795-0474-4db7-90d4-c95c29efd2d9',
    DETAIL: '/b12e1795-0474-4db7-90d4-c95c29efd2d9',
  },

  DOCUMENT_TEMPLATES: {
    LIST: '/1d72211d-c1da-4633-b2e7-c5344fcc43b7',
    CREATE: '/1d72211d-c1da-4633-b2e7-c5344fcc43b7',
    UPDATE: '/1d72211d-c1da-4633-b2e7-c5344fcc43b7',
    DETAIL: '/1d72211d-c1da-4633-b2e7-c5344fcc43b7',
  },

  DOCUMENT_SIGNATURES: {
    CREATE: '/11c2229d-1b77-4e5e-837b-b8c8977c0b5f',
    SIGN: '/11c2229d-1b77-4e5e-837b-b8c8977c0b5f',
    PENDING: '/11c2229d-1b77-4e5e-837b-b8c8977c0b5f',
  },
} as const;