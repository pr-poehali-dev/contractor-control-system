"""
Business: Update and delete projects, objects, works
Args: event with httpMethod (PUT/DELETE), headers (X-Auth-Token), body (type, id, data)
Returns: HTTP response with result or error
"""
import json
import os
import psycopg2
import jwt
from psycopg2.extras import RealDictCursor

JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')

def verify_jwt_token(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise ValueError('Token expired')
    except jwt.InvalidTokenError:
        raise ValueError('Invalid token')

def handler(event, context):
    method = event.get('httpMethod', 'PUT')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Auth token required'})
        }
    
    try:
        payload = verify_jwt_token(auth_token)
        user_id_int = payload['user_id']
        user_role = payload['role']
    except ValueError as e:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Invalid token'})
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
    
    is_admin = user_role == 'admin'
    
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
                from datetime import datetime, date
                
                title = data.get('title')
                description = data.get('description')
                status = data.get('status')
                contractor_id = data.get('contractor_id')
                start_date = data.get('start_date')
                end_date = data.get('end_date')
                planned_start_date = data.get('planned_start_date')
                planned_end_date = data.get('planned_end_date')
                completion_percentage = data.get('completion_percentage')
                
                today_date = date.today()
                
                if planned_start_date:
                    planned_start = datetime.fromisoformat(planned_start_date.replace('Z', '+00:00')).date()
                    if planned_start <= today_date and not start_date and status == 'pending':
                        status = 'active'
                
                set_parts = []
                if title is not None:
                    set_parts.append(f"title = '{title.replace(chr(39), chr(39)+chr(39))}'")
                if description is not None:
                    set_parts.append(f"description = '{description.replace(chr(39), chr(39)+chr(39))}'")
                if status is not None:
                    set_parts.append(f"status = '{status}'")
                if contractor_id is not None:
                    set_parts.append(f"contractor_id = {int(contractor_id)}")
                if start_date is not None:
                    set_parts.append(f"start_date = '{start_date}'")
                if end_date is not None:
                    set_parts.append(f"end_date = '{end_date}'")
                if planned_start_date is not None:
                    set_parts.append(f"planned_start_date = '{planned_start_date}'")
                if planned_end_date is not None:
                    set_parts.append(f"planned_end_date = '{planned_end_date}'")
                if completion_percentage is not None:
                    set_parts.append(f"completion_percentage = {int(completion_percentage)}")
                
                if not set_parts:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'No fields to update'})
                    }
                
                set_clause = ', '.join(set_parts)
                
                if is_admin:
                    cur.execute(f"""
                        UPDATE works 
                        SET {set_clause}
                        WHERE id = {int(item_id)}
                        RETURNING id, title, description, object_id, contractor_id, status, start_date, end_date, planned_start_date, planned_end_date, completion_percentage
                    """)
                elif user_role == 'contractor':
                    cur.execute(f"""
                        SELECT id FROM contractors WHERE user_id = {user_id_int}
                    """)
                    contractor_row = cur.fetchone()
                    contractor_id_val = contractor_row['id'] if contractor_row else None
                    
                    if contractor_id_val:
                        cur.execute(f"""
                            UPDATE works 
                            SET {set_clause}
                            WHERE id = {int(item_id)} AND contractor_id = {contractor_id_val}
                            RETURNING id, title, description, object_id, contractor_id, status, start_date, end_date, planned_start_date, planned_end_date, completion_percentage
                        """)
                    else:
                        result_data = None
                else:
                    cur.execute(f"""
                        UPDATE works 
                        SET {set_clause}
                        WHERE id = {int(item_id)}
                        AND object_id IN (
                            SELECT o.id FROM objects o 
                            JOIN projects p ON o.project_id = p.id 
                            WHERE p.client_id = {user_id_int}
                        )
                        RETURNING id, title, description, object_id, contractor_id, status, start_date, end_date, planned_start_date, planned_end_date, completion_percentage
                    """)
                
                if user_role != 'contractor' or (user_role == 'contractor' and contractor_id_val):
                    result_data = cur.fetchone()
                else:
                    result_data = None
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