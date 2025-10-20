# 📦 Backend Shared Modules

Универсальные модули для использования во всех backend функциях.

---

## 🔐 auth_middleware.py

### Декораторы

#### @require_auth
Проверяет JWT токен и извлекает user_id, user_role.

```python
from shared.auth_middleware import require_auth, success_response

@require_auth
def handler(event, context, user_id, user_role):
    """Ваша функция - user_id и user_role уже проверены"""
    
    return success_response({
        'message': f'Hello, user {user_id} with role {user_role}'
    })
```

#### @require_role
Проверяет JWT токен И роль пользователя.

```python
from shared.auth_middleware import require_role, success_response

@require_role('admin', 'client')
def handler(event, context, user_id, user_role):
    """Доступ только для admin и client"""
    
    return success_response({'message': 'Admin area'})
```

### Функции

#### cors_headers()
Возвращает стандартные CORS headers.

```python
from shared.auth_middleware import cors_headers

headers = cors_headers({'Content-Type': 'application/json'})
# {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', ...}
```

#### error_response()
Унифицированный формат ответа с ошибкой.

```python
from shared.auth_middleware import error_response

return error_response(404, 'Object not found')
# {'statusCode': 404, 'headers': {...}, 'body': '{"error": "Object not found"}'}
```

#### success_response()
Унифицированный формат успешного ответа.

```python
from shared.auth_middleware import success_response

return success_response({'data': [1, 2, 3]})
# {'statusCode': 200, 'headers': {...}, 'body': '{"data": [1, 2, 3]}'}
```

#### verify_jwt_token()
Проверяет JWT токен и возвращает payload.

```python
from shared.auth_middleware import verify_jwt_token

try:
    payload = verify_jwt_token(token)
    user_id = payload['user_id']
    user_role = payload['role']
except ValueError as e:
    print(f"Invalid token: {e}")
```

#### extract_user_info()
Извлекает информацию о пользователе без выбрасывания исключений.

```python
from shared.auth_middleware import extract_user_info, error_response

user_id, role, error = extract_user_info(event)
if error:
    return error_response(401, error)

# Используем user_id и role
```

---

## 🗄 db_helper.py

### Context Manager

#### get_db_cursor()
Безопасная работа с БД через context manager.

```python
from shared.db_helper import get_db_cursor

with get_db_cursor() as cur:
    cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cur.fetchone()
# Автоматический commit/rollback и закрытие соединения
```

### CRUD функции

#### execute_query()
Выполняет SELECT запрос.

```python
from shared.db_helper import execute_query

# Получить все записи
users = execute_query("SELECT * FROM users WHERE role = %s", ('client',))

# Получить одну запись
user = execute_query("SELECT * FROM users WHERE id = %s", (123,), fetch_one=True)
```

#### execute_insert()
Выполняет INSERT с RETURNING.

```python
from shared.db_helper import execute_insert

new_object = execute_insert(
    "INSERT INTO objects (title, client_id) VALUES (%s, %s) RETURNING *",
    ('Новый объект', user_id)
)

print(new_object['id'])  # ID нового объекта
```

#### execute_update()
Выполняет UPDATE с опциональным RETURNING.

```python
from shared.db_helper import execute_update

# С RETURNING
updated = execute_update(
    "UPDATE objects SET title = %s WHERE id = %s RETURNING *",
    ('Новое название', object_id),
    returning=True
)

# Без RETURNING
execute_update(
    "UPDATE objects SET status = %s WHERE id = %s",
    ('active', object_id)
)
```

#### execute_delete()
Выполняет DELETE и возвращает количество удаленных записей.

```python
from shared.db_helper import execute_delete

deleted_count = execute_delete(
    "DELETE FROM objects WHERE id = %s",
    (object_id,)
)

print(f"Удалено записей: {deleted_count}")
```

### Проверка прав доступа

#### check_user_exists()
Проверяет существование и активность пользователя.

```python
from shared.db_helper import check_user_exists

if not check_user_exists(user_id):
    return error_response(404, 'User not found or inactive')
```

#### get_user_role()
Получает роль пользователя.

```python
from shared.db_helper import get_user_role

role = get_user_role(user_id)
if role == 'admin':
    # Админ-логика
```

#### check_object_ownership()
Проверяет доступ к объекту.

```python
from shared.db_helper import check_object_ownership

if not check_object_ownership(object_id, user_id, user_role):
    return error_response(403, 'Access denied')
```

#### check_work_access()
Проверяет доступ к работе (владелец объекта, подрядчик или админ).

```python
from shared.db_helper import check_work_access

if not check_work_access(work_id, user_id, user_role):
    return error_response(403, 'Access denied')
```

#### get_contractor_id_by_user()
Получает contractor_id по user_id.

