'''
Business: Управление подрядчиками - приглашение по ИНН, поиск, добавление в список заказчика
Args: event с httpMethod, body (inn, name, contact_info для приглашения)
Returns: Данные подрядчика или статус приглашения
'''

import json
import os
import psycopg2
import random
import string
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def generate_temp_password(length=12):
    chars = string.ascii_letters + string.digits + '!@#$%^&*'
    return ''.join(random.choice(chars) for _ in range(length))

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = event.get('queryStringParameters', {}).get('action', '')
            
            if action == 'check-inn':
                inn = body.get('inn', '').strip()
                
                if not inn:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'INN is required'})
                    }
                
                cur.execute(
                    """
                    SELECT c.id, c.name, c.inn, c.contact_info, c.user_id,
                           u.email, u.phone, u.name as user_name
                    FROM contractors c
                    LEFT JOIN users u ON c.user_id = u.id
                    WHERE c.inn = %s
                    """,
                    (inn,)
                )
                contractor = cur.fetchone()
                
                if contractor:
                    contractor_data = {
                        'id': contractor[0],
                        'name': contractor[1],
                        'inn': contractor[2],
                        'contact_info': contractor[3],
                        'user_id': contractor[4],
                        'exists': True,
                        'has_account': contractor[4] is not None,
                        'user': {
                            'email': contractor[5],
                            'phone': contractor[6],
                            'name': contractor[7]
                        } if contractor[4] else None
                    }
                else:
                    contractor_data = {
                        'exists': False,
                        'inn': inn
                    }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(contractor_data)
                }
            
            elif action == 'invite':
                client_id = body.get('client_id')
                inn = body.get('inn', '').strip()
                name = body.get('name', '').strip()
                contact_info = body.get('contact_info', '').strip()
                email = body.get('email', '').strip()
                phone = body.get('phone', '').strip()
                
                if not client_id or not inn or not name:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'client_id, inn, and name are required'})
                    }
                
                cur.execute("SELECT id, user_id FROM contractors WHERE inn = %s", (inn,))
                existing_contractor = cur.fetchone()
                
                if existing_contractor:
                    contractor_id = existing_contractor[0]
                    
                    cur.execute(
                        """
                        INSERT INTO client_contractors (client_id, contractor_id, added_at)
                        VALUES (%s, %s, CURRENT_TIMESTAMP)
                        ON CONFLICT (client_id, contractor_id) DO NOTHING
                        RETURNING id
                        """,
                        (client_id, contractor_id)
                    )
                    result = cur.fetchone()
                    conn.commit()
                    
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'status': 'added',
                            'message': 'Contractor already exists and has been added to your list',
                            'contractor_id': contractor_id,
                            'newly_added': result is not None
                        })
                    }
                else:
                    temp_password = generate_temp_password()
                    
                    import bcrypt
                    password_hash = bcrypt.hashpw(temp_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                    
                    cur.execute(
                        """
                        INSERT INTO users (email, phone, password_hash, name, role, organization, is_active, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, 'contractor', %s, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        RETURNING id
                        """,
                        (email or None, phone or None, password_hash, name, name)
                    )
                    user_id = cur.fetchone()[0]
                    
                    cur.execute(
                        """
                        INSERT INTO contractors (name, inn, contact_info, user_id, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        RETURNING id
                        """,
                        (name, inn, contact_info, user_id)
                    )
                    contractor_id = cur.fetchone()[0]
                    
                    cur.execute(
                        """
                        INSERT INTO client_contractors (client_id, contractor_id, added_at)
                        VALUES (%s, %s, CURRENT_TIMESTAMP)
                        """,
                        (client_id, contractor_id)
                    )
                    
                    cur.execute(
                        """
                        INSERT INTO contractor_invites (client_id, contractor_id, status, created_at)
                        VALUES (%s, %s, 'sent', CURRENT_TIMESTAMP)
                        RETURNING id
                        """,
                        (client_id, contractor_id)
                    )
                    invite_id = cur.fetchone()[0]
                    
                    conn.commit()
                    cur.close()
                    conn.close()
                    
                    return {
                        'statusCode': 201,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({
                            'status': 'created',
                            'message': 'New contractor created and invited',
                            'contractor_id': contractor_id,
                            'user_id': user_id,
                            'invite_id': invite_id,
                            'temp_password': temp_password,
                            'email': email,
                            'phone': phone
                        })
                    }
        
        elif method == 'GET':
            client_id = event.get('queryStringParameters', {}).get('client_id')
            
            if not client_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'client_id is required'})
                }
            
            cur.execute(
                """
                SELECT c.id, c.name, c.inn, c.contact_info, cc.added_at,
                       u.email, u.phone, u.name as user_name
                FROM contractors c
                INNER JOIN client_contractors cc ON c.id = cc.contractor_id
                LEFT JOIN users u ON c.user_id = u.id
                WHERE cc.client_id = %s
                ORDER BY cc.added_at DESC
                """,
                (client_id,)
            )
            contractors = cur.fetchall()
            
            contractors_list = []
            for contractor in contractors:
                contractors_list.append({
                    'id': contractor[0],
                    'name': contractor[1],
                    'inn': contractor[2],
                    'contact_info': contractor[3],
                    'added_at': contractor[4].isoformat() if contractor[4] else None,
                    'user': {
                        'email': contractor[5],
                        'phone': contractor[6],
                        'name': contractor[7]
                    } if contractor[5] or contractor[6] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'contractors': contractors_list})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
