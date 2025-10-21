import json
import os
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Verifies SMS code and creates user session
    Args: event with httpMethod, body containing phone and code
    Returns: HTTP response with JWT token on success
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, x-auth-token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_str = event.get('body', '{}')
    if not body_str:
        body_str = '{}'
    body_data = json.loads(body_str)
    phone: str = body_data.get('phone', '').strip()
    code: str = body_data.get('code', '').strip()
    
    if not phone or not code:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Phone and code are required'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    jwt_secret = os.environ.get('JWT_SECRET')
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    cursor.execute(
        """SELECT id, verified, expires_at, attempts 
        FROM t_p8942561_contractor_control_s.verification_codes 
        WHERE phone = %s AND code = %s 
        ORDER BY created_at DESC LIMIT 1""",
        (phone, code)
    )
    result = cursor.fetchone()
    
    if not result:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Неверный код'})
        }
    
    code_id, verified, expires_at, attempts = result
    
    if verified:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Код уже использован'})
        }
    
    if datetime.utcnow() > expires_at:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Код истёк'})
        }
    
    if attempts >= 3:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Превышено количество попыток'})
        }
    
    cursor.execute(
        "UPDATE t_p8942561_contractor_control_s.verification_codes SET verified = TRUE WHERE id = %s",
        (code_id,)
    )
    
    cursor.execute(
        "SELECT id, phone, name, role FROM t_p8942561_contractor_control_s.users WHERE phone = %s",
        (phone,)
    )
    user = cursor.fetchone()
    
    if not user:
        if phone.lower() == 'admin':
            user_name = 'Администратор'
            user_role = 'admin'
        else:
            user_name = 'Новый пользователь'
            user_role = 'client'
        
        cursor.execute(
            """INSERT INTO t_p8942561_contractor_control_s.users 
            (phone, name, role, created_at, updated_at, is_active) 
            VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, phone, name, role""",
            (phone, user_name, user_role, datetime.utcnow(), datetime.utcnow(), True)
        )
        user = cursor.fetchone()
    
    conn.commit()
    
    user_id, user_phone, user_name, user_role = user
    
    token_payload = {
        'user_id': user_id,
        'phone': user_phone,
        'name': user_name,
        'role': user_role,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    
    token = jwt.encode(token_payload, jwt_secret, algorithm='HS256')
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'data': {
                'token': token,
                'user': {
                    'id': user_id,
                    'phone': user_phone,
                    'name': user_name,
                    'role': user_role
                }
            }
        })
    }