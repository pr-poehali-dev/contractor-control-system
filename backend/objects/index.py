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
        return None, {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': False, 'error': 'Authentication required'})}
    
    try:
        import jwt
        JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')
        payload = jwt.decode(auth_token, JWT_SECRET, algorithms=['HS256'])
        return payload, None
    except Exception as e:
        return None, {'statusCode': 401, 'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({'success': False, 'error': 'Invalid token'})}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
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
                    'body': json.dumps({'success': True, 'data': {'objects': objects_list}}),
                    'isBase64Encoded': False
                }
            
            if object_id:
                schema = 't_p8942561_contractor_control_s'
                cur.execute(
                    f"""
                    SELECT o.id, o.title, o.address, o.project_id, o.status, o.created_at, o.updated_at,
                           p.client_id
                    FROM {schema}.objects o
                    INNER JOIN {schema}.projects p ON o.project_id = p.id
                    WHERE o.id = {object_id} AND (p.client_id = {user_id} OR '{user_role}' = 'admin')
                    """
                )
                obj = cur.fetchone()
                
                if not obj:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Object not found'})
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
                    'body': json.dumps({'success': True, 'data': object_data})
                }
            elif project_id:
                schema = 't_p8942561_contractor_control_s'
                cur.execute(
                    f"""
                    SELECT o.id, o.title, o.address, o.project_id, o.status, o.created_at, o.updated_at
                    FROM {schema}.objects o
                    INNER JOIN {schema}.projects p ON o.project_id = p.id
                    WHERE o.project_id = {project_id} AND (p.client_id = {user_id} OR '{user_role}' = 'admin')
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
                    'body': json.dumps({'success': True, 'data': {'objects': objects_list}})
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'object_id or project_id is required'})
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
                    'body': json.dumps({'success': False, 'error': 'project_id, title, and address are required'})
                }
            
            schema = 't_p8942561_contractor_control_s'
            cur.execute(
                f"SELECT client_id FROM {schema}.projects WHERE id = {project_id}"
            )
            project = cur.fetchone()
            
            if not project:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Project not found'})
                }
            
            if project[0] != user_id and user_role != 'admin':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Access denied'})
                }
            
            cur.execute(
                f"""
                INSERT INTO {schema}.objects (title, address, project_id, status, created_at, updated_at)
                VALUES ('{title}', '{address}', {project_id}, '{status}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, title, address, project_id, status, created_at, updated_at
                """
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
                'body': json.dumps({'success': True, 'data': object_data})
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
                    'body': json.dumps({'success': False, 'error': 'Object ID is required'})
                }
            
            schema = 't_p8942561_contractor_control_s'
            cur.execute(
                f"""
                SELECT p.client_id
                FROM {schema}.objects o
                INNER JOIN {schema}.projects p ON o.project_id = p.id
                WHERE o.id = {object_id}
                """
            )
            obj = cur.fetchone()
            
            if not obj:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Object not found'})
                }
            
            if obj[0] != user_id and user_role != 'admin':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Access denied'})
                }
            
            updates = []
            
            if title is not None:
                updates.append(f"title = '{title}'")
            if address is not None:
                updates.append(f"address = '{address}'")
            if status is not None:
                updates.append(f"status = '{status}'")
            
            updates.append("updated_at = CURRENT_TIMESTAMP")
            
            cur.execute(
                f"""
                UPDATE {schema}.objects
                SET {', '.join(updates)}
                WHERE id = {object_id}
                RETURNING id, title, address, project_id, status, created_at, updated_at
                """
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
                'body': json.dumps({'success': True, 'data': object_data})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': False, 'error': 'Method not allowed'})
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }