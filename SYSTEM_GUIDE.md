# 🚀 СИСТЕМА КОНТРОЛЯ СТРОИТЕЛЬСТВА - РУКОВОДСТВО ДЛЯ АССИСТЕНТА

> **КРИТИЧНО**: Всегда проверяй этот файл перед началом работы и обновляй его при изменениях в архитектуре!

---

## 📋 ОГЛАВЛЕНИЕ
1. [Общая архитектура](#общая-архитектура)
2. [База данных](#база-данных)
3. [Backend функции](#backend-функции)
4. [Frontend структура](#frontend-структура)
5. [Типичные ошибки и как их избежать](#типичные-ошибки)
6. [Чек-лист перед работой](#чек-лист)

---

## 🏗️ ОБЩАЯ АРХИТЕКТУРА

### Назначение системы
Платформа для контроля строительных работ:
- **Заказчики (clients)** создают объекты, работы, проверки
- **Подрядчики (contractors)** ведут журналы работ, отчитываются
- **Админы** управляют пользователями и системой

### Стек технологий
```
Frontend:  React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
           Redux Toolkit (управление состоянием)
           Axios (HTTP клиент с interceptors)
Backend:   Python 3.11 (Cloud Functions)
Database:  PostgreSQL (Simple Query Protocol ONLY!)
Auth:      JWT токены в localStorage + Redux
Icons:     lucide-react через компонент Icon
```

### ⚠️ КРИТИЧНО: НОВАЯ АРХИТЕКТУРА (с 2025-10-20)

**Управление состоянием: Redux Toolkit**
- ❌ НЕ используй React.Context для данных (кроме AuthContext - временно для совместимости)
- ✅ Все данные храни в Redux slices
- ✅ Используй createAsyncThunk для API вызовов
- ✅ Используй selectors для вычисляемых значений

**HTTP клиент: Axios через apiClient**
- ❌ НЕ используй fetch() напрямую
- ✅ Всегда используй apiClient из src/api/apiClient.ts
- ✅ Все эндпоинты определены в src/api/endpoints.ts
- ✅ Авторизация добавляется автоматически через interceptor

---

## 🗄️ БАЗА ДАННЫХ

### Схема
`t_p8942561_contractor_control_s`

### ⚠️ КРИТИЧНО: ПРОСТОЙ ПРОТОКОЛ ЗАПРОСОВ
**ВСЕГДА используй Simple Query Protocol:**
- ❌ НЕ используй параметризованные запросы с `%s`, `$1`, и т.д.
- ✅ Подставляй значения напрямую в SQL с экранированием
- ✅ Пример: `WHERE id = 123` вместо `WHERE id = %s`

### Основные таблицы и связи

#### Пользователи и доступ
```
users (id, email, phone, password_hash, name, role, organization)
  ↓
user_sessions (session_token, user_id, expires_at)
verification_codes (code, phone, expires_at)
```

#### Иерархия проектов
```
objects (id, title, address, client_id, status)
  ↓
works (id, object_id, title, contractor_id, status, start_date, end_date, completion_percentage)
  ↓
work_logs (id, work_id, log_type, date, description, author_id)
inspections (id, work_id, inspection_number, status, scheduled_date, created_by)
```

#### События и коммуникация
```
inspection_events (id, inspection_id, event_type, created_by, metadata)
  - event_type: 'scheduled', 'started', 'completed', 'rescheduled'
  - metadata: jsonb с доп. данными (scheduled_date, defects_count, etc.)

chat_messages (id, work_id, sender_id, message, created_at)

info_posts (id, object_id, title, content, author_id, created_at)
```

#### Дефекты и устранение
```
defect_reports (id, inspection_id, title, defects jsonb[], created_by)
  ↓
defect_remediations (id, report_id, defect_id, status, remediated_at)
```

#### Справочники
```
work_templates (id, client_id, name, description, checkpoints jsonb[])
work_types (id, name, category, description)
client_contractors (client_id, contractor_id, status)
```

### Важные поля и их значения

**works.status:**
- `active` - в работе
- `completed` - завершена
- `delayed` - задержка

**inspections.status:**
- `draft` - запланирована
- `active` - начата
- `completed` - завершена

**users.role:**
- `client` - заказчик
- `contractor` - подрядчик
- `admin` - администратор

---

## 🔧 BACKEND ФУНКЦИИ

### Расположение
`/backend/[function-name]/index.py`

### ⚠️ КРИТИЧНО: Правила работы с БД в backend
```python
# ✅ ПРАВИЛЬНО - Simple Query
import psycopg
conn = psycopg.connect(dsn)
cursor = conn.cursor()
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# ❌ НЕПРАВИЛЬНО - Extended Query (не работает!)
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
```

### Основные функции и их назначение

#### Аутентификация
- `auth/` - вход по email/паролю
- `register/` - регистрация
- `send-verification-code/` - отправка SMS кода
- `verify-code/` - проверка SMS кода и вход

#### Данные пользователя
- `user-data/` - загрузка всех данных (объекты, работы, проверки, сообщения)
- `create-data/` - создание объектов/работ/проверок/записей
- `update-data/` - обновление данных
- `mark-seen/` - пометка просмотренного

#### Специфичные функции
- `get-feed/` - лента событий для dashboard
- `inspection-event/` - создание событий проверки
- `work-status/` - обновление статуса работы
- `invite-contractor/` - приглашение подрядчика
- `link-contractor/` - привязка подрядчика к заказчику
- `get-contractor-tasks/` - задачи подрядчика
- `defect-reports/` - работа с отчетами о дефектах
- `defect-remediation/` - устранение дефектов

#### Админ функции
- `admin/` - вход админа
- `admin-users/` - управление пользователями
- `work-types/` - управление типами работ

### Формат ответа backend
```python
return {
    'statusCode': 200,
    'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    },
    'isBase64Encoded': False,
    'body': json.dumps({'data': result})
}
```

### Получение DATABASE_URL
```python
import os
DSN = os.environ.get('DATABASE_URL')
```

---

## 🎨 FRONTEND СТРУКТУРА

### Точки входа
```
src/main.tsx (Redux Provider) → src/App.tsx → src/components/Layout.tsx
```

### ⚠️ КРИТИЧНО: Redux Toolkit Architecture

**Store структура:**
```typescript
src/store/
├── store.ts              // configureStore с Redux DevTools
├── hooks.ts              // useAppDispatch, useAppSelector
└── slices/
    ├── userSlice.ts      // auth + userData
    ├── objectsSlice.ts   // CRUD объектов
    ├── worksSlice.ts     // CRUD работ
    ├── workLogsSlice.ts  // журнал работ
    ├── inspectionsSlice.ts  // проверки
    └── contractorsSlice.ts  // подрядчики
```

**API Client:**
```typescript
src/api/
├── apiClient.ts          // Axios instance с interceptors
└── endpoints.ts          // Константы всех URL
```

**Правила работы с Redux:**

1. **Доступ к данным:**
```typescript
// ❌ НЕ используй Context
const { user } = useAuth(); // старый способ

// ✅ Используй Redux
import { useAppSelector } from '@/store/hooks';
const user = useAppSelector((state) => state.user.user);
```

2. **Изменение данных:**
```typescript
// ❌ НЕ вызывай API напрямую
await fetch('/api/objects', { method: 'POST', body: ... });

// ✅ Используй Redux thunks
import { useAppDispatch } from '@/store/hooks';
import { createObject } from '@/store/slices/objectsSlice';

const dispatch = useAppDispatch();
await dispatch(createObject({ title: 'Новый объект', ... }));
```

3. **Получение списков:**
```typescript
// ❌ НЕ используй userData.objects
const objects = userData?.objects || [];

// ✅ Используй slice напрямую
const objects = useAppSelector((state) => state.objects.items);
```

4. **Создание селекторов:**
```typescript
// Для вычисляемых значений создавай selectors
// src/store/slices/objectsSlice.ts
export const selectActiveObjects = (state: RootState) => 
  state.objects.items.filter(obj => obj.status === 'active');

// Использование:
const activeObjects = useAppSelector(selectActiveObjects);
```

5. **Loading состояния:**
```typescript
// Каждый slice имеет loading/error
const { loading, error } = useAppSelector((state) => state.objects);

if (loading) return <Skeleton />;
if (error) return <ErrorMessage text={error} />;
```

**API Client использование:**

```typescript
// ❌ НЕ используй fetch
const response = await fetch('/api/objects');

// ✅ Используй apiClient
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

const response = await apiClient.get(ENDPOINTS.USER.DATA);
// или внутри thunk:
const response = await apiClient.post(ENDPOINTS.ENTITIES.CREATE, { 
  type: 'object', 
  data: { title: 'Новый объект' }
});
```

**Interceptors работают автоматически:**
- Добавляют X-Auth-Token из localStorage
- Перенаправляют на /login при 401/403
- Нормализуют ответы в формат { success, data, error, code }

### Роутинг (src/App.tsx)
```
/login, /register - публичные
/dashboard - главная (лента событий)
/objects - список объектов
/objects/:objectId - детали объекта
/objects/:objectId/works/:workId - детали работы
/inspection/:inspectionId - детали проверки
/defect-report/:reportId - отчет о дефектах
/my-works - работы подрядчика
/contractors - подрядчики
/analytics - аналитика
/admin - админ панель
```

### Контекст авторизации (src/contexts/AuthContext.tsx)

**Состояние:**
```typescript
user: User | null           // текущий пользователь
token: string | null        // JWT токен
userData: UserData | null   // кэш данных (objects, works, inspections, etc.)
isAuthenticated: boolean
isLoading: boolean
```

**Методы:**
```typescript
login(email, password)           // вход по email
loginWithPhone(phone, code)      // вход по SMS
register(data)                   // регистрация
logout()                         // выход
loadUserData()                   // перезагрузка данных с backend
setUserData(data)                // обновление кэша
```

**API endpoints:**
```typescript
AUTH_API = 'https://functions.poehali.dev/b9d6731e-788e-476b-bad5-047bd3d6adc1'
USER_DATA_API = 'https://functions.poehali.dev/bdee636b-a6c0-42d0-8f77-23c316751e34'
VERIFY_CODE_API = 'https://functions.poehali.dev/09b6a02f-8537-4a53-875d-3a46d3fdc278'
```

### Структура компонентов

```
src/components/
├── ui/                          # shadcn/ui компоненты
│   ├── icon.tsx                 # ⚠️ ВСЕГДА используй для иконок!
│   ├── button.tsx, input.tsx, dialog.tsx, etc.
│
├── layout/                      # Навигация
│   ├── TopNavigation.tsx        # Верхнее меню (desktop)
│   ├── BottomNavigation.tsx     # Нижнее меню (mobile)
│
├── dashboard/                   # Dashboard компоненты
│   ├── FeedEventCard.tsx        # Карточка события в ленте
│   ├── CreateActionButton.tsx   # Кнопка создания
│
├── objects/                     # Объекты
│   ├── ObjectsGridView.tsx      # Сетка объектов
│   ├── ObjectsTableView.tsx     # Таблица объектов
│
├── work-journal/                # Журнал работ
│   ├── WorksList.tsx            # Список работ
│   ├── JournalTabContent.tsx    # Контент вкладки журнала
│   ├── CreateInspectionSimple.tsx
│
├── inspection/                  # Проверки
│   ├── InspectionHeader.tsx
│   ├── DefectsSection.tsx
│   ├── ControlPointsSection.tsx
│
├── defect-report/               # Отчеты о дефектах
│   ├── DefectReportHeader.tsx
│   ├── DefectItem.tsx
│
├── admin/                       # Админ панель
│   ├── UsersTable.tsx
│   ├── AdminWorkTypes.tsx
```

### Страницы (src/pages/)

```
Dashboard.tsx         - лента событий (главная)
Objects.tsx           - список объектов
ObjectDetail.tsx      - детали объекта + работы
WorkDetail.tsx        - детали работы + журнал
InspectionDetail.tsx  - проверка + дефекты
MyWorks.tsx           - работы подрядчика
Contractors.tsx       - управление подрядчиками
Analytics.tsx         - аналитика и графики
Admin.tsx             - админ панель
```

### Утилиты (src/utils/)

```
dateValidation.ts        # ⚠️ Валидация дат (isValidDate, safeFormatDate, safeDateCompare)
```

### Типы (src/types/)

Общие TypeScript типы для всего приложения.

---

## ⚠️ ТИПИЧНЫЕ ОШИБКИ И КАК ИХ ИЗБЕЖАТЬ

### 1. Ошибки с датами

**Проблема:** Некорректные даты (например, 1212-12-12) ломают сортировку и отображение

**Решение:**
```typescript
// ✅ ВСЕГДА используй утилиты валидации
import { isValidDate, safeFormatDate, safeDateCompare } from '@/utils/dateValidation';

// Проверка даты
if (!isValidDate(dateString)) {
  return ''; // или дефолтное значение
}

// Безопасное форматирование
const formatted = safeFormatDate(dateString);

// Безопасная сортировка
items.sort((a, b) => safeDateCompare(a.date, b.date));
```

### 2. Ошибки с иконками

**Проблема:** Импорт несуществующих иконок из lucide-react падает

**Решение:**
```typescript
// ❌ НЕ делай так:
import { SomeIcon } from 'lucide-react';

// ✅ ВСЕГДА используй компонент Icon:
import Icon from '@/components/ui/icon';
<Icon name="Home" size={24} fallback="CircleAlert" />
```

### 3. Ошибки с БД в backend

**Проблема:** Использование параметризованных запросов

**Решение:**
```python
# ❌ НЕ делай так:
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# ✅ Делай так:
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")

# ✅ Или так (с экранированием):
from psycopg import sql
query = sql.SQL("SELECT * FROM users WHERE email = {email}").format(
    email=sql.Literal(email)
)
cursor.execute(query)
```

### 4. Ошибки с обновлением userData

**Проблема:** После создания/изменения данных UI не обновляется

**Решение:**
```typescript
// ✅ После изменений вызывай loadUserData()
const { loadUserData } = useAuth();

const handleCreate = async () => {
  await createData(...);
  await loadUserData(); // обновить кэш
};
```

### 5. Проверка авторизации

**Проблема:** Забыл добавить токен в запрос

**Решение:**
```typescript
// ✅ Всегда добавляй заголовок авторизации
const response = await fetch(API_URL, {
  headers: {
    'Content-Type': 'application/json',
    'X-User-Token': token // НЕ Authorization! (зарезервировано провайдером)
  }
});
```

### 6. Фильтрация данных с некорректными датами

**Проблема:** `.filter()` или `.sort()` падает на некорректных датах

**Решение:**
```typescript
// ✅ Используй filterValidDates
import { filterValidDates } from '@/utils/dateValidation';
const validItems = filterValidDates(items, 'scheduled_date');
```

---

## ✅ ЧЕК-ЛИСТ ПЕРЕД РАБОТОЙ

### Перед изменением БД:
- [ ] Проверил текущую структуру через `get_db_info`
- [ ] Использую только Simple Query Protocol
- [ ] Написал миграцию в `db_migrations/`
- [ ] Вызвал `migrate_db` для применения

### Перед изменением backend:
- [ ] Проверил существующую функцию в `/backend/`
- [ ] Использую Simple Query для БД
- [ ] Добавил CORS заголовки
- [ ] Обрабатываю OPTIONS запрос
- [ ] Правильный формат ответа (statusCode, headers, body, isBase64Encoded)
- [ ] Вызову `sync_backend` после изменений

### Перед изменением frontend:
- [ ] Проверил `AuthContext` для понимания данных
- [ ] Использую `Icon` компонент для иконок
- [ ] Валидирую даты через `dateValidation.ts`
- [ ] После изменения данных вызываю `loadUserData()`
- [ ] Добавил токен в заголовок `X-User-Token`

### При отладке:
- [ ] Проверил логи frontend: `get_logs source=frontend`
- [ ] Проверил логи backend: `get_logs source=backend/[function-name]`
- [ ] Проверил данные в БД: `perform_sql_query`

---

## 🎯 БЫСТРЫЕ ССЫЛКИ

**Часто используемые команды:**
```bash
# Структура БД
get_db_info(level="schema", schema_name="t_p8942561_contractor_control_s")

# Проверка данных
perform_sql_query("SELECT * FROM users LIMIT 10")

# Логи frontend
get_logs(source="frontend", limit=100)

# Логи конкретной функции
get_logs(source="backend/user-data", limit=50)
```

**Часто изменяемые файлы:**
- `src/contexts/AuthContext.tsx` - авторизация и кэш
- `src/App.tsx` - роутинг
- `src/components/Layout.tsx` - навигация
- `backend/user-data/index.py` - загрузка данных
- `backend/create-data/index.py` - создание данных

---

---

## 🔄 КЛЮЧЕВЫЕ БИЗНЕС-ПРОЦЕССЫ

### 1. Создание проверки (Inspection)

**Точки входа:**
- Dashboard → CreateInspectionWithWorkSelect
- WorkJournal → CreateInspectionSimple
- ObjectDetail → CreateInspectionSimple

**Схема процесса:**
```
1. Пользователь выбирает работу (work_id)
2. Опционально: выбирает дату (scheduled_date)
3. Frontend валидирует:
   - Дата только в текущем году (если указана)
   - Работа существует
4. Frontend вызывает:
   api.createItem(token, 'inspection', {
     work_id,
     type: scheduledDate ? 'scheduled' : 'unscheduled',
     title: 'Проверка',
     scheduled_date,
     status: scheduledDate ? 'draft' : 'active'
   })
5. Backend (create-data/index.py):
   - Создает запись в inspections
   - Генерирует inspection_number (INS-{work_id}-{counter})
   - Автоматически создает inspection_event:
     * event_type: 'scheduled' (если есть дата) или 'started'
     * metadata: {scheduled_date} (если есть)
6. Frontend:
   - Получает inspection_id из ответа
   - Перенаправляет на /inspection/{id}
   - Вызывает loadUserData() в фоне
```

**Важные поля inspections:**
```sql
id                  - автоинкремент
work_id             - связь с работой (FK)
inspection_number   - уникальный номер (INS-25-1)
created_by          - кто создал (user_id)
status              - draft | active | completed
type                - scheduled | unscheduled
scheduled_date      - дата (только если type=scheduled)
title               - обычно "Проверка"
defects             - JSON массив дефектов
photo_urls          - строка с URL фото
created_at          - автоматически
completed_at        - когда завершена
```

**Важные поля inspection_events:**
```sql
id              - автоинкремент
inspection_id   - связь с проверкой (FK)
event_type      - scheduled | started | completed | rescheduled
created_by      - кто создал событие
metadata        - JSONB с доп. данными:
                  {"scheduled_date": "2025-10-20"}
                  {"defects_count": 2}
created_at      - автоматически
```

**Связь inspections ↔ inspection_events:**
- 1 проверка → много событий (1:N)
- События отображаются в хронологии на странице проверки
- При создании проверки backend АВТОМАТИЧЕСКИ создает первое событие

---

### 2. Создание записи в журнале работ (Work Log)

**Точки входа:**
- Dashboard → JournalEntryModal
- WorkJournal → JournalTabContent
- ObjectDetail → WorkDetailJournal

**Схема процесса:**
```
1. Пользователь заполняет форму:
   - Описание работ (description)
   - Объем (volume) - опционально
   - Материалы (materials) - опционально
   - Фото (photo_urls) - опционально
   - Процент выполнения (progress) - опционально
2. Frontend вызывает:
   api.createItem(token, 'work_log', {
     work_id,
     description,
     volume,
     materials,
     photo_urls: JSON.stringify(urls),
     progress,
     is_work_start: false (или true для первой записи)
   })
3. Backend (create-data/index.py):
   - Создает запись в work_logs
   - Привязывает к работе (work_id)
   - Сохраняет created_by = user_id из токена
4. Frontend:
   - Вызывает loadUserData() для обновления
   - Показывает toast с подтверждением
   - Обновляет ленту событий
```

**Важные поля work_logs:**
```sql
id                      - автоинкремент
work_id                 - связь с работой (FK)
description             - описание работ
volume                  - объем
materials               - материалы
photo_urls              - строка с URL (JSON.stringify)
created_by              - кто создал (user_id)
created_at              - автоматически
is_work_start           - boolean (первая запись = начало работ)
completion_percentage   - прогресс (0-100)
is_inspection_start     - связано с началом проверки
is_inspection_completed - связано с завершением проверки
inspection_id           - связь с проверкой (опционально)
defects_count           - количество дефектов (опционально)
```

**Связь work_logs ↔ inspections:**
- work_log может быть связана с проверкой через inspection_id
- При завершении проверки создается запись в журнале с:
  * is_inspection_completed = true
  * defects_count = количество дефектов
  * inspection_id = ID проверки

---

### 3. Загрузка данных пользователя (loadUserData)

**Когда вызывается:**
- При входе (AuthContext → useEffect)
- После создания/изменения/удаления данных
- При обновлении страницы
- При возврате на страницу после навигации

**Схема процесса:**
```
1. Frontend вызывает:
   const response = await fetch(USER_DATA_API, {
     headers: { 'X-Auth-Token': token }
   })
2. Backend (user-data/index.py):
   - Проверяет токен (JWT)
   - Извлекает user_id и role
   - Выполняет БОЛЬШОЙ JOIN-запрос:
     * objects (с owner/client_id = user_id)
     * works (через objects или contractor_id)
     * inspections (через works)
     * work_logs (через works)
     * contractors (связанные с user)
     * chat_messages (по work_id)
     * unreadCounts (группировка непрочитанных)
3. Backend возвращает:
   {
     objects: [...],
     works: [...],
     inspections: [...],
     workLogs: [...],
     contractors: [...],
     chatMessages: [...],
     unreadCounts: {work_id: {logs: N, messages: M, inspections: K}}
   }
4. Frontend:
   - Сохраняет в AuthContext.userData
   - Компоненты автоматически ре-рендерятся
```

**⚠️ КРИТИЧНО: После изменения данных:**
```typescript
// ❌ НЕПРАВИЛЬНО:
await api.createItem(...);
// UI не обновится!

// ✅ ПРАВИЛЬНО:
await api.createItem(...);
await loadUserData(); // обновить кэш
```

---

### 4. Лента событий (Feed)

**Расположение:** Dashboard.tsx

**Схема загрузки:**
```
1. Frontend вызывает:
   GET https://functions.poehali.dev/f38edb91-216d-4887-b091-ef224db01905?user_id={id}
2. Backend (get-feed/index.py):
   - Объединяет события из:
     * work_logs → тип 'work_log'
     * inspections + inspection_events → типы 'inspection_*'
     * info_posts → тип 'info_post'
   - Сортирует по created_at DESC
   - Обогащает данными:
     * author_name (из users)
     * work_title, object_title
     * metadata событий
3. Frontend:
   - Нормализует photoUrls (parse JSON если строка)
   - Фильтрует по типу и тегам
   - Отображает FeedEventCard для каждого
```

**Типы событий в ленте:**
```typescript
type: 'work_log'                 // Запись в журнале
type: 'inspection'               // Общая проверка
type: 'inspection_scheduled'     // Проверка запланирована
type: 'inspection_started'       // Проверка начата
type: 'inspection_completed'     // Проверка завершена
type: 'info_post'                // Информационный пост
```

---

### 5. Работа с дефектами (Defects)

**Структура хранения:**
```
inspections.defects (TEXT, JSON массив):
[
  {
    "id": "1760623344037",          // timestamp
    "description": "Описание",
    "location": "2 этаж",
    "severity": "high",             // low | medium | high | critical
    "responsible": "Иванов И.И.",
    "deadline": "2025-10-20"
  },
  ...
]
```

**Схема добавления дефекта:**
```
1. На странице InspectionDetail пользователь заполняет форму
2. Frontend:
   - Парсит текущие defects: JSON.parse(inspection.defects || '[]')
   - Добавляет новый дефект с id = Date.now()
   - Вызывает api.updateItem(token, 'inspection', id, {
       defects: JSON.stringify(updatedDefects)
     })
3. Backend (update-data/index.py):
   - Обновляет поле defects в inspections
4. Frontend:
   - loadUserData() для обновления
   - Показывает обновленный список
```

**Отчеты о дефектах (defect_reports):**
```sql
id              - автоинкремент
inspection_id   - связь с проверкой (FK)
title           - название отчета
defects         - JSONB массив дефектов (копия из inspections)
created_by      - кто создал
created_at      - дата создания
```

**Устранение дефектов (defect_remediations):**
```sql
id              - автоинкремент
report_id       - связь с отчетом (FK)
defect_id       - ID дефекта из JSON
status          - pending | in_progress | completed
remediated_at   - когда устранен
remediated_by   - кто устранил
```

---

## 🗺️ НАВИГАЦИЯ И РОУТИНГ

### Карта переходов между страницами

```
/login, /register (публичные)
  ↓ после авторизации
/dashboard (лента событий)
  ├─→ FeedEventCard (клик) → /objects/{objectId} (state: scrollToWork)
  ├─→ CreateActionButton → Модалки создания
  └─→ NotificationsSummary → /messages

/objects (список объектов)
  ├─→ ObjectCard (клик) → /objects/{objectId}
  └─→ Создать объект → /objects/create

/objects/{objectId} (детали объекта)
  ├─→ Редактировать → /objects/{objectId}/edit
  ├─→ Work в списке (клик) → /objects/{objectId}/works/{workId}
  ├─→ Создать работу → /objects/{objectId}/works/create
  └─→ Вкладки: Работы, График, Аналитика

/objects/{objectId}/works/{workId} (детали работы)
  ├─→ Вкладки: Журнал, Описание, Смета, Аналитика
  ├─→ Создать проверку → модалка → /inspection/{id}
  ├─→ Запись в журнале (клик) → /journal-entry/{id}
  └─→ Проверка в списке (клик) → /inspection/{id}

/inspection/{inspectionId} (детали проверки)
  ├─→ Кнопка "Назад" → возврат на предыдущую (через sessionStorage)
  ├─→ Начать/Завершить → обновление статуса + создание события
  ├─→ Добавить дефект → обновление inspections.defects
  └─→ Создать отчет → /defect-report/{id}

/defect-report/{reportId} (отчет о дефектах)
  ├─→ Список дефектов из report.defects
  └─→ Устранение → обновление defect_remediations

/my-works (работы подрядчика)
  └─→ Work (клик) → /objects/{objectId}/works/{workId}

/contractors (подрядчики)
  ├─→ Пригласить → модалка
  └─→ Подрядчик (клик) → модалка с деталями

/analytics (аналитика)
  └─→ Графики по объектам/работам/дефектам

/admin (админ панель)
  ├─→ Пользователи → управление
  ├─→ Типы работ → справочник
  └─→ Статистика
```

### Передача данных через навигацию

**State в navigate:**
```typescript
// Прокрутка к работе в списке
navigate(`/objects/${objectId}`, {
  state: { scrollToWork: workId }
});

// Возврат на предыдущую страницу
sessionStorage.setItem('inspectionFromPage', window.location.pathname);
navigate(`/inspection/${id}`);
// Потом:
const from = sessionStorage.getItem('inspectionFromPage');
if (from) navigate(from);
```

---

## 📊 ЧАСТО ИСПОЛЬЗУЕМЫЕ ЗАПРОСЫ

### Получить все проверки работы с событиями
```sql
SELECT 
  i.*,
  u.name as author_name,
  u.role as author_role,
  (
    SELECT json_agg(json_build_object(
      'id', ie.id,
      'event_type', ie.event_type,
      'created_at', ie.created_at,
      'metadata', ie.metadata
    ) ORDER BY ie.created_at)
    FROM inspection_events ie
    WHERE ie.inspection_id = i.id
  ) as events
FROM inspections i
LEFT JOIN users u ON i.created_by = u.id
WHERE i.work_id = {work_id}
ORDER BY i.created_at DESC;
```

### Получить журнал работ с авторами
```sql
SELECT 
  wl.*,
  u.name as author_name,
  u.role as author_role
FROM work_logs wl
LEFT JOIN users u ON wl.created_by = u.id
WHERE wl.work_id = {work_id}
ORDER BY wl.created_at DESC;
```

### Получить объекты пользователя с количеством работ
```sql
SELECT 
  o.*,
  COUNT(w.id) as works_count,
  SUM(CASE WHEN w.status = 'active' THEN 1 ELSE 0 END) as active_works
FROM objects o
LEFT JOIN works w ON w.object_id = o.id
WHERE o.client_id = {user_id}
GROUP BY o.id
ORDER BY o.created_at DESC;
```

### Получить непрочитанные уведомления по работе
```sql
SELECT 
  w.id as work_id,
  COUNT(DISTINCT wl.id) FILTER (WHERE wl.created_at > v.last_seen_logs) as unread_logs,
  COUNT(DISTINCT cm.id) FILTER (WHERE cm.created_at > v.last_seen_messages) as unread_messages,
  COUNT(DISTINCT i.id) FILTER (WHERE i.created_at > v.last_seen_inspections) as unread_inspections
FROM works w
LEFT JOIN work_views v ON v.work_id = w.id AND v.user_id = {user_id}
LEFT JOIN work_logs wl ON wl.work_id = w.id
LEFT JOIN chat_messages cm ON cm.work_id = w.id
LEFT JOIN inspections i ON i.work_id = w.id
WHERE w.object_id IN (SELECT id FROM objects WHERE client_id = {user_id})
GROUP BY w.id, v.last_seen_logs, v.last_seen_messages, v.last_seen_inspections;
```

---

## 🎯 ПАТТЕРНЫ КОДА

### Создание элемента через API
```typescript
// Всегда один и тот же паттерн:
const handleCreate = async () => {
  if (!token || !user?.id) return;
  
  setLoading(true);
  try {
    const result = await api.createItem(token, 'type', {
      // данные
    });
    
    const itemId = result?.data?.id;
    if (!itemId) throw new Error('No ID returned');
    
    // Опционально: навигация
    navigate(`/path/${itemId}`);
    
    // Обязательно: обновление данных
    await loadUserData();
    
    toast({ title: 'Успех', description: 'Создано' });
  } catch (error) {
    toast({ 
      title: 'Ошибка', 
      description: 'Не удалось создать',
      variant: 'destructive'
    });
  } finally {
    setLoading(false);
  }
};
```

### Безопасная работа с датами
```typescript
import { isValidDate, safeFormatDate, safeDateCompare } from '@/utils/dateValidation';

// Проверка даты
if (!isValidDate(inspection.scheduled_date)) {
  return <span className="text-red-500">Некорректная дата</span>;
}

// Форматирование
const formatted = safeFormatDate(inspection.scheduled_date, {
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

// Сортировка
inspections.sort((a, b) => safeDateCompare(a.scheduled_date, b.scheduled_date));

// Фильтрация
const validInspections = filterValidDates(inspections, 'scheduled_date');
```

### Использование иконок
```typescript
import Icon from '@/components/ui/icon';

// Базовое использование
<Icon name="Home" size={24} />

// С fallback на случай отсутствия иконки
<Icon name="CustomIcon" fallback="CircleAlert" size={20} />

// В кнопках
<Button>
  <Icon name="Plus" size={16} className="mr-2" />
  Создать
</Button>
```

### Работа с userData из AuthContext
```typescript
const { userData, loadUserData } = useAuth();

// Безопасное получение данных
const objects = userData?.objects || [];
const works = userData?.works || [];

// Поиск связанных данных
const work = works.find(w => w.id === workId);
const object = objects.find(o => o.id === work?.object_id);

// Фильтрация
const activeWorks = works.filter(w => w.status === 'active');
const objectWorks = works.filter(w => w.object_id === objectId);
```

---

## 🐛 ОТЛАДКА: С ЧЕГО НАЧАТЬ

### Проблема: "Данные не отображаются"

**Шаг 1: Проверь логи браузера**
```typescript
get_logs(source="frontend", limit=100)
```
Ищи:
- Ошибки сети (Failed to fetch)
- Ошибки валидации (isValidDate)
- Ошибки рендеринга

**Шаг 2: Проверь данные в AuthContext**
```typescript
// В коде Dashboard/Objects/etc посмотри:
console.log('userData:', userData);
console.log('objects:', userData?.objects);
console.log('works:', userData?.works);
```

**Шаг 3: Проверь данные в БД**
```sql
perform_sql_query("SELECT * FROM objects WHERE client_id = {user_id}")
perform_sql_query("SELECT * FROM works WHERE object_id = {object_id}")
```

**Шаг 4: Проверь backend логи**
```typescript
get_logs(source="backend/user-data", limit=50)
```

### Проблема: "Созданный элемент не появился"

**Проверь:**
1. `loadUserData()` вызван после создания?
2. `result?.data?.id` есть в ответе backend?
3. Backend логи показывают успешный INSERT?
4. В БД появилась запись?

```typescript
// Типичная ошибка:
await api.createItem(...);
navigate('/objects'); // ❌ userData не обновлен!

// Правильно:
await api.createItem(...);
await loadUserData(); // ✅ обновили кэш
navigate('/objects');
```

### Проблема: "Ошибка при сортировке дат"

**Причина:** Некорректная дата в БД (например, 1212-12-12)

**Решение:**
```typescript
// 1. Найди проблемные записи:
perform_sql_query(`
  SELECT id, scheduled_date 
  FROM inspections 
  WHERE scheduled_date < '1900-01-01' OR scheduled_date > '2100-12-31'
`)

// 2. Исправь в БД через миграцию
// 3. Используй безопасные утилиты в коде:
import { safeDateCompare, filterValidDates } from '@/utils/dateValidation';
```

---

## 📝 КОНТРОЛЬНЫЙ СПИСОК ПЕРЕД КОММИТОМ

### Backend функция
- [ ] Используется Simple Query Protocol (без %s)
- [ ] Есть обработка OPTIONS для CORS
- [ ] Заголовки включают Access-Control-Allow-Origin: *
- [ ] Формат ответа: {statusCode, headers, body, isBase64Encoded}
- [ ] Токен проверяется через X-Auth-Token (не Authorization!)
- [ ] Логирование ошибок с print()
- [ ] Вызван sync_backend после изменений

### Frontend компонент
- [ ] Используется Icon компонент для иконок
- [ ] Валидация дат через dateValidation.ts
- [ ] После изменения данных вызывается loadUserData()
- [ ] Безопасное получение данных: userData?.objects || []
- [ ] Toast уведомления об успехе/ошибке
- [ ] Loading состояние для async операций

### База данных
- [ ] Изменения через миграцию (migrate_db)
- [ ] Проверена структура через get_db_info
- [ ] Тестовый запрос через perform_sql_query
- [ ] Simple Query Protocol (без параметров)

---

**Последнее обновление:** 2025-10-20  
**Версия:** 2.0  
**Следующее обновление:** при изменении архитектуры или добавлении новых функций