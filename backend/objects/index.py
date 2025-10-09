'''
Business: CRUD операции для строительных объектов
Args: event с httpMethod, body (project_id, title, address для создания/обновления)
Returns: Данные объекта или список объектов проекта
'''

import json
import os
import psycopg2
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def verify_user(event: Dict[str, Any]) -> tuple:
    auth_token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not auth_token:
        return None, {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'error': 'Authentication required'})}
    
    try:
        import jwt
        JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')
        payload = jwt.decode(auth_token, JWT_SECRET, algorithms=['HS256'])
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
    
    user_payload, error_response = verify_user(event)
    if error_response:
        return error_response
    
    user_id = user_payload['user_id']
    user_role = user_payload['role']
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            object_id = event.get('queryStringParameters', {}).get('id')
            project_id = event.get('queryStringParameters', {}).get('project_id')
            contractor_id = event.get('queryStringParameters', {}).get('contractor_id')
            
            if contractor_id:
                schema = 't_p8942561_contractor_control_s'
                cur.execute(
                    f"""
                    SELECT DISTINCT o.id, o.title, o.address, o.project_id, o.status, o.created_at, o.updated_at
                    FROM {schema}.objects o
                    INNER JOIN {schema}.works w ON o.id = w.object_id
                    WHERE w.contractor_id = {contractor_id}
                    ORDER BY o.created_at DESC
                    """
                )
                objects = cur.fetchall()
                
                objects_list = []
                for obj in objects:
                    objects_list.append({
                        'id': obj[0],
                        'title': obj[1],
                        'address': obj[2],
                        'project_id': obj[3],
                        'status': obj[4],
                        'created_at': obj[5].isoformat() if obj[5] else None,
                        'updated_at': obj[6].isoformat() if obj[6] else None
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'objects': objects_list}),
                    'isBase64Encoded': False
                }
            
            if object_id:
                cur.execute(
                    """
                    SELECT o.id, o.title, o.address, o.project_id, o.status, o.created_at, o.updated_at,
                           p.client_id
                    FROM objects o
                    INNER JOIN projects p ON o.project_id = p.id
                    WHERE o.id = %s AND (p.client_id = %s OR %s = 'admin')
                    """,
                    (object_id, user_id, user_role)
                )
                obj = cur.fetchone()
                
                if not obj:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Object not found'})
                    }
                
                object_data = {
                    'id': obj[0],
                    'title': obj[1],
                    'address': obj[2],
                    'project_id': obj[3],
                    'status': obj[4],
                    'created_at': obj[5].isoformat() if obj[5] else None,
                    'updated_at': obj[6].isoformat() if obj[6] else None
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(object_data)
                }
            elif project_id:
                cur.execute(
                    """
                    SELECT o.id, o.title, o.address, o.project_id, o.status, o.created_at, o.updated_at
                    FROM objects o
                    INNER JOIN projects p ON o.project_id = p.id
                    WHERE o.project_id = %s AND (p.client_id = %s OR %s = 'admin')
                    ORDER BY o.created_at DESC
                    """,
                    (project_id, user_id, user_role)
                )
                objects = cur.fetchall()
                objects_list = []
                
                for obj in objects:
                    objects_list.append({
                        'id': obj[0],
                        'title': obj[1],
                        'address': obj[2],
                        'project_id': obj[3],
                        'status': obj[4],
                        'created_at': obj[5].isoformat() if obj[5] else None,
                        'updated_at': obj[6].isoformat() if obj[6] else None
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'objects': objects_list})
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'object_id or project_id is required'})
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            project_id = body.get('project_id')
            title = body.get('title', '').strip()
            address = body.get('address', '').strip()
            status = body.get('status', 'active')
            
            if not project_id or not title or not address:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'project_id, title, and address are required'})
                }
            
            cur.execute(
                "SELECT client_id FROM projects WHERE id = %s",
                (project_id,)
            )
            project = cur.fetchone()
            
            if not project:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Project not found'})
                }
            
            if project[0] != user_id and user_role != 'admin':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Access denied'})
                }
            
            cur.execute(
                """
                INSERT INTO objects (title, address, project_id, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, title, address, project_id, status, created_at, updated_at
                """,
                (title, address, project_id, status)
            )
            obj = cur.fetchone()
            conn.commit()
            
            object_data = {
                'id': obj[0],
                'title': obj[1],
                'address': obj[2],
                'project_id': obj[3],
                'status': obj[4],
                'created_at': obj[5].isoformat() if obj[5] else None,
                'updated_at': obj[6].isoformat() if obj[6] else None
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(object_data)
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            object_id = body.get('id')
            title = body.get('title')
            address = body.get('address')
            status = body.get('status')
            
            if not object_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Object ID is required'})
                }
            
            cur.execute(
                """
                SELECT p.client_id
                FROM objects o
                INNER JOIN projects p ON o.project_id = p.id
                WHERE o.id = %s
                """,
                (object_id,)
            )
            obj = cur.fetchone()
            
            if not obj:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Object not found'})
                }
            
            if obj[0] != user_id and user_role != 'admin':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Access denied'})
                }
            
            updates = []
            params = []
            
            if title is not None:
                updates.append("title = %s")
                params.append(title)
            if address is not None:
                updates.append("address = %s")
                params.append(address)
            if status is not None:
                updates.append("status = %s")
                params.append(status)
            
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(object_id)
            
            cur.execute(
                f"""
                UPDATE objects
                SET {', '.join(updates)}
                WHERE id = %s
                RETURNING id, title, address, project_id, status, created_at, updated_at
                """,
                params
            )
            updated_obj = cur.fetchone()
            conn.commit()
            
            object_data = {
                'id': updated_obj[0],
                'title': updated_obj[1],
                'address': updated_obj[2],
                'project_id': updated_obj[3],
                'status': updated_obj[4],
                'created_at': updated_obj[5].isoformat() if updated_obj[5] else None,
                'updated_at': updated_obj[6].isoformat() if updated_obj[6] else None
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(object_data)
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