```python
from shared.db_helper import get_contractor_id_by_user

contractor_id = get_contractor_id_by_user(user_id)
if contractor_id:
    print(f"Пользователь - подрядчик с ID {contractor_id}")
```

### Динамические запросы

#### build_filter_clause()
Строит WHERE clause из словаря.

```python
from shared.db_helper import build_filter_clause

filters = {'status': 'active', 'client_id': 123}
where, params = build_filter_clause(filters)

# where = "status = %s AND client_id = %s"
# params = ['active', 123]

query = f"SELECT * FROM objects WHERE {where}"
results = execute_query(query, tuple(params))
```

---

## 📖 Полный пример функции

```python
"""
Business: Получить список работ для текущего пользователя
Args: event with httpMethod GET, headers (X-Auth-Token), queryStringParameters (status)
Returns: JSON список работ
"""

from shared.auth_middleware import require_auth, success_response, error_response
from shared.db_helper import execute_query, get_contractor_id_by_user

@require_auth
def handler(event, context, user_id, user_role):
    # Получаем фильтр из query params
    params = event.get('queryStringParameters', {}) or {}
    status_filter = params.get('status')
    
    # Формируем запрос в зависимости от роли
    if user_role == 'admin':
        # Админ видит все работы
        if status_filter:
            works = execute_query(
                "SELECT * FROM works WHERE status = %s ORDER BY created_at DESC",
                (status_filter,)
            )
        else:
            works = execute_query(
                "SELECT * FROM works ORDER BY created_at DESC"
            )
            
    elif user_role == 'contractor':
        # Подрядчик видит только свои работы
        contractor_id = get_contractor_id_by_user(user_id)
        
        if not contractor_id:
            return error_response(404, 'Contractor profile not found')
        
        if status_filter:
            works = execute_query(
                "SELECT * FROM works WHERE contractor_id = %s AND status = %s ORDER BY created_at DESC",
                (contractor_id, status_filter)
            )
        else:
            works = execute_query(
                "SELECT * FROM works WHERE contractor_id = %s ORDER BY created_at DESC",
                (contractor_id,)
            )
            
    else:
        # Клиент видит работы на своих объектах
        if status_filter:
            works = execute_query("""
                SELECT w.* FROM works w
                JOIN objects o ON w.object_id = o.id
                WHERE o.client_id = %s AND w.status = %s
                ORDER BY w.created_at DESC
            """, (user_id, status_filter))
        else:
            works = execute_query("""
                SELECT w.* FROM works w
                JOIN objects o ON w.object_id = o.id
                WHERE o.client_id = %s
                ORDER BY w.created_at DESC
            """, (user_id,))
    
    return success_response({
        'works': [dict(w) for w in works],
        'total': len(works)
    })
```

---

## 🎯 Best Practices

### 1. Всегда используйте декораторы
```python
# ✅ Правильно
@require_auth
def handler(event, context, user_id, user_role):
    pass

# ❌ Неправильно - дублирование кода
def handler(event, context):
    token = event.get('headers', {}).get('X-Auth-Token')
    if not token:
        return {'statusCode': 401, ...}
    # ... еще 20 строк проверки
```

### 2. Используйте унифицированные ответы
```python
# ✅ Правильно
return success_response({'data': results})
return error_response(404, 'Not found')

# ❌ Неправильно - разные форматы
return {'statusCode': 200, 'body': json.dumps({'data': results})}
return {'statusCode': 404, 'body': json.dumps({'msg': 'Not found'})}
```

### 3. Используйте context manager для БД
```python
# ✅ Правильно
with get_db_cursor() as cur:
    cur.execute("SELECT * FROM users")
    users = cur.fetchall()

# ❌ Неправильно - забыли закрыть соединение
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()
users = cur.fetchall()
# Утечка соединений!
```

### 4. Проверяйте права доступа
```python
# ✅ Правильно
if not check_object_ownership(object_id, user_id, user_role):
    return error_response(403, 'Access denied')

# ❌ Неправильно - любой может удалить любой объект
execute_delete("DELETE FROM objects WHERE id = %s", (object_id,))
```

---

## 🚀 Добавление в новую функцию

1. Скопируйте папку `shared/` в корень вашей функции (или используйте относительный импорт)
2. Добавьте в requirements.txt:
```
PyJWT==2.8.0
psycopg2-binary==2.9.9
```
3. Используйте в коде:
```python
from shared.auth_middleware import require_auth, success_response
from shared.db_helper import execute_query
```

---

## 📝 Примечания

- Все функции автоматически обрабатывают CORS
- JWT токены проверяются через заголовок `X-Auth-Token`
- БД соединение берется из переменной окружения `DATABASE_URL`
- JWT секрет берется из переменной окружения `JWT_SECRET`
