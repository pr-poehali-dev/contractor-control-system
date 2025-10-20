"""
Универсальные helpers для работы с БД
Упрощают подключение и стандартные операции
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Any, Dict, List, Optional, Tuple
from contextlib import contextmanager

DATABASE_URL = os.environ.get('DATABASE_URL')

@contextmanager
def get_db_cursor(cursor_factory=RealDictCursor):
    """
    Context manager для работы с БД
    
    Usage:
        with get_db_cursor() as cur:
            cur.execute("SELECT * FROM users")
            users = cur.fetchall()
    """
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor(cursor_factory=cursor_factory)
    try:
        yield cur
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cur.close()
        conn.close()

def execute_query(query: str, params: Optional[Tuple] = None, fetch_one: bool = False) -> Any:
    """
    Выполняет SELECT запрос и возвращает результат
    
    Args:
        query: SQL запрос
        params: параметры для запроса
        fetch_one: если True, возвращает одну запись, иначе все
    
    Returns:
        Dict или List[Dict] с результатами
    """
    with get_db_cursor() as cur:
        cur.execute(query, params or ())
        if fetch_one:
            return cur.fetchone()
        return cur.fetchall()

def execute_insert(query: str, params: Tuple, returning: bool = True) -> Optional[Dict]:
    """
    Выполняет INSERT запрос
    
    Args:
        query: SQL запрос (может содержать RETURNING)
        params: параметры для запроса
        returning: если True, возвращает результат RETURNING
    
    Returns:
        Dict с результатом RETURNING или None
    """
    with get_db_cursor() as cur:
        cur.execute(query, params)
        if returning:
            return cur.fetchone()
        return None

def execute_update(query: str, params: Tuple, returning: bool = False) -> Optional[Dict]:
    """
    Выполняет UPDATE запрос
    
    Args:
        query: SQL запрос
        params: параметры для запроса
        returning: если True, возвращает результат RETURNING
    
    Returns:
        Dict с результатом RETURNING или None
    """
    with get_db_cursor() as cur:
        cur.execute(query, params)
        if returning:
            return cur.fetchone()
        return None

def execute_delete(query: str, params: Tuple) -> int:
    """
    Выполняет DELETE запрос
    
    Returns:
        Количество удаленных записей
    """
    with get_db_cursor() as cur:
        cur.execute(query, params)
        return cur.rowcount

def check_user_exists(user_id: int) -> bool:
    """
    Проверяет существование и активность пользователя
    """
    user = execute_query(
        "SELECT id FROM users WHERE id = %s AND is_active = true",
        (user_id,),
        fetch_one=True
    )
    return user is not None

def get_user_role(user_id: int) -> Optional[str]:
    """
    Получает роль пользователя
    """
    user = execute_query(
        "SELECT role FROM users WHERE id = %s",
        (user_id,),
        fetch_one=True
    )
    return user['role'] if user else None

def check_object_ownership(object_id: int, user_id: int, user_role: str) -> bool:
    """
    Проверяет, имеет ли пользователь доступ к объекту
    
    Returns:
        True если пользователь владелец или админ
    """
    if user_role == 'admin':
        return True
    
    obj = execute_query(
        "SELECT client_id FROM objects WHERE id = %s",
        (object_id,),
        fetch_one=True
    )
    return obj is not None and obj['client_id'] == user_id

def check_work_access(work_id: int, user_id: int, user_role: str) -> bool:
    """
    Проверяет, имеет ли пользователь доступ к работе
    
    Returns:
        True если пользователь владелец объекта, подрядчик на работе или админ
    """
    if user_role == 'admin':
        return True
    
    # Проверяем владение объектом
    work = execute_query("""
        SELECT w.id, o.client_id, w.contractor_id
        FROM works w
        JOIN objects o ON w.object_id = o.id
        WHERE w.id = %s
    """, (work_id,), fetch_one=True)
    
    if not work:
        return False
    
    # Клиент-владелец объекта
    if work['client_id'] == user_id:
        return True
    
    # Подрядчик на работе
    if user_role == 'contractor':
        contractor = execute_query(
            "SELECT id FROM contractors WHERE user_id = %s",
            (user_id,),
            fetch_one=True
        )
        if contractor and work['contractor_id'] == contractor['id']:
            return True
    
    return False

def get_contractor_id_by_user(user_id: int) -> Optional[int]:
    """
    Получает contractor_id по user_id
    """
    contractor = execute_query(
        "SELECT id FROM contractors WHERE user_id = %s",
        (user_id,),
        fetch_one=True
    )
    return contractor['id'] if contractor else None

def build_filter_clause(filters: Dict[str, Any]) -> Tuple[str, List[Any]]:
    """
    Строит WHERE clause из словаря фильтров
    
    Usage:
        filters = {'status': 'active', 'client_id': 123}
        where, params = build_filter_clause(filters)
        # where = "status = %s AND client_id = %s"
        # params = ['active', 123]
    """
    if not filters:
        return "", []
    
    clauses = []
    params = []
    
    for key, value in filters.items():
        if value is not None:
            clauses.append(f"{key} = %s")
            params.append(value)
    
    where_clause = " AND ".join(clauses) if clauses else ""
    return where_clause, params
