# API Endpoints - Подряд-ПРО

## База данных готова ✅
- PostgreSQL с полной схемой
- Связи: users → contractors → projects → objects → works
- Миграции применены (5 файлов)

## Авторизация и регистрация

### 🔐 Auth API
**URL:** `https://functions.poehali.dev/b9d6731e-788e-476b-bad5-047bd3d6adc1`

**Регистрация:**
```http
POST /?action=register
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+79991234567",
  "password": "SecurePass123",
  "name": "Иван Иванов",
  "role": "client",
  "organization": "ООО Стройка"
}

Response 201:
{
  "token": "eyJ...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Иван Иванов",
    "role": "client"
  }
}
```

**Вход:**
```http
POST /?action=login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response 200:
{
  "token": "eyJ...",
  "user": { ... }
}
```

**Проверка токена:**
```http
GET /?action=verify
X-Auth-Token: eyJ...

Response 200:
{
  "user": { ... }
}
```

---

## Подрядчики

### 👷 Contractors API
**URL:** `https://functions.poehali.dev/4bcd4efc-3b22-4eea-9434-44cc201a86f8`

**Проверка ИНН:**
```http
POST /?action=check-inn
Content-Type: application/json

{
  "inn": "1234567890"
}

Response 200 (существует):
{
  "exists": true,
  "id": 5,
  "name": "ООО Ремонт",
  "inn": "1234567890",
  "has_account": true
}

Response 200 (не существует):
{
  "exists": false,
  "inn": "1234567890"
}
```

**Приглашение подрядчика:**
```http
POST /?action=invite
X-Auth-Token: eyJ...
Content-Type: application/json

{
  "client_id": 1,
  "inn": "1234567890",
  "name": "ООО Ремонт",
  "contact_info": "+7 999 888-77-66",
  "email": "contractor@example.com",
  "phone": "+79998887766"
}

Response 201 (новый):
{
  "status": "created",
  "contractor_id": 5,
  "temp_password": "xK9j@2pL4mN",
  "email": "contractor@example.com"
}

Response 200 (уже существует):
{
  "status": "added",
  "contractor_id": 5,
  "newly_added": true
}
```

**Список подрядчиков заказчика:**
```http
GET /?client_id=1
X-Auth-Token: eyJ...

Response 200:
{
  "contractors": [
    {
      "id": 5,
      "name": "ООО Ремонт",
      "inn": "1234567890",
      "contact_info": "+7 999 888-77-66",
      "added_at": "2025-01-15T10:30:00"
    }
  ]
}
```

---

## Проекты

### 📁 Projects API
**URL:** `https://functions.poehali.dev/00185d2e-3a07-4ae4-a170-594c2c6d9b81`

**Создать проект:**
```http
POST /
X-Auth-Token: eyJ...
Content-Type: application/json

{
  "title": "ЖК Новостройка",
  "description": "Жилой комплекс на 500 квартир",
  "status": "active"
}

Response 201:
{
  "id": 10,
  "title": "ЖК Новостройка",
  "client_id": 1,
  "status": "active",
  "created_at": "..."
}
```

**Список проектов:**
```http
GET /
X-Auth-Token: eyJ...

Response 200:
{
  "projects": [ ... ]
}
```

**Получить проект:**
```http
GET /?id=10
X-Auth-Token: eyJ...
```

**Обновить проект:**
```http
PUT /
X-Auth-Token: eyJ...
Content-Type: application/json

{
  "id": 10,
  "title": "ЖК Новостройка (обновлено)",
  "status": "completed"
}
```

---

## Объекты

### 🏗️ Objects API
**URL:** `https://functions.poehali.dev/354c1d24-5775-4678-ba82-bb1acd986337`

**Создать объект:**
```http
POST /
X-Auth-Token: eyJ...
Content-Type: application/json

{
  "project_id": 10,
  "title": "Дом №1",
  "address": "ул. Строителей, 25",
  "status": "active"
}
```

**Список объектов проекта:**
```http
GET /?project_id=10
X-Auth-Token: eyJ...
```

**Обновить объект:**
```http
PUT /
X-Auth-Token: eyJ...
Content-Type: application/json

{
  "id": 15,
  "status": "completed"
}
```

---

## Работы

### 🔨 Works API
**URL:** `https://functions.poehali.dev/3910c724-a679-45d8-abd9-2c463bcc525a`

**Создать работу:**
```http
POST /
X-Auth-Token: eyJ...
Content-Type: application/json

{
  "object_id": 15,
  "title": "Монтаж перекрытий",
  "description": "Монтаж ж/б плит перекрытия",
  "contractor_id": 5,
  "status": "pending"
}
```

**Список работ объекта:**
```http
GET /?object_id=15
X-Auth-Token: eyJ...

Response 200:
{
  "works": [
    {
      "id": 20,
      "title": "Монтаж перекрытий",
      "contractor_name": "ООО Ремонт",
      "status": "pending"
    }
  ]
}
```

**Обновить работу (изменить статус):**
```http
PUT /
X-Auth-Token: eyJ...
Content-Type: application/json

{
  "id": 20,
  "status": "completed"
}
```

---

## Админ-панель

### 🛡️ Admin API
**URL:** `https://functions.poehali.dev/0b65962d-5a9a-40b3-8108-41e8d32b4a76`

⚠️ **Требуется токен с ролью admin**

**Статистика:**
```http
GET /?action=stats
X-Auth-Token: eyJ... (admin token)

Response 200:
{
  "clients_count": 10,
  "contractors_count": 25,
  "total_users": 35,
  "projects_count": 50,
  "objects_count": 150,
  "works_count": 1200,
  "new_users_week": 5
}
```

**Список пользователей:**
```http
GET /?action=users
X-Auth-Token: eyJ... (admin token)

Response 200:
{
  "users": [
    {
      "id": 1,
      "name": "Иван Иванов",
      "email": "ivan@example.com",
      "role": "client",
      "is_active": true
    }
  ]
}
```

**Заблокировать/активировать пользователя:**
```http
PUT /?action=toggle-user
X-Auth-Token: eyJ... (admin token)
Content-Type: application/json

{
  "user_id": 5,
  "is_active": false
}
```

---

## Тестовые аккаунты

### 👤 Администратор
- **Email:** admin@example.com
- **Пароль:** admin123
- **Роль:** admin

---

## Секреты проекта

⚠️ **ВАЖНО:** Для работы системы нужно добавить секрет:

- **JWT_SECRET** - случайная строка минимум 32 символа для подписи токенов

---

## Следующие шаги

1. ✅ Добавить секрет JWT_SECRET через UI
2. 🔄 Обновить frontend для работы с реальным API
3. 🔄 Убрать хардкод из компонентов
4. 🔄 Подключить API клиент к новым эндпоинтам
