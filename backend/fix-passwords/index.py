'''
Business: Исправление паролей для тестовых пользователей
Args: event
Returns: Результат обновления паролей
'''

import json
import os
import psycopg2
import bcrypt
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        password_123 = "123"
        hash_123 = bcrypt.hashpw(password_123.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cur.execute(
            "UPDATE users SET password_hash = %s WHERE id IN (1, 2, 3, 5)",
            (hash_123,)
        )
        
        password_admin = "admin123"
        hash_admin = bcrypt.hashpw(password_admin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cur.execute(
            "UPDATE users SET password_hash = %s WHERE email = 'admin@example.com'",
            (hash_admin,)
        )
        
        conn.commit()
        
        cur.execute("SELECT COUNT(*) FROM users WHERE password_hash IS NOT NULL")
        total_users = cur.fetchone()[0]
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'success': True,
                'message': f'Updated passwords: test users="123", admin="admin123"',
                'total_users_with_passwords': total_users
            })
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }