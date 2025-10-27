'''
Business: CRUD операции для работ на объектах
Args: event с httpMethod, body (object_id, title, contractor_id для создания/обновления)
Returns: Данные работы или список работ объекта
'''

import json
import os
import psycopg2
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL')
SCHEMA = 't_p8942561_contractor_control_s'

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
            work_id = event.get('queryStringParameters', {}).get('id')
            object_id = event.get('queryStringParameters', {}).get('object_id')
            
            if work_id:
                cur.execute(
                    f"""
                    SELECT w.id, w.title, w.description, w.object_id, w.contractor_id, 
                           w.status, w.created_at, w.updated_at,
                           c.name as contractor_name, c.inn
                    FROM {SCHEMA}.works w
                    LEFT JOIN {SCHEMA}.contractors c ON w.contractor_id = c.id
                    INNER JOIN {SCHEMA}.objects o ON w.object_id = o.id
                    INNER JOIN {SCHEMA}.projects p ON o.project_id = p.id
                    WHERE w.id = {work_id} AND (p.client_id = {user_id} OR c.user_id = {user_id} OR '{user_role}' = 'admin')
                    """
                )
                work = cur.fetchone()
                
                if not work:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Work not found'})
                    }
                
                work_data = {
                    'id': work[0],
                    'title': work[1],
                    'description': work[2],
                    'object_id': work[3],
                    'contractor_id': work[4],
                    'status': work[5],
                    'created_at': work[6].isoformat() if work[6] else None,
                    'updated_at': work[7].isoformat() if work[7] else None,
                    'contractor_name': work[8],
                    'contractor_inn': work[9]
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'data': work_data})
                }
            elif object_id:
                cur.execute(
                    f"""
                    SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                           w.status, w.created_at, w.updated_at,
                           c.name as contractor_name, c.inn
                    FROM {SCHEMA}.works w
                    LEFT JOIN {SCHEMA}.contractors c ON w.contractor_id = c.id
                    INNER JOIN {SCHEMA}.objects o ON w.object_id = o.id
                    INNER JOIN {SCHEMA}.projects p ON o.project_id = p.id
                    WHERE w.object_id = {object_id} AND (p.client_id = {user_id} OR c.user_id = {user_id} OR '{user_role}' = 'admin')
                    ORDER BY w.created_at DESC
                    """
                )
                works = cur.fetchall()
                works_list = []
                
                for work in works:
                    works_list.append({
                        'id': work[0],
                        'title': work[1],
                        'description': work[2],
                        'object_id': work[3],
                        'contractor_id': work[4],
                        'status': work[5],
                        'created_at': work[6].isoformat() if work[6] else None,
                        'updated_at': work[7].isoformat() if work[7] else None,
                        'contractor_name': work[8],
                        'contractor_inn': work[9]
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'data': {'works': works_list}})
                }
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'work_id or object_id is required'})
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            object_id = body.get('object_id')
            title = body.get('title', '').strip().replace("'", "''")
            description = body.get('description', '').strip().replace("'", "''")
            contractor_id = body.get('contractor_id')
            status = body.get('status', 'pending')
            
            if not object_id or not title:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'object_id and title are required'})
                }
            
            cur.execute(
                f"""
                SELECT p.client_id
                FROM {SCHEMA}.objects o
                INNER JOIN {SCHEMA}.projects p ON o.project_id = p.id
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
            
            contractor_clause = f"{contractor_id}" if contractor_id else "NULL"
            
            cur.execute(
                f"""
                INSERT INTO {SCHEMA}.works (title, description, object_id, contractor_id, status, created_at, updated_at)
                VALUES ('{title}', '{description}', {object_id}, {contractor_clause}, '{status}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, title, description, object_id, contractor_id, status, created_at, updated_at
                """
            )
            work = cur.fetchone()
            conn.commit()
            
            work_data = {
                'id': work[0],
                'title': work[1],
                'description': work[2],
                'object_id': work[3],
                'contractor_id': work[4],
                'status': work[5],
                'created_at': work[6].isoformat() if work[6] else None,
                'updated_at': work[7].isoformat() if work[7] else None
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'data': work_data})
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            work_id = body.get('id')
            title = body.get('title', '').strip().replace("'", "''")
            description = body.get('description', '').strip().replace("'", "''")
            contractor_id = body.get('contractor_id')
            status = body.get('status', 'pending')
            
            if not work_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'work_id is required'})
                }
            
            cur.execute(
                f"""
                SELECT o.id, p.client_id
                FROM {SCHEMA}.works w
                INNER JOIN {SCHEMA}.objects o ON w.object_id = o.id
                INNER JOIN {SCHEMA}.projects p ON o.project_id = p.id
                WHERE w.id = {work_id}
                """
            )
            work = cur.fetchone()
            
            if not work:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Work not found'})
                }
            
            if work[1] != user_id and user_role != 'admin':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Access denied'})
                }
            
            contractor_clause = f"contractor_id = {contractor_id}" if contractor_id else "contractor_id = NULL"
            
            cur.execute(
                f"""
                UPDATE {SCHEMA}.works
                SET title = '{title}', description = '{description}', {contractor_clause}, status = '{status}', updated_at = CURRENT_TIMESTAMP
                WHERE id = {work_id}
                RETURNING id, title, description, object_id, contractor_id, status, created_at, updated_at
                """
            )
            work = cur.fetchone()
            conn.commit()
            
            work_data = {
                'id': work[0],
                'title': work[1],
                'description': work[2],
                'object_id': work[3],
                'contractor_id': work[4],
                'status': work[5],
                'created_at': work[6].isoformat() if work[6] else None,
                'updated_at': work[7].isoformat() if work[7] else None
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'data': work_data})
            }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            work_id = body.get('id')
            
            if not work_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'work_id is required'})
                }
            
            cur.execute(
                f"""
                SELECT o.id, p.client_id
                FROM {SCHEMA}.works w
                INNER JOIN {SCHEMA}.objects o ON w.object_id = o.id
                INNER JOIN {SCHEMA}.projects p ON o.project_id = p.id
                WHERE w.id = {work_id}
                """
            )
            work = cur.fetchone()
            
            if not work:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Work not found'})
                }
            
            if work[1] != user_id and user_role != 'admin':
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Access denied'})
                }
            
            cur.execute(f"DELETE FROM {SCHEMA}.works WHERE id = {work_id}")
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'message': 'Work deleted successfully'})
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