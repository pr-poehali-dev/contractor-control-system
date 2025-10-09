"""
Business: Update and delete projects, objects, works
Args: event with httpMethod (PUT/DELETE), headers (X-User-Id), body (type, id, data)
Returns: HTTP response with result or error
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event, context):
    method = event.get('httpMethod', 'PUT')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'User ID required'})
        }
    
    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid user ID'})
        }
    
    body = json.loads(event.get('body', '{}'))
    item_type = body.get('type', '').lower()
    item_id = body.get('id')
    
    if not item_type or not item_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Type and id required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    cur.execute(f"SELECT role FROM users WHERE id = {user_id_int}")
    user_result = cur.fetchone()
    is_admin = user_result and user_result['role'] == 'admin'
    
    try:
        if method == 'DELETE':
            if item_type == 'project':
                project_filter = f"WHERE id = {int(item_id)}" if is_admin else f"WHERE id = {int(item_id)} AND client_id = {user_id_int}"
                
                cur.execute(f"""
                    DELETE FROM remarks 
                    WHERE inspection_id IN (
                        SELECT i.id FROM inspections i
                        JOIN works w ON i.work_id = w.id
                        JOIN objects o ON w.object_id = o.id
                        WHERE o.project_id = {int(item_id)}
                    )
                """)
                cur.execute(f"""
                    DELETE FROM inspection_checkpoints 
                    WHERE inspection_id IN (
                        SELECT i.id FROM inspections i
                        JOIN works w ON i.work_id = w.id
                        JOIN objects o ON w.object_id = o.id
                        WHERE o.project_id = {int(item_id)}
                    )
                """)
                cur.execute(f"""
                    DELETE FROM inspections 
                    WHERE work_id IN (
                        SELECT w.id FROM works w
                        JOIN objects o ON w.object_id = o.id
                        WHERE o.project_id = {int(item_id)}
                    )
                """)
                cur.execute(f"""
                    DELETE FROM work_logs 
                    WHERE work_id IN (
                        SELECT w.id FROM works w
                        JOIN objects o ON w.object_id = o.id
                        WHERE o.project_id = {int(item_id)}
                    )
                """)
                cur.execute(f"""
                    DELETE FROM estimates 
                    WHERE work_id IN (
                        SELECT w.id FROM works w
                        JOIN objects o ON w.object_id = o.id
                        WHERE o.project_id = {int(item_id)}
                    )
                """)
                cur.execute(f"DELETE FROM works WHERE object_id IN (SELECT id FROM objects WHERE project_id = {int(item_id)})")
                cur.execute(f"DELETE FROM objects WHERE project_id = {int(item_id)}")
                cur.execute(f"DELETE FROM projects {project_filter}")
            elif item_type == 'object':
                object_filter = f"WHERE id = {int(item_id)}" if is_admin else f"WHERE id = {int(item_id)} AND project_id IN (SELECT id FROM projects WHERE client_id = {user_id_int})"
                
                cur.execute(f"""
                    DELETE FROM remarks 
                    WHERE inspection_id IN (
                        SELECT i.id FROM inspections i
                        JOIN works w ON i.work_id = w.id
                        WHERE w.object_id = {int(item_id)}
                    )
                """)
                cur.execute(f"""
                    DELETE FROM inspection_checkpoints 
                    WHERE inspection_id IN (
                        SELECT i.id FROM inspections i
                        JOIN works w ON i.work_id = w.id
                        WHERE w.object_id = {int(item_id)}
                    )
                """)
                cur.execute(f"DELETE FROM inspections WHERE work_id IN (SELECT id FROM works WHERE object_id = {int(item_id)})")
                cur.execute(f"DELETE FROM work_logs WHERE work_id IN (SELECT id FROM works WHERE object_id = {int(item_id)})")
                cur.execute(f"DELETE FROM estimates WHERE work_id IN (SELECT id FROM works WHERE object_id = {int(item_id)})")
                cur.execute(f"DELETE FROM works WHERE object_id = {int(item_id)}")
                cur.execute(f"DELETE FROM objects {object_filter}")
            elif item_type == 'work':
                work_filter = f"WHERE id = {int(item_id)}" if is_admin else f"""WHERE id = {int(item_id)} AND object_id IN (
                    SELECT o.id FROM objects o 
                    JOIN projects p ON o.project_id = p.id 
                    WHERE p.client_id = {user_id_int}
                )"""
                
                cur.execute(f"DELETE FROM remarks WHERE inspection_id IN (SELECT id FROM inspections WHERE work_id = {int(item_id)})")
                cur.execute(f"DELETE FROM inspection_checkpoints WHERE inspection_id IN (SELECT id FROM inspections WHERE work_id = {int(item_id)})")
                cur.execute(f"DELETE FROM inspections WHERE work_id = {int(item_id)}")
                cur.execute(f"DELETE FROM work_logs WHERE work_id = {int(item_id)}")
                cur.execute(f"DELETE FROM estimates WHERE work_id = {int(item_id)}")
                cur.execute(f"DELETE FROM works {work_filter}")
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': f'Unknown type: {item_type}'})
                }
            
            conn.commit()
            result = {'success': True, 'deleted': cur.rowcount}
            
        elif method == 'PUT':
            data = body.get('data', {})
            
            if item_type == 'project':
                title = data.get('title', '').replace("'", "''")
                description = data.get('description', '').replace("'", "''")
                status = data.get('status', 'active')
                
                if is_admin:
                    cur.execute(f"""
                        UPDATE projects 
                        SET title = '{title}', description = '{description}', status = '{status}'
                        WHERE id = {int(item_id)}
                        RETURNING id, title, description, status, created_at
                    """)
                else:
                    cur.execute(f"""
                        UPDATE projects 
                        SET title = '{title}', description = '{description}', status = '{status}'
                        WHERE id = {int(item_id)} AND client_id = {user_id_int}
                        RETURNING id, title, description, status, created_at
                    """)
                result_data = cur.fetchone()
                
            elif item_type == 'object':
                title = data.get('title', '').replace("'", "''")
                address = data.get('address', '').replace("'", "''")
                status = data.get('status', 'active')
                
                if is_admin:
                    cur.execute(f"""
                        UPDATE objects 
                        SET title = '{title}', address = '{address}', status = '{status}'
                        WHERE id = {int(item_id)}
                        RETURNING id, title, address, project_id, status
                    """)
                else:
                    cur.execute(f"""
                        UPDATE objects 
                        SET title = '{title}', address = '{address}', status = '{status}'
                        WHERE id = {int(item_id)}
                        AND project_id IN (SELECT id FROM projects WHERE client_id = {user_id_int})
                        RETURNING id, title, address, project_id, status
                    """)
                result_data = cur.fetchone()
                
            elif item_type == 'work':
                title = data.get('title', '').replace("'", "''")
                description = data.get('description', '').replace("'", "''")
                status = data.get('status', 'active')
                contractor_id = data.get('contractor_id')
                
                if is_admin:
                    if contractor_id:
                        cur.execute(f"""
                            UPDATE works 
                            SET title = '{title}', description = '{description}', 
                                status = '{status}', contractor_id = {int(contractor_id)}
                            WHERE id = {int(item_id)}
                            RETURNING id, title, description, object_id, contractor_id, status
                        """)
                    else:
                        cur.execute(f"""
                            UPDATE works 
                            SET title = '{title}', description = '{description}', status = '{status}'
                            WHERE id = {int(item_id)}
                            RETURNING id, title, description, object_id, contractor_id, status
                        """)
                else:
                    if contractor_id:
                        cur.execute(f"""
                            UPDATE works 
                            SET title = '{title}', description = '{description}', 
                                status = '{status}', contractor_id = {int(contractor_id)}
                            WHERE id = {int(item_id)}
                            AND object_id IN (
                                SELECT o.id FROM objects o 
                                JOIN projects p ON o.project_id = p.id 
                                WHERE p.client_id = {user_id_int}
                            )
                            RETURNING id, title, description, object_id, contractor_id, status
                        """)
                    else:
                        cur.execute(f"""
                            UPDATE works 
                            SET title = '{title}', description = '{description}', status = '{status}'
                            WHERE id = {int(item_id)}
                            AND object_id IN (
                                SELECT o.id FROM objects o 
                                JOIN projects p ON o.project_id = p.id 
                                WHERE p.client_id = {user_id_int}
                            )
                            RETURNING id, title, description, object_id, contractor_id, status
                        """)
                result_data = cur.fetchone()
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': f'Unknown type: {item_type}'})
                }
            
            conn.commit()
            
            if result_data:
                for key, value in result_data.items():
                    if hasattr(value, 'isoformat'):
                        result_data[key] = value.isoformat()
                result = {'success': True, 'data': dict(result_data)}
            else:
                result = {'success': False, 'error': 'Not found or no permission'}
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }