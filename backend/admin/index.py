'''
Business: Админ-панель для суперпользователя - просмотр всех пользователей, справочники
Args: event с httpMethod, admin token в заголовках
Returns: Список пользователей, статистика, данные справочников
'''

import json
import os
import psycopg2
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def verify_admin(event: Dict[str, Any]) -> tuple:
    auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not auth_token:
        return None, {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Authentication required'})}
    
    try:
        import jwt
        JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')
        payload = jwt.decode(auth_token, JWT_SECRET, algorithms=['HS256'])
        
        if payload.get('role') != 'admin':
            return None, {'statusCode': 403, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Admin access required'})}
        
        return payload, None
    except Exception as e:
        return None, {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Invalid token'})}

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
    
    admin_payload, error_response = verify_admin(event)
    if error_response:
        return error_response
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            action = event.get('queryStringParameters', {}).get('action', 'stats')
            
            if action == 'stats':
                cur.execute("SELECT COUNT(*) FROM users WHERE role = 'client'")
                clients_count = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM users WHERE role = 'contractor'")
                contractors_count = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM projects")
                projects_count = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM objects")
                objects_count = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM works")
                works_count = cur.fetchone()[0]
                
                cur.execute("SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days'")
                new_users_week = cur.fetchone()[0]
                
                stats = {
                    'clients_count': clients_count,
                    'contractors_count': contractors_count,
                    'total_users': clients_count + contractors_count,
                    'projects_count': projects_count,
                    'objects_count': objects_count,
                    'works_count': works_count,
                    'new_users_week': new_users_week
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(stats)
                }
            
            elif action == 'users':
                role_filter = event.get('queryStringParameters', {}).get('role')
                
                if role_filter:
                    cur.execute(
                        """
                        SELECT id, name, email, phone, role, organization, is_active, created_at, last_login
                        FROM users
                        WHERE role = %s
                        ORDER BY created_at DESC
                        LIMIT 100
                        """,
                        (role_filter,)
                    )
                else:
                    cur.execute(
                        """
                        SELECT id, name, email, phone, role, organization, is_active, created_at, last_login
                        FROM users
                        ORDER BY created_at DESC
                        LIMIT 100
                        """
                    )
                
                users = cur.fetchall()
                users_list = []
                
                for user in users:
                    users_list.append({
                        'id': user[0],
                        'name': user[1],
                        'email': user[2],
                        'phone': user[3],
                        'role': user[4],
                        'organization': user[5],
                        'is_active': user[6],
                        'created_at': user[7].isoformat() if user[7] else None,
                        'last_login': user[8].isoformat() if user[8] else None
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'users': users_list})
                }
            
            elif action == 'contractors':
                cur.execute(
                    """
                    SELECT c.id, c.name, c.inn, c.contact_info, c.user_id, c.created_at,
                           u.email, u.phone, u.is_active
                    FROM contractors c
                    LEFT JOIN users u ON c.user_id = u.id
                    ORDER BY c.created_at DESC
                    LIMIT 100
                    """
                )
                contractors = cur.fetchall()
                contractors_list = []
                
                for contractor in contractors:
                    contractors_list.append({
                        'id': contractor[0],
                        'name': contractor[1],
                        'inn': contractor[2],
                        'contact_info': contractor[3],
                        'user_id': contractor[4],
                        'created_at': contractor[5].isoformat() if contractor[5] else None,
                        'user_email': contractor[6],
                        'user_phone': contractor[7],
                        'is_active': contractor[8]
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'contractors': contractors_list})
                }
            
            elif action == 'work-templates':
                cur.execute(
                    """
                    SELECT id, name, description, category, created_at
                    FROM work_templates
                    ORDER BY category, name
                    """
                )
                templates = cur.fetchall()
                templates_list = []
                
                for template in templates:
                    templates_list.append({
                        'id': template[0],
                        'name': template[1],
                        'description': template[2],
                        'category': template[3],
                        'created_at': template[4].isoformat() if template[4] else None
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'templates': templates_list})
                }
            
            elif action == 'work-types':
                cur.execute(
                    """
                    SELECT id, name, description, unit, category, created_at
                    FROM work_types
                    ORDER BY category, name
                    """
                )
                work_types = cur.fetchall()
                work_types_list = []
                
                for wt in work_types:
                    work_types_list.append({
                        'id': wt[0],
                        'name': wt[1],
                        'description': wt[2],
                        'unit': wt[3],
                        'category': wt[4],
                        'created_at': wt[5].isoformat() if wt[5] else None
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'work_types': work_types_list})
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action'})
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = event.get('queryStringParameters', {}).get('action')
            
            if action == 'add-work-type':
                name = body.get('name')
                description = body.get('description')
                unit = body.get('unit')
                category = body.get('category')
                
                if not name or not unit:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'name and unit are required'})
                    }
                
                cur.execute(
                    """
                    INSERT INTO work_types (name, description, unit, category, created_at)
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                    RETURNING id, name, description, unit, category, created_at
                    """,
                    (name, description, unit, category)
                )
                work_type = cur.fetchone()
                conn.commit()
                
                work_type_data = {
                    'id': work_type[0],
                    'name': work_type[1],
                    'description': work_type[2],
                    'unit': work_type[3],
                    'category': work_type[4],
                    'created_at': work_type[5].isoformat() if work_type[5] else None
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(work_type_data)
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action'})
                }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            action = event.get('queryStringParameters', {}).get('action')
            
            if action == 'toggle-user':
                user_id = body.get('user_id')
                is_active = body.get('is_active')
                
                if user_id is None or is_active is None:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'user_id and is_active are required'})
                    }
                
                cur.execute(
                    "UPDATE users SET is_active = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s",
                    (is_active, user_id)
                )
                conn.commit()
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'User status updated'})
                }
            
            elif action == 'add-template':
                name = body.get('name')
                description = body.get('description')
                category = body.get('category')
                
                if not name or not category:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'name and category are required'})
                    }
                
                cur.execute(
                    """
                    INSERT INTO work_templates (name, description, category, created_at)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                    RETURNING id, name, description, category, created_at
                    """,
                    (name, description, category)
                )
                template = cur.fetchone()
                conn.commit()
                
                template_data = {
                    'id': template[0],
                    'name': template[1],
                    'description': template[2],
                    'category': template[3],
                    'created_at': template[4].isoformat() if template[4] else None
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(template_data)
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action'})
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