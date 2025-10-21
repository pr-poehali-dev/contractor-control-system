import json
import os
import secrets
import string
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Check contractor by INN and invite or link to client
    Args: event with httpMethod, body containing inn, name, email, phone, client_id
          context with request_id
    Returns: HTTP response with contractor info or existing contractor
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
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
    
    body_data = json.loads(event.get('body', '{}'))
    inn = body_data.get('inn', '').strip()
    name = body_data.get('name', '').strip()
    email = body_data.get('email', '').strip()
    phone = body_data.get('phone', '').strip()
    client_id = body_data.get('client_id')
    
    if not inn or not name or not client_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'INN, name and client_id are required'}),
            'isBase64Encoded': False
        }
    
    import psycopg2
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    schema = 't_p8942561_contractor_control_s'
    
    cur.execute(f"SELECT id, name, email, phone, user_id FROM {schema}.contractors WHERE inn = '{inn}'")
    existing = cur.fetchone()
    
    if existing:
        contractor_id = existing[0]
        contractor_name = existing[1]
        contractor_email = existing[2]
        contractor_phone = existing[3]
        user_id = existing[4]
        
        cur.execute(
            f"SELECT id FROM {schema}.client_contractors WHERE client_id = {client_id} AND contractor_id = {contractor_id}"
        )
        link = cur.fetchone()
        
        if link:
            cur.close()
            conn.close()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'exists': True,
                    'already_linked': True,
                    'contractor': {
                        'id': contractor_id,
                        'name': contractor_name,
                        'inn': inn,
                        'email': contractor_email,
                        'phone': contractor_phone
                    }
                }),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'exists': True,
                'already_linked': False,
                'contractor': {
                    'id': contractor_id,
                    'name': contractor_name,
                    'inn': inn,
                    'email': contractor_email,
                    'phone': contractor_phone
                }
            }),
            'isBase64Encoded': False
        }
    
    password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
    
    cur.execute(
        f"INSERT INTO {schema}.users (name, phone, email, role, password_hash, is_active) "
        f"VALUES ('{name}', '{phone or 'not_provided'}', '{email or 'not_provided'}', 'contractor', '{password}', true) RETURNING id"
    )
    user_id = cur.fetchone()[0]
    
    cur.execute(
        f"INSERT INTO {schema}.contractors (name, inn, email, phone, user_id, contact_info) "
        f"VALUES ('{name}', '{inn}', '{email}', '{phone}', {user_id}, '{json.dumps({'email': email, 'phone': phone})}') RETURNING id"
    )
    contractor_id = cur.fetchone()[0]
    
    cur.execute(
        f"INSERT INTO {schema}.client_contractors (client_id, contractor_id) "
        f"VALUES ({client_id}, {contractor_id})"
    )
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'exists': False,
            'created': True,
            'contractor': {
                'id': contractor_id,
                'name': name,
                'inn': inn,
                'email': email,
                'phone': phone
            },
            'credentials': {
                'email': email,
                'password': password
            }
        }),
        'isBase64Encoded': False
    }