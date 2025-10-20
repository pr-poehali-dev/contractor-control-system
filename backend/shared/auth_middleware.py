"""
Универсальный middleware для проверки JWT токенов
Используется во всех защищенных endpoint'ах
"""

import json
import os
import jwt
from typing import Dict, Any, Callable, Optional, Tuple

JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """
    Проверяет JWT токен и возвращает payload
    Raises: ValueError если токен невалидный или истек
    """
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise ValueError('Token expired')
    except jwt.InvalidTokenError:
        raise ValueError('Invalid token')

def get_token_from_event(event: Dict[str, Any]) -> Optional[str]:
    """
    Извлекает токен из headers события
    Поддерживает X-Auth-Token в разных регистрах
    """
    headers = event.get('headers', {})
    return headers.get('X-Auth-Token') or headers.get('x-auth-token')

def cors_headers(additional_headers: Optional[Dict[str, str]] = None) -> Dict[str, str]:
    """
    Возвращает стандартные CORS headers
    """
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id, X-Session-Id',
        'Access-Control-Max-Age': '86400'
    }
    if additional_headers:
        headers.update(additional_headers)
    return headers

def handle_cors_preflight() -> Dict[str, Any]:
    """
    Обрабатывает OPTIONS preflight запрос
    """
    return {
        'statusCode': 200,
        'headers': cors_headers(),
        'body': ''
    }

def error_response(status_code: int, message: str) -> Dict[str, Any]:
    """
    Возвращает стандартный формат ответа с ошибкой
    """
    return {
        'statusCode': status_code,
        'headers': cors_headers({'Content-Type': 'application/json'}),
        'body': json.dumps({'error': message})
    }

def success_response(data: Any, status_code: int = 200) -> Dict[str, Any]:
    """
    Возвращает стандартный формат успешного ответа
    """
    return {
        'statusCode': status_code,
        'headers': cors_headers({'Content-Type': 'application/json'}),
        'body': json.dumps(data, default=str)
    }

def require_auth(handler: Callable) -> Callable:
    """
    Декоратор для проверки авторизации
    
    Usage:
        @require_auth
        def my_handler(event, context, user_id, user_role):
            # user_id и user_role уже проверены
            return success_response({'message': 'OK'})
    """
    def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        # Обработка OPTIONS
        if event.get('httpMethod') == 'OPTIONS':
            return handle_cors_preflight()
        
        # Проверка токена
        token = get_token_from_event(event)
        if not token:
            return error_response(401, 'No token provided')
        
        try:
            payload = verify_jwt_token(token)
            user_id = payload['user_id']
            user_role = payload['role']
        except ValueError as e:
            return error_response(401, str(e))
        except Exception:
            return error_response(401, 'Invalid token')
        
        # Вызываем оригинальный handler с user_id и user_role
        return handler(event, context, user_id, user_role)
    
    return wrapper

def require_role(*allowed_roles: str) -> Callable:
    """
    Декоратор для проверки роли пользователя
    
    Usage:
        @require_role('admin', 'client')
        def my_handler(event, context, user_id, user_role):
            # Только admin или client могут зайти
            return success_response({'message': 'OK'})
    """
    def decorator(handler: Callable) -> Callable:
        def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
            # Обработка OPTIONS
            if event.get('httpMethod') == 'OPTIONS':
                return handle_cors_preflight()
            
            # Проверка токена
            token = get_token_from_event(event)
            if not token:
                return error_response(401, 'No token provided')
            
            try:
                payload = verify_jwt_token(token)
                user_id = payload['user_id']
                user_role = payload['role']
            except ValueError as e:
                return error_response(401, str(e))
            except Exception:
                return error_response(401, 'Invalid token')
            
            # Проверка роли
            if user_role not in allowed_roles:
                return error_response(403, f'Access denied. Required role: {", ".join(allowed_roles)}')
            
            # Вызываем оригинальный handler
            return handler(event, context, user_id, user_role)
        
        return wrapper
    return decorator

def extract_user_info(event: Dict[str, Any]) -> Tuple[Optional[int], Optional[str], Optional[str]]:
    """
    Извлекает информацию о пользователе из токена (без выбрасывания ошибок)
    Возвращает: (user_id, user_role, error_message)
    
    Usage:
        user_id, role, error = extract_user_info(event)
        if error:
            return error_response(401, error)
    """
    token = get_token_from_event(event)
    if not token:
        return None, None, 'No token provided'
    
    try:
        payload = verify_jwt_token(token)
        return payload['user_id'], payload['role'], None
    except ValueError as e:
        return None, None, str(e)
    except Exception:
        return None, None, 'Invalid token'
