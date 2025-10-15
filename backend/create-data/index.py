"""
Business: Create projects, objects, works and log entries
Args: event with httpMethod, headers (X-Auth-Token), body (type, data)
Returns: HTTP response with created item or error
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
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        headers = event.get('headers', {})
        auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
        
        print(f"DEBUG: Headers received: {headers}")
        print(f"DEBUG: Auth token: {auth_token[:20] if auth_token else 'None'}...")
        
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Auth token required'})
            }
        
        try:
            payload = verify_jwt_token(auth_token)
            user_id_int = payload['user_id']
            print(f"DEBUG: Token verified, user_id: {user_id_int}")
        except ValueError as e:
            print(f"DEBUG: ValueError: {str(e)}")
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': str(e)})
            }
        except Exception as e:
            print(f"DEBUG: Exception: {str(e)}, Type: {type(e)}")
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': f'Invalid token: {str(e)}'})
            }
        
        body = json.loads(event.get('body', '{}'))
        item_type = body.get('type', '').lower()
        data = body.get('data', {})
        
        print(f"DEBUG: Received type={item_type}, data={data}")
        
        if not item_type or not data:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Type and data required'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        try:
            if item_type == 'project':
                title = data.get('title', '').replace("'", "''")
                description = data.get('description', '').replace("'", "''")
                status = data.get('status', 'active')
                
                cur.execute(f"""
                    INSERT INTO projects (title, description, status, client_id, created_at)
                    VALUES ('{title}', '{description}', '{status}', {user_id_int}, NOW())
                    RETURNING id, title, description, status, created_at
                """)
                result = cur.fetchone()
                conn.commit()
                
            elif item_type == 'object':
                title = data.get('title', '').replace("'", "''")
                address = data.get('address', '').replace("'", "''")
                description = data.get('description', '').replace("'", "''") if data.get('description') else None
                status = data.get('status', 'active')
                
                # Получаем или создаем дефолтный project_id для обратной совместимости
                cur.execute(f"SELECT id FROM projects WHERE client_id = {user_id_int} LIMIT 1")
                project_row = cur.fetchone()
                
                if not project_row:
                    cur.execute(f"""
                        INSERT INTO projects (title, description, status, client_id, created_at)
                        VALUES ('Основной', 'Автоматически созданный проект', 'active', {user_id_int}, NOW())
                        RETURNING id
                    """)
                    project_row = cur.fetchone()
                    conn.commit()
                
                project_id = project_row['id']
                
                fields = ['title', 'status', 'client_id', 'project_id', 'created_at', 'updated_at']
                values = [f"'{title}'", f"'{status}'", str(user_id_int), str(int(project_id)), 'NOW()', 'NOW()']
                
                if address:
                    fields.append('address')
                    values.append(f"'{address}'")
                if description:
                    fields.append('description')
                    values.append(f"'{description}'")
                
                fields_str = ', '.join(fields)
                values_str = ', '.join(values)
                
                cur.execute(f"""
                    INSERT INTO objects ({fields_str})
                    VALUES ({values_str})
                    RETURNING id, title, address, description, status, client_id, created_at, updated_at
                """)
                result = cur.fetchone()
                conn.commit()
                
            elif item_type == 'work':
                object_id = int(data.get('object_id', 0))
                title = data.get('title', '').replace("'", "''")
                description = data.get('description', '').replace("'", "''")
                status = data.get('status', 'pending')
                contractor_id = data.get('contractor_id')
                planned_start_date = data.get('planned_start_date')
                planned_end_date = data.get('planned_end_date')
                
                fields = ['title', 'description', 'object_id', 'status']
                values = [f"'{title}'", f"'{description}'", str(object_id), f"'{status}'"]
                
                if contractor_id:
                    fields.append('contractor_id')
                    values.append(str(int(contractor_id)))
                
                if planned_start_date:
                    fields.append('planned_start_date')
                    values.append(f"'{planned_start_date}'")
                    
                if planned_end_date:
                    fields.append('planned_end_date')
                    values.append(f"'{planned_end_date}'")
                
                fields_str = ', '.join(fields)
                values_str = ', '.join(values)
                
                cur.execute(f"""
                    INSERT INTO works ({fields_str})
                    VALUES ({values_str})
                    RETURNING id, title, description, object_id, contractor_id, status, planned_start_date, planned_end_date, completion_percentage
                """)
                result = cur.fetchone()
                conn.commit()
                
            elif item_type == 'work_log':
                work_id = int(data.get('work_id', 0))
                description = data.get('description', '').replace("'", "''")
                volume = data.get('volume', '').replace("'", "''") if data.get('volume') else None
                materials = data.get('materials', '').replace("'", "''") if data.get('materials') else None
                photo_urls_raw = data.get('photo_urls', '')
                photo_urls = photo_urls_raw.replace("'", "''") if photo_urls_raw else None
                
                # Build SQL dynamically based on available fields
                fields = ['work_id', 'description', 'created_by', 'created_at']
                values = [str(work_id), f"'{description}'", str(user_id_int), 'NOW()']
                
                if volume:
                    fields.append('volume')
                    values.append(f"'{volume}'")
                if materials:
                    fields.append('materials')
                    values.append(f"'{materials}'")
                if photo_urls:
                    fields.append('photo_urls')
                    values.append(f"'{photo_urls}'")
                
                fields_str = ', '.join(fields)
                values_str = ', '.join(values)
                
                cur.execute(f"""
                    INSERT INTO work_logs ({fields_str})
                    VALUES ({values_str})
                    RETURNING id, work_id, description, volume, materials, photo_urls, created_by, created_at
                """)
                result = cur.fetchone()
                conn.commit()
                
            elif item_type == 'inspection':
                work_id = int(data.get('work_id', 0))
                work_log_id = data.get('work_log_id')
                description = data.get('description', '').replace("'", "''") if data.get('description') else ''
                status = data.get('status', 'pending')
                notes = data.get('notes', '').replace("'", "''") if data.get('notes') else None
                scheduled_date = data.get('scheduled_date')
                defects_raw = data.get('defects', '[]')
                defects = defects_raw.replace("'", "''") if isinstance(defects_raw, str) else '[]'
                photo_urls_raw = data.get('photo_urls', '')
                photo_urls = photo_urls_raw.replace("'", "''") if photo_urls_raw else None
                
                # Generate inspection number
                cur.execute(f"""
                    SELECT COALESCE(MAX(CAST(SUBSTRING(inspection_number FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_num
                    FROM inspections
                    WHERE work_id = {work_id}
                """)
                next_num = cur.fetchone()['next_num']
                inspection_number = f'INS-{work_id}-{next_num}'
                
                # Build SQL dynamically based on available fields
                fields = ['work_id', 'inspection_number', 'status', 'defects', 'created_by', 'created_at', 'updated_at']
                values = [str(work_id), f"'{inspection_number}'", f"'{status}'", f"'{defects}'", str(user_id_int), 'NOW()', 'NOW()']
                
                if work_log_id:
                    fields.append('work_log_id')
                    values.append(str(int(work_log_id)))
                if description:
                    fields.append('description')
                    values.append(f"'{description}'")
                if notes:
                    fields.append('notes')
                    values.append(f"'{notes}'")
                if scheduled_date:
                    fields.append('scheduled_date')
                    values.append(f"'{scheduled_date}'")
                if photo_urls:
                    fields.append('photo_urls')
                    values.append(f"'{photo_urls}'")
                
                fields_str = ', '.join(fields)
                values_str = ', '.join(values)
                
                cur.execute(f"""
                    INSERT INTO inspections ({fields_str})
                    VALUES ({values_str})
                    RETURNING id, work_id, work_log_id, inspection_number, description, status, notes, scheduled_date, defects, photo_urls, created_by, created_at
                """)
                result = cur.fetchone()
                conn.commit()
                
            elif item_type == 'info_post':
                title = data.get('title', '').replace("'", "''")
                content = data.get('content', '').replace("'", "''")
                link = data.get('link', '').replace("'", "''") if data.get('link') else None
                
                fields = ['title', 'content', 'created_by', 'created_at', 'updated_at']
                values = [f"'{title}'", f"'{content}'", str(user_id_int), 'NOW()', 'NOW()']
                
                if link:
                    fields.append('link')
                    values.append(f"'{link}'")
                
                fields_str = ', '.join(fields)
                values_str = ', '.join(values)
                
                cur.execute(f"""
                    INSERT INTO t_p8942561_contractor_control_s.info_posts ({fields_str})
                    VALUES ({values_str})
                    RETURNING id, title, content, link, created_by, created_at, updated_at
                """)
                result = cur.fetchone()
                conn.commit()
                
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'error': f'Unknown type: {item_type}'})
                }
            
            cur.close()
            conn.close()
            
            for key, value in result.items():
                if hasattr(value, 'isoformat'):
                    result[key] = value.isoformat()
            
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True, 'data': dict(result)})
            }
            
        except Exception as e:
            import traceback
            error_msg = str(e)
            trace = traceback.format_exc()
            print(f"ERROR: {error_msg}")
            print(f"TRACEBACK: {trace}")
            
            error_details = {
                'error': error_msg,
                'traceback': trace,
                'item_type': item_type
            }
            conn.rollback()
            cur.close()
            conn.close()
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps(error_details)
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }