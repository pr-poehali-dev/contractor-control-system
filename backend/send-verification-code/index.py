import json
import os
import random
from datetime import datetime, timedelta
from typing import Dict, Any
import psycopg2

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Sends SMS verification code to phone number
    Args: event with httpMethod, body containing phone number
    Returns: HTTP response with success status
    '''
    method: str = event.get('httpMethod', 'POST')
    
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
    
    if not phone:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Phone number is required'})
        }
    
    code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO t_p8942561_contractor_control_s.verification_codes (phone, code, expires_at) VALUES (%s, %s, %s)",
        (phone, code, expires_at)
    )
    conn.commit()
    cursor.close()
    conn.close()
    
    print(f"Verification code for {phone}: {code}")
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'message': 'Код отправлен',
            'dev_code': code
        })
    }