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
SCHEMA = 't_p8942561_contractor_control_s'

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
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
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
            'body': json.dumps({'success': False, 'error': 'Auth token required'})
        }
    
    try:
        payload = verify_jwt_token(auth_token)
        user_id_int = payload['user_id']
        user_role = payload['role']
    except ValueError as e:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': 'Invalid token'})
        }
    
    body = json.loads(event.get('body', '{}'))
    item_type = body.get('type', '').lower()
    item_id = body.get('id')
    
    if not item_type or not item_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': 'Type and id required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    is_admin = user_role == 'admin'
    
    try:
        if item_type == 'user' and method == 'PUT':
            data = body.get('data', {})
            update_fields = []
            
            if 'name' in data:
                update_fields.append(f"name = '{data['name']}'")
            if 'phone' in data:
                update_fields.append(f"phone = '{data['phone']}'")
            if 'email' in data:
                update_fields.append(f"email = '{data['email']}'")
            
            if not update_fields:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': False, 'error': 'No fields to update'})
                }
            
            update_query = f"UPDATE {SCHEMA}.users SET {', '.join(update_fields)} WHERE id = {user_id_int} RETURNING id, name, email, phone, role"
            cur.execute(update_query)
            updated_user = cur.fetchone()
            conn.commit()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True, 'data': {'user': dict(updated_user)}})
            }
        
        if method == 'DELETE':
            if item_type == 'project':
                project_filter = f"WHERE id = {int(item_id)}" if is_admin else f"WHERE id = {int(item_id)} AND client_id = {user_id_int}"
                
                cur.execute(f"""
                    DELETE FROM {SCHEMA}.remarks 
                    WHERE inspection_id IN (
                        SELECT i.id FROM {SCHEMA}.inspections i
                        JOIN {SCHEMA}.works w ON i.work_id = w.id
                        JOIN {SCHEMA}.objects o ON w.object_id = o.id
                        WHERE o.project_id = {int(item_id)}
                    )
                """)
                cur.execute(f"""
                    DELETE FROM {SCHEMA}.inspection_checkpoints 
                    WHERE inspection_id IN (
                        SELECT i.id FROM {SCHEMA}.inspections i
                        JOIN {SCHEMA}.works w ON i.work_id = w.id
                        JOIN {SCHEMA}.objects o ON w.object_id = o.id
                        WHERE o.project_id = {int(item_id)}
                    )
                """)
                cur.execute(f"""
                    DELETE FROM {SCHEMA}.inspections 
                    WHERE work_id IN (
                        SELECT w.id FROM {SCHEMA}.works w
                        JOIN {SCHEMA}.objects o ON w.object_id = o.id
                        WHERE o.project_id = {int(item_id)}
                    )
                """)
                cur.execute(f"""
                    DELETE FROM {SCHEMA}.work_logs 
                    WHERE work_id IN (
                        SELECT w.id FROM {SCHEMA}.works w
                        JOIN {SCHEMA}.objects o ON w.object_id = o.id
                        WHERE o.project_id = {int(item_id)}
                    )
                """)
                cur.execute(f"""
                    DELETE FROM {SCHEMA}.estimates 
                    WHERE work_id IN (
                        SELECT w.id FROM {SCHEMA}.works w
                        JOIN {SCHEMA}.objects o ON w.object_id = o.id
                        WHERE o.project_id = {int(item_id)}
                    )
                """)
                cur.execute(f"DELETE FROM {SCHEMA}.works WHERE object_id IN (SELECT id FROM {SCHEMA}.objects WHERE project_id = {int(item_id)})")
                cur.execute(f"DELETE FROM {SCHEMA}.objects WHERE project_id = {int(item_id)}")
                cur.execute(f"DELETE FROM {SCHEMA}.projects {project_filter}")
            elif item_type == 'object':
                object_filter = f"WHERE id = {int(item_id)}" if is_admin else f"WHERE id = {int(item_id)} AND (client_id = {user_id_int} OR project_id IN (SELECT id FROM {SCHEMA}.projects WHERE client_id = {user_id_int}))"
                
                cur.execute(f"""
                    DELETE FROM {SCHEMA}.remarks 
                    WHERE inspection_id IN (
                        SELECT i.id FROM {SCHEMA}.inspections i
                        JOIN {SCHEMA}.works w ON i.work_id = w.id
                        WHERE w.object_id = {int(item_id)}
                    )
                """)
                cur.execute(f"""
                    DELETE FROM {SCHEMA}.inspection_checkpoints 
                    WHERE inspection_id IN (
                        SELECT i.id FROM {SCHEMA}.inspections i
                        JOIN {SCHEMA}.works w ON i.work_id = w.id
                        WHERE w.object_id = {int(item_id)}
                    )
                """)
                cur.execute(f"DELETE FROM {SCHEMA}.work_logs WHERE work_id IN (SELECT id FROM {SCHEMA}.works WHERE object_id = {int(item_id)})")
                cur.execute(f"DELETE FROM {SCHEMA}.chat_messages WHERE work_id IN (SELECT id FROM {SCHEMA}.works WHERE object_id = {int(item_id)})")
                cur.execute(f"DELETE FROM {SCHEMA}.work_views WHERE work_id IN (SELECT id FROM {SCHEMA}.works WHERE object_id = {int(item_id)})")
                cur.execute(f"DELETE FROM {SCHEMA}.inspections WHERE work_id IN (SELECT id FROM {SCHEMA}.works WHERE object_id = {int(item_id)})")
                cur.execute(f"DELETE FROM {SCHEMA}.estimates WHERE work_id IN (SELECT id FROM {SCHEMA}.works WHERE object_id = {int(item_id)})")
                cur.execute(f"DELETE FROM {SCHEMA}.works WHERE object_id = {int(item_id)}")
                cur.execute(f"DELETE FROM {SCHEMA}.objects {object_filter}")
            elif item_type == 'work':
                work_filter = f"WHERE id = {int(item_id)}" if is_admin else f"""WHERE id = {int(item_id)} AND object_id IN (
                    SELECT o.id FROM {SCHEMA}.objects o 
                    JOIN {SCHEMA}.projects p ON o.project_id = p.id 
                    WHERE p.client_id = {user_id_int}
                )"""
                
                cur.execute(f"DELETE FROM {SCHEMA}.remarks WHERE inspection_id IN (SELECT id FROM {SCHEMA}.inspections WHERE work_id = {int(item_id)})")
                cur.execute(f"DELETE FROM {SCHEMA}.inspection_checkpoints WHERE inspection_id IN (SELECT id FROM {SCHEMA}.inspections WHERE work_id = {int(item_id)})")
                cur.execute(f"DELETE FROM {SCHEMA}.inspections WHERE work_id = {int(item_id)}")
                cur.execute(f"DELETE FROM {SCHEMA}.work_logs WHERE work_id = {int(item_id)}")
                cur.execute(f"DELETE FROM {SCHEMA}.estimates WHERE work_id = {int(item_id)}")
                cur.execute(f"DELETE FROM {SCHEMA}.works {work_filter}")
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': False, 'error': f'Unknown type: {item_type}'})
                }
            
            conn.commit()
            result = {'success': True, 'data': {'deleted': cur.rowcount}}
            
        elif method == 'PUT':
            data = body.get('data', {})
            
            if item_type == 'project':
                title = data.get('title', '').replace("'", "''")
                description = data.get('description', '').replace("'", "''")
                status = data.get('status', 'active')
                
                if is_admin:
                    cur.execute(f"""
                        UPDATE {SCHEMA}.projects 
                        SET title = '{title}', description = '{description}', status = '{status}'
                        WHERE id = {int(item_id)}
                        RETURNING id, title, description, status, created_at
                    """)
                else:
                    cur.execute(f"""
                        UPDATE {SCHEMA}.projects 
                        SET title = '{title}', description = '{description}', status = '{status}'
                        WHERE id = {int(item_id)} AND client_id = {user_id_int}
                        RETURNING id, title, description, status, created_at
                    """)
                
                result_row = cur.fetchone()
                if not result_row:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Project not found or access denied'})
                    }
                
                conn.commit()
                result = {'success': True, 'data': dict(result_row)}
                
            elif item_type == 'object':
                title = data.get('title', '').replace("'", "''")
                address = data.get('address', '').replace("'", "''")
                description = data.get('description', '').replace("'", "''")
                status = data.get('status', 'active')
                
                object_filter = f"WHERE id = {int(item_id)}" if is_admin else f"WHERE id = {int(item_id)} AND client_id = {user_id_int}"
                
                cur.execute(f"""
                    UPDATE {SCHEMA}.objects 
                    SET title = '{title}', address = '{address}', description = '{description}', status = '{status}'
                    {object_filter}
                    RETURNING id, title, address, description, status, client_id, created_at
                """)
                
                result_row = cur.fetchone()
                if not result_row:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Object not found or access denied'})
                    }
                
                conn.commit()
                result = {'success': True, 'data': dict(result_row)}
                
            elif item_type == 'work':
                title = data.get('title', '').replace("'", "''")
                description = data.get('description', '').replace("'", "''")
                status = data.get('status', 'pending')
                contractor_id = data.get('contractor_id')
                planned_start_date = data.get('planned_start_date')
                planned_end_date = data.get('planned_end_date')
                completion_percentage = data.get('completion_percentage')
                
                update_parts = [f"title = '{title}'", f"description = '{description}'", f"status = '{status}'"]
                
                if contractor_id is not None:
                    update_parts.append(f"contractor_id = {int(contractor_id)}" if contractor_id else "contractor_id = NULL")
                
                if planned_start_date:
                    update_parts.append(f"planned_start_date = '{planned_start_date}'")
                
                if planned_end_date:
                    update_parts.append(f"planned_end_date = '{planned_end_date}'")
                
                if completion_percentage is not None:
                    update_parts.append(f"completion_percentage = {int(completion_percentage)}")
                
                update_sql = ', '.join(update_parts)
                
                work_filter = f"WHERE id = {int(item_id)}" if is_admin else f"""WHERE id = {int(item_id)} AND object_id IN (
                    SELECT o.id FROM {SCHEMA}.objects o 
                    JOIN {SCHEMA}.projects p ON o.project_id = p.id 
                    WHERE p.client_id = {user_id_int}
                )"""
                
                cur.execute(f"""
                    UPDATE {SCHEMA}.works 
                    SET {update_sql}
                    {work_filter}
                    RETURNING id, title, description, object_id, contractor_id, status, 
                              planned_start_date, planned_end_date, completion_percentage, created_at
                """)
                
                result_row = cur.fetchone()
                if not result_row:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Work not found or access denied'})
                    }
                
                conn.commit()
                result = {'success': True, 'data': dict(result_row)}
            
            elif item_type == 'inspection':
                update_parts = []
                
                if 'status' in data:
                    status = data['status'].replace("'", "''")
                    update_parts.append(f"status = '{status}'")
                
                if 'defects' in data:
                    defects = data['defects'].replace("'", "''") if isinstance(data['defects'], str) else json.dumps(data['defects'], ensure_ascii=False).replace("'", "''")
                    update_parts.append(f"defects = '{defects}'::jsonb")
                
                if 'completed_at' in data:
                    completed_at = data['completed_at'].replace("'", "''") if data['completed_at'] else 'NULL'
                    if completed_at == 'NULL':
                        update_parts.append(f"completed_at = NULL")
                    else:
                        update_parts.append(f"completed_at = '{completed_at}'")
                
                if 'scheduled_date' in data:
                    scheduled_date = data['scheduled_date'].replace("'", "''") if data['scheduled_date'] else 'NULL'
                    if scheduled_date == 'NULL':
                        update_parts.append(f"scheduled_date = NULL")
                    else:
                        update_parts.append(f"scheduled_date = '{scheduled_date}'")
                
                if 'defect_report_document_id' in data:
                    doc_id = data['defect_report_document_id']
                    if doc_id is None or doc_id == 'NULL':
                        update_parts.append(f"defect_report_document_id = NULL")
                    else:
                        update_parts.append(f"defect_report_document_id = {int(doc_id)}")
                
                if not update_parts:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'No fields to update'})
                    }
                
                update_sql = ', '.join(update_parts)
                
                cur.execute(f"""
                    UPDATE {SCHEMA}.inspections 
                    SET {update_sql}
                    WHERE id = {int(item_id)}
                    RETURNING id, work_id, inspection_number, type, status, defects, scheduled_date, completed_at, defect_report_document_id, created_by, created_at
                """)
                
                result_row = cur.fetchone()
                if not result_row:
                    return {
                        'statusCode': 404,
                        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                        'body': json.dumps({'success': False, 'error': 'Inspection not found'})
                    }
                
                conn.commit()
                result = {'success': True, 'data': dict(result_row)}
            
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': False, 'error': f'Unknown type: {item_type}'})
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': False, 'error': 'Method not allowed'})
            }
        
        # Convert datetime objects to ISO format
        if 'data' in result:
            for key, value in result['data'].items():
                if hasattr(value, 'isoformat'):
                    result['data'][key] = value.isoformat()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
        
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR: {error_trace}")
        conn.rollback()
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }