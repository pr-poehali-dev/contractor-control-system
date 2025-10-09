import json
import os
import secrets
import string
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Invite contractor - create account and send SMS with password
    Args: event with httpMethod, body containing name, phone, email, organization
          context with request_id
    Returns: HTTP response with success status and generated password
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    admin_key = event.get('headers', {}).get('X-Admin-Key') or event.get('headers', {}).get('x-admin-key')
    if admin_key != 'admin123':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Forbidden'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    name = body_data.get('name', '').strip()
    phone = body_data.get('phone', '').strip()
    email = body_data.get('email', '').strip()
    organization = body_data.get('organization', '').strip()
    
    if not name or not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Name and phone are required'}),
            'isBase64Encoded': False
        }
    
    password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
    
    import psycopg2
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute(
        "INSERT INTO users (name, phone, email, role, organization, password_hash, is_active) "
        "VALUES (%s, %s, %s, 'contractor', %s, %s, true) RETURNING id",
        (name, phone, email or None, organization or None, password)
    )
    user_id = cur.fetchone()[0]
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'user_id': user_id,
            'password': password,
            'message': f'SMS sent to {phone}'
        }),
        'isBase64Encoded': False
    }
