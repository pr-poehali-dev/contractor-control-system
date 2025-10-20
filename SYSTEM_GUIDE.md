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
Backend:   Python 3.11 (Cloud Functions)
Database:  PostgreSQL (Simple Query Protocol ONLY!)
Auth:      JWT токены в localStorage
Icons:     lucide-react через компонент Icon
```

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
src/main.tsx → src/App.tsx → src/components/Layout.tsx
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

**Последнее обновление:** 2025-10-20  
**Версия:** 1.0  
**Следующее обновление:** при изменении архитектуры или добавлении новых функций
