'''
Business: CRUD операции для проектов
Args: event с httpMethod, body (title, description, status для создания/обновления)
Returns: Данные проекта или список проектов
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
            project_id = event.get('queryStringParameters', {}).get('id')
            
            if project_id:
                cur.execute(
                    """
                    SELECT id, title, description, client_id, status, created_at, updated_at
                    FROM projects
                    WHERE id = %s AND (client_id = %s OR %s = 'admin')
                    """,
                    (project_id, user_id, user_role)
                )
                project = cur.fetchone()
                
                if not project:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Project not found'})
                    }
                
                project_data = {
                    'id': project[0],
                    'title': project[1],
                    'description': project[2],
                    'client_id': project[3],
                    'status': project[4],
                    'created_at': project[5].isoformat() if project[5] else None,
                    'updated_at': project[6].isoformat() if project[6] else None
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(project_data)
                }
            else:
                if user_role == 'admin':
                    cur.execute(
                        """
                        SELECT id, title, description, client_id, status, created_at, updated_at
                        FROM projects
                        ORDER BY created_at DESC
                        """
                    )
                else:
                    cur.execute(
                        """
                        SELECT id, title, description, client_id, status, created_at, updated_at
                        FROM projects
                        WHERE client_id = %s
                        ORDER BY created_at DESC
                        """,
                        (user_id,)
                    )
                
                projects = cur.fetchall()
                projects_list = []
                
                for project in projects:
                    projects_list.append({
                        'id': project[0],
                        'title': project[1],
                        'description': project[2],
                        'client_id': project[3],
                        'status': project[4],
                        'created_at': project[5].isoformat() if project[5] else None,
                        'updated_at': project[6].isoformat() if project[6] else None
                    })
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'projects': projects_list})
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            title = body.get('title', '').strip()
            description = body.get('description', '').strip()
            status = body.get('status', 'active')
            
            if not title:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Title is required'})
                }
            
            if user_role not in ['client', 'admin']:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Only clients can create projects'})
                }
            
            cur.execute(
                """
                INSERT INTO projects (title, description, client_id, status, created_at, updated_at)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, title, description, client_id, status, created_at, updated_at
                """,
                (title, description, user_id, status)
            )
            project = cur.fetchone()
            conn.commit()
            
            project_data = {
                'id': project[0],
                'title': project[1],
                'description': project[2],
                'client_id': project[3],
                'status': project[4],
                'created_at': project[5].isoformat() if project[5] else None,
                'updated_at': project[6].isoformat() if project[6] else None
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(project_data)
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            project_id = body.get('id')
            title = body.get('title')
            description = body.get('description')
            status = body.get('status')
            
            if not project_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Project ID is required'})
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
            
            updates = []
            params = []
            
            if title is not None:
                updates.append("title = %s")
                params.append(title)
            if description is not None:
                updates.append("description = %s")
                params.append(description)
            if status is not None:
                updates.append("status = %s")
                params.append(status)
            
            updates.append("updated_at = CURRENT_TIMESTAMP")
            params.append(project_id)
            
            cur.execute(
                f"""
                UPDATE projects
                SET {', '.join(updates)}
                WHERE id = %s
                RETURNING id, title, description, client_id, status, created_at, updated_at
                """,
                params
            )
            updated_project = cur.fetchone()
            conn.commit()
            
            project_data = {
                'id': updated_project[0],
                'title': updated_project[1],
                'description': updated_project[2],
                'client_id': updated_project[3],
                'status': updated_project[4],
                'created_at': updated_project[5].isoformat() if updated_project[5] else None,
                'updated_at': updated_project[6].isoformat() if updated_project[6] else None
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(project_data)
            }
        
        elif method == 'DELETE':
            project_id = event.get('queryStringParameters', {}).get('id')
            
            if not project_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Project ID is required'})
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
            
            cur.execute("UPDATE projects SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = %s", (project_id,))
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Project archived successfully'})
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
