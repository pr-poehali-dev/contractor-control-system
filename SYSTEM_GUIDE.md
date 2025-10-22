# 🚀 СИСТЕМА КОНТРОЛЯ СТРОИТЕЛЬСТВА - РУКОВОДСТВО ДЛЯ АССИСТЕНТА

> **КРИТИЧНО**: Всегда проверяй этот файл перед началом работы и обновляй его при изменениях в архитектуре!

---

## 📋 ОГЛАВЛЕНИЕ
1. [Общая архитектура](#общая-архитектура)
2. [База данных](#база-данных)
3. [Backend функции](#backend-функции)
4. [Frontend структура](#frontend-структура)
5. [Компоненты Dashboard](#компоненты-dashboard)
6. [Типичные ошибки и как их избежать](#типичные-ошибки)
7. [Чек-лист перед работой](#чек-лист)

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
import psycopg2
from psycopg2.extras import RealDictCursor
conn = psycopg2.connect(dsn)
cursor = conn.cursor(cursor_factory=RealDictCursor)
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
- `get-feed/` - **НОВАЯ ФУНКЦИЯ** - лента событий для dashboard (work_logs, inspections, info_posts)
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
    ├── chatMessagesSlice.ts  // сообщения в чате
    ├── defectReportsSlice.ts  // отчеты о дефектах
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
│   ├── FeedFilters.tsx          # Фильтры ленты (все/журнал/проверки/инфо + теги)
│   ├── CreateActionButton.tsx   # Кнопка создания
│   ├── JournalEntryModal.tsx    # Модалка создания записи журнала
│   ├── CreateInspectionWithWorkSelect.tsx  # Модалка создания проверки
│   ├── InfoPostModal.tsx        # Модалка инфо-поста
│   ├── DashboardStats.tsx       # Статистика dashboard
│
├── objects/                     # Объекты
│   ├── ObjectsGridView.tsx      # Сетка объектов
│   ├── ObjectsTableView.tsx     # Таблица объектов
│
├── work-journal/                # Журнал работ
│   ├── WorksList.tsx            # Список работ
│   ├── JournalTabContent.tsx    # Контент вкладки журнала
│   ├── CreateInspectionSimple.tsx
│   ├── NotificationsSummary.tsx # Сводка уведомлений
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
│
├── onboarding/                  # Онбординг
│   ├── OnboardingFlow.tsx       # Пошаговый тур для новых пользователей
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

---

## 📄 СТРАНИЦЫ И РОУТИНГ

### Dashboard (src/pages/Dashboard.tsx) - `/dashboard`

**Основной функционал:**
- Загрузка ленты через `backend/get-feed/`
- Фильтрация по типу события (все/журнал/проверки/инфо)
- Фильтрация по тегам (объекты/работы/подрядчики) с умной логикой доступности
- Поиск по содержимому событий
- Создание записей журнала, проверок, инфо-постов

**Типы событий в ленте:**
```typescript
interface FeedEvent {
  id: string;
  type: 'work_log' | 'inspection' | 'info_post';
  inspectionType?: 'scheduled' | 'unscheduled';
  inspectionNumber?: string;
  title: string;
  description: string;
  timestamp: string;
  status?: string;
  workId?: number;
  objectId?: number;
  objectTitle?: string;
  workTitle?: string;
  author?: string;
  photoUrls?: string[];
  materials?: string;
  volume?: string;
  defects?: string;
  defectsCount?: number;
  scheduledDate?: string;
}
```

**Загрузка ленты:**
```typescript
const loadFeed = async () => {
  const url = `${ENDPOINTS.FEED}?user_id=${user.id}`;
  const response = await apiClient.get(url);
  
  if (response.success) {
    const rawEvents = (response as any).events || [];
    // Нормализация photoUrls из строки в массив
    const normalizedEvents = rawEvents.map((event: any) => {
      if (event.photoUrls && typeof event.photoUrls === 'string') {
        try {
          event.photoUrls = JSON.parse(event.photoUrls);
        } catch {
          event.photoUrls = [event.photoUrls];
        }
      }
      return event;
    });
    setFeed(normalizedEvents);
  }
};
```

### Фильтры (src/components/dashboard/FeedFilters.tsx)

**Компонент FeedFilters:**
- Поисковая строка с иконкой поиска
- Фильтр по типу события (Все/Журнал/Проверки/Инфо) через Popover
- Фильтры по тегам (Объекты/Работы/Подрядчики) с счетчиками выбранных
- **Горизонтальный скроллинг** фильтров (одна строка, без переноса)
- Умная логика доступности тегов: тег деактивируется если нет совместимых событий

**Интерфейс:**
```typescript
interface FeedFiltersProps {
  filter: 'all' | 'work_logs' | 'inspections' | 'info_posts';
  onFilterChange: (filter) => void;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: Array<{ 
    id: string; 
    label: string; 
    type: 'object' | 'work' | 'contractor'; 
    workIds?: number[] 
  }>;
  feed: any[];
  works: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}
```

**Логика доступности тегов:**
```typescript
const isTagAvailable = (tagId: string, tagType: 'object' | 'work' | 'contractor'): boolean => {
  // Если ничего не выбрано, все доступны
  if (selectedTags.length === 0) return true;

  // Проверяем, есть ли в feed события, совместимые с этим тегом
  const hasCompatibleEvents = feed.some(event => {
    // Проверяем совместимость с уже выбранными тегами
    const objectMatch = selectedObjects.length === 0 || selectedObjects.includes(eventObjectId);
    const workMatch = selectedWorks.length === 0 || selectedWorks.includes(eventWorkId);
    const contractorMatch = selectedContractors.length === 0 || selectedContractors.includes(eventContractor);
    
    // Проверяем, подходит ли событие к новому тегу
    if (tagType === 'object') {
      return tagId === eventObjectId && workMatch && contractorMatch;
    }
    // ... аналогично для work и contractor
  });

  return hasCompatibleEvents;
};
```

**Горизонтальный скроллинг:**
```typescript
<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
     style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
  {/* Фильтры */}
</div>

// В src/index.css:
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

### Карточки событий (src/components/dashboard/FeedEventCard.tsx)

**Отображает:**
- Тип события с иконкой (журнал/проверка/инфо)
- Заголовок и описание
- Объект и работа
- Дата и автор
- Фото (если есть)
- Статус (для проверок)
- Счетчик дефектов (для проверок)

### Создание действий

**JournalEntryModal** - создание записи журнала:
- Выбор объекта и работы
- Описание работ
- Объем и материалы
- Фото (placeholder для будущей функции загрузки)

**CreateInspectionWithWorkSelect** - создание проверки:
- Выбор объекта и работы
- Тип проверки (плановая/внеплановая)
- Дата проверки
- Контрольные точки

**InfoPostModal** - создание инфо-поста:
- Заголовок
- Содержание
- Ссылка (опционально)

---

## ⚠️ ТИПИЧНЫЕ ОШИБКИ

### 1. Backend: Extended Query вместо Simple Query
```python
# ❌ НЕПРАВИЛЬНО
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# ✅ ПРАВИЛЬНО
cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")
```

### 2. Frontend: fetch() вместо apiClient
```typescript
// ❌ НЕПРАВИЛЬНО
const response = await fetch('/api/objects');

// ✅ ПРАВИЛЬНО
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';
const response = await apiClient.get(ENDPOINTS.USER.DATA);
```

### 3. Frontend: Context вместо Redux
```typescript
// ❌ НЕПРАВИЛЬНО
const { objects } = useAuth();

// ✅ ПРАВИЛЬНО
import { useAppSelector } from '@/store/hooks';
const objects = useAppSelector((state) => state.objects.items);
```

### 4. Frontend: Прямой импорт иконок вместо Icon компонента
```typescript
// ❌ НЕПРАВИЛЬНО
import { Home } from 'lucide-react';
<Home size={24} />

// ✅ ПРАВИЛЬНО
import Icon from '@/components/ui/icon';
<Icon name="Home" size={24} />
```

### 5. Backend: Забыть CORS headers
```python
# ✅ ВСЕГДА добавляй
'Access-Control-Allow-Origin': '*'
```

### 6. Frontend: Не нормализовать photoUrls
```typescript
// ✅ ВСЕГДА проверяй тип photoUrls
if (event.photoUrls && typeof event.photoUrls === 'string') {
  try {
    event.photoUrls = JSON.parse(event.photoUrls);
  } catch {
    event.photoUrls = [event.photoUrls];
  }
}
```

---

## ✅ ЧЕК-ЛИСТ ПЕРЕД РАБОТОЙ

### Перед началом задачи:
1. ☑ Прочитал SYSTEM_GUIDE.md
2. ☑ Понял архитектуру Redux (slices, thunks, selectors)
3. ☑ Знаю где apiClient и ENDPOINTS
4. ☑ Помню про Simple Query в backend
5. ☑ Знаю структуру FeedEvent и логику фильтров

### При работе с backend:
1. ☑ Использую psycopg2 с RealDictCursor
2. ☑ Использую Simple Query (f-string), НЕ Extended Query (%s)
3. ☑ Добавил CORS headers в ответ
4. ☑ Обрабатываю OPTIONS для CORS preflight
5. ☑ Возвращаю правильный формат ответа

### При работе с frontend:
1. ☑ Использую apiClient из @/api/apiClient
2. ☑ Использую ENDPOINTS из @/api/endpoints
3. ☑ Использую useAppSelector/useAppDispatch из @/store/hooks
4. ☑ Использую Icon компонент для иконок
5. ☑ Нормализую photoUrls перед использованием
6. ☑ Добавил loading/error состояния

### При работе с Dashboard:
1. ☑ Понял структуру FeedEvent
2. ☑ Знаю как работает логика фильтрации (тип + теги + поиск)
3. ☑ Знаю как работает isTagAvailable (умная доступность)
4. ☑ Помню про горизонтальный скроллинг фильтров
5. ☑ Знаю какие модалки есть для создания действий

---

## 📝 ПРИМЕРЫ КОДА

### Создание Redux slice
```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/api/apiClient';
import { ENDPOINTS } from '@/api/endpoints';

export const fetchItems = createAsyncThunk(
  'items/fetch',
  async (userId: string) => {
    const response = await apiClient.get(`${ENDPOINTS.USER.DATA}?user_id=${userId}`);
    return response.data.items;
  }
);

const itemsSlice = createSlice({
  name: 'items',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error';
      });
  }
});

export default itemsSlice.reducer;
```

### Backend функция с Simple Query
```python
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get user items
    Args: event with httpMethod, queryStringParameters (user_id)
    Returns: HTTP response with items list
    '''
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {}) or {}
    user_id = params.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'user_id is required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # ✅ Simple Query - подставляем значения напрямую
    cur.execute(f"SELECT * FROM items WHERE user_id = {user_id}")
    items = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'items': [dict(row) for row in items]
        }),
        'isBase64Encoded': False
    }
```

---

## 🏢 СТРАНИЦА ОБЪЕКТОВ

### Objects (src/pages/Objects.tsx) - `/objects`

**Основной функционал:**
- Список всех объектов заказчика
- Переключение вида: сетка / таблица
- Создание нового объекта
- Редактирование объекта
- Статистика по каждому объекту (работы, завершенность)

**Компоненты:**
- `ObjectsGridView` - карточки объектов в сетке
- `ObjectsTableView` - таблица объектов с сортировкой

**Данные:**
```typescript
// Загрузка из Redux
const objects = useAppSelector((state) => state.objects.items);
const works = useAppSelector((state) => state.works.items);
```

### ObjectDetail (src/pages/ObjectDetail.tsx) - `/objects/:objectId`

**Основной функционал:**
- Детали объекта (название, адрес, статус)
- Список работ на объекте
- Сортировка работ (по приоритету / по названию)
- Фильтрация по статусу (все / активные / задержанные / завершенные)
- Редактирование объекта
- **Автоматический редирект на первую работу** (desktop)

**Статусы работ:**
```typescript
const statusInfo = getWorkStatusInfo(work);
// status: 'active' | 'delayed' | 'completed' | 'awaiting_start' | 'awaiting_acceptance' | 'planned'
// color: цвет badge
// label: текстовое описание
```

**Приоритет сортировки:**
```typescript
const priorityOrder = { 
  awaiting_start: 0,      // Ожидает начала (высший)
  delayed: 1,             // Задержка
  active: 2,              // В работе
  awaiting_acceptance: 3, // Ожидает приемки
  completed: 4,           // Завершена
  planned: 5              // Запланирована
};
```

**Карточка работы:**
- Название и подрядчик
- Статус (badge с цветом)
- Даты начала и окончания
- Прогресс (progress bar)
- Счетчик непрочитанных сообщений
- Клик → переход к WorkDetail

---

## 🛠️ СТРАНИЦА РАБОТЫ И ЖУРНАЛ

### WorkDetail (src/pages/WorkDetail.tsx) - `/objects/:objectId/works/:workId`

**Рендерит компонент WorkJournal с выбранной работой.**

### WorkJournal (src/components/WorkJournal.tsx)

**Главный компонент для работы с журналом работ.**

**Структура:**
```
┌─────────────────────────────────────────┐
│  WorksList (левая панель, desktop)      │  ← список работ объекта
├─────────────────────────────────────────┤
│  WorkHeader                             │  ← название, подрядчик, прогресс
├─────────────────────────────────────────┤
│  Tabs: Журнал | Инфо | Смета | Аналитика │
├─────────────────────────────────────────┤
│  Tab Content                            │
└─────────────────────────────────────────┘
```

**Вкладки:**

#### 1. Журнал (JournalTabContent)
- **События журнала** (work_logs):
  - Записи о выполненных работах
  - Начало работ
  - Сообщения в чате
  - События проверок
- **Группировка по датам** с красивыми разделителями
- **Поле ввода сообщения** внизу с кнопками:
  - Отправить сообщение
  - Добавить запись в журнал (WorkReportModal)
  - Создать проверку (CreateInspectionSimple)

**Компонент EventItem:**
```typescript
interface JournalEvent {
  id: number;
  type: 'work_log' | 'message' | 'inspection_start' | 'inspection_completed' | 'work_start';
  created_by: number;
  created_at: string;
  author: string;
  description?: string;
  volume?: string;
  materials?: string;
  photo_urls?: string[];
  inspection?: any;
}
```

**Типы событий:**
- `work_log` - запись о выполненных работах (синий)
- `message` - сообщение в чате (серый)
- `inspection_start` - проверка начата (зеленый)
- `inspection_completed` - проверка завершена (зеленый)
- `work_start` - работа начата (оранжевый)

#### 2. Инфо (InfoTab)
- Описание работы
- Контрольные точки (checkpoints)
- Сроки выполнения
- Бюджет и фактические затраты

#### 3. Смета (EstimateTab)
- Плановая смета
- Фактические затраты
- Отклонения

#### 4. Аналитика (AnalyticsTab)
- График прогресса
- Статистика работ
- Финансовые показатели

**WorkReportModal** - создание записи журнала:
```typescript
{
  description: string;  // Описание работ
  volume: string;       // Объем
  materials: string;    // Материалы
  photo_urls: string[]; // Фото (placeholder)
}
```

**Автоматическая пометка "просмотрено":**
```typescript
useEffect(() => {
  if (selectedWork) {
    await apiClient.post(ENDPOINTS.MARK_SEEN, { work_id: selectedWork });
  }
}, [selectedWork]);
```

---

## 🔍 СТРАНИЦА ПРОВЕРКИ

### InspectionDetail (src/pages/InspectionDetail.tsx) - `/inspection/:inspectionId`

**Основной функционал:**
- Просмотр и редактирование проверки
- Добавление дефектов
- Выбор контрольных точек
- Создание отчета о дефектах
- Статусы: draft (черновик) → active (начата) → completed (завершена)

**Структура:**
```
┌─────────────────────────────────────────┐
│  InspectionHeader                       │  ← номер, дата, статус
├─────────────────────────────────────────┤
│  ScheduledInspectionNotice (если draft) │  ← уведомление о плановой проверке
├─────────────────────────────────────────┤
│  ControlPointsSection                   │  ← контрольные точки (чекбоксы)
├─────────────────────────────────────────┤
│  CommonDefectsSection                   │  ← типовые дефекты (быстрый выбор)
├─────────────────────────────────────────┤
│  DefectsSection                         │  ← список добавленных дефектов
├─────────────────────────────────────────┤
│  DefectReportCard (если есть отчет)     │  ← карточка отчета о дефектах
├─────────────────────────────────────────┤
│  InspectionActions                      │  ← кнопки действий
└─────────────────────────────────────────┘
```

**Дефект:**
```typescript
interface Defect {
  id: string;
  description: string;
  location: string;
  severity: 'critical' | 'major' | 'minor';
  responsible: string;
  deadline: string;
  photos?: string[];
}
```

**Контрольная точка:**
```typescript
interface ControlPoint {
  id: number;
  description: string;
  category: string;
}
```

**Действия:**
- **Начать проверку** (draft → active)
- **Сохранить черновик** (active)
- **Завершить проверку** (active → completed)
- **Создать отчет о дефектах** (если есть дефекты)

**Логика контрольных точек:**
- Клик по точке → добавляет описание в поле дефекта
- Автоскролл к форме добавления дефекта
- Чекбокс показывает выбранные точки

**Загрузка фото:**
```typescript
const { 
  newDefectPhotos,      // массив URL загруженных фото
  uploadingPhotos,      // флаг загрузки
  handleFileSelect,     // выбор файлов
  handleRemovePhoto,    // удаление фото
  resetPhotos          // сброс после добавления дефекта
} = useDefectPhotos();
```

---

## 📋 СТРАНИЦА ОТЧЕТА О ДЕФЕКТАХ

### DefectReport (src/pages/DefectReport.tsx) - `/defect-report/:reportId`

**Основной функционал:**
- Просмотр отчета о дефектах
- Список дефектов с фото
- Устранение дефектов подрядчиком
- Принятие устранения заказчиком

**Компоненты:**
- `DefectReportHeader` - заголовок отчета
- `DefectItem` - карточка дефекта

**Статусы устранения дефекта:**
- `pending` - ожидает устранения
- `in_progress` - в процессе устранения
- `remediated` - устранен (ожидает проверки)
- `accepted` - принят заказчиком
- `rejected` - отклонен заказчиком

---

## 👷 СТРАНИЦА РАБОТ ПОДРЯДЧИКА

### MyWorks (src/pages/MyWorks.tsx) - `/my-works`

**Для подрядчиков - список их работ на всех объектах.**

**Основной функционал:**
- Список работ подрядчика
- Группировка по объектам
- Фильтрация по статусу
- Переход к журналу работы

**Загрузка данных:**
```typescript
const response = await apiClient.get(
  `${ENDPOINTS.CONTRACTORS.TASKS}?contractor_id=${user.id}`
);
```

---

## 🤝 СТРАНИЦА ПОДРЯДЧИКОВ

### Contractors (src/pages/Contractors.tsx) - `/contractors`

**Для заказчиков - управление подрядчиками.**

**Основной функционал:**
- Список подрядчиков
- Приглашение нового подрядчика
- Проверка по ИНН (существует ли в системе)
- Привязка существующего подрядчика
- Детали подрядчика (объекты, работы)

**Компоненты:**
- `ContractorDetailsModal` - детальная информация о подрядчике

**Логика приглашения:**
```typescript
// 1. Проверка по ИНН
const response = await apiClient.post(ENDPOINTS.CONTRACTORS.INVITE, {
  inn, name, email, phone, client_id
});

// 2. Если существует и НЕ привязан → предложить привязку
if (data.exists && !data.already_linked) {
  setExistingContractor(data.contractor);
}

// 3. Если существует и УЖЕ привязан → ошибка
if (data.exists && data.already_linked) {
  toast({ title: 'Подрядчик уже привязан' });
}

// 4. Если НЕ существует → создать приглашение (отправится email)
if (data.invitation_sent) {
  toast({ title: 'Приглашение отправлено' });
}
```

**Привязка:**
```typescript
const response = await apiClient.post(ENDPOINTS.CONTRACTORS.LINK, {
  client_id: user.id,
  contractor_id: existingContractor.id
});
```

---

## 📊 СТРАНИЦА АНАЛИТИКИ

### Analytics (src/pages/Analytics.tsx) - `/analytics`

**Основной функционал:**
- Общая статистика (прогресс, бюджет, экономия)
- Вкладки: По проектам | По работам | Финансы
- Графики и диаграммы (recharts)

**Вычисляемые данные:**
```typescript
// По объектам
const projectsData = objects.map(obj => {
  const objectWorks = works.filter(w => w.object_id === obj.id);
  const totalBudget = objectWorks.reduce((sum, w) => sum + parseFloat(w.budget), 0);
  const avgProgress = objectWorks.reduce((sum, w) => sum + parseFloat(w.progress), 0) / objectWorks.length;
  
  return { name: obj.title, plan: 100, fact: avgProgress, budget: totalBudget };
});

// По работам
const worksData = works.map(work => ({
  work: work.title,
  progress: Math.round(parseFloat(work.progress)),
  planned: parseFloat(work.budget),
  actual: parseFloat(work.actual_cost),
  deviation: ((actual - planned) / planned) * 100
}));
```

**Компоненты:**
- `BarChart` (recharts) - график по проектам
- `Progress` - прогресс бары
- `Badge` - статусы работ

---

## 👤 АДМИН ПАНЕЛЬ

### Admin (src/pages/Admin.tsx) - `/admin`

**Только для role='admin'**

**Вкладки:**

#### 1. Пользователи (UsersTable)
- Список всех пользователей
- Фильтрация по роли (client / contractor / admin)
- Редактирование пользователя
- Блокировка/разблокировка

**Управление:**
```typescript
const response = await apiClient.post(ENDPOINTS.ADMIN.USERS, {
  method: 'update',
  user_id,
  data: { name, email, role, organization }
});
```

#### 2. Типы работ (AdminWorkTypes)
- Справочник типов работ
- Категории работ
- Добавление/редактирование типа

**Типы работ:**
```typescript
interface WorkType {
  id: number;
  name: string;
  category: 'construction' | 'engineering' | 'finishing' | 'other';
  description: string;
}
```

---

## 🔔 УВЕДОМЛЕНИЯ И СЧЕТЧИКИ

### Непрочитанные сообщения

**Счетчики:**
```typescript
const unreadCounts = userData?.unreadCounts || {};
// Структура: { work_id: count }

// Отображение:
{unreadCounts[work.id] > 0 && (
  <Badge variant="destructive">{unreadCounts[work.id]}</Badge>
)}
```

**Пометка "просмотрено":**
```typescript
await apiClient.post(ENDPOINTS.MARK_SEEN, { work_id });
// После перехода к работе автоматически
```

### NotificationsSummary (src/components/work-journal/NotificationsSummary.tsx)

**Сводка уведомлений в Dashboard:**
- Новые сообщения
- Новые записи журнала
- Новые проверки
- Группировка по работам

---

## 🎯 ONBOARDING

### OnboardingFlow (src/components/onboarding/OnboardingFlow.tsx)

**Пошаговый тур для новых пользователей (react-joyride).**

**Шаги:**
1. Создание объекта
2. Добавление работы
3. Приглашение подрядчика
4. Журнал работ
5. Создание проверки

**Логика:**
```typescript
// Показывается только если:
// - Пользователь новый (нет объектов)
// - Еще не проходил (localStorage)

const shouldShowOnboarding = 
  objects.length === 0 && 
  !localStorage.getItem('onboarding_completed');
```

---

**Последнее обновление:** 2025-10-22  
**Версия:** 3.0 (добавлено полное описание всех страниц и компонентов)