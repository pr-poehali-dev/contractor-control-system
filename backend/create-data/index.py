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
SCHEMA = 't_p8942561_contractor_control_s'

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
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
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
                'body': json.dumps({'success': False, 'error': 'Auth token required'})
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
                'body': json.dumps({'success': False, 'error': str(e)})
            }
        except Exception as e:
            print(f"DEBUG: Exception: {str(e)}, Type: {type(e)}")
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': False, 'error': f'Invalid token: {str(e)}'})
            }
        
        body = json.loads(event.get('body', '{}'))
        item_type = body.get('type', '').lower()
        data = body.get('data', {})
        
        print(f"DEBUG: Received type={item_type}, data={data}")
        
        if not item_type or not data:
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': False, 'error': 'Type and data required'})
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
                    INSERT INTO {SCHEMA}.projects (title, description, status, client_id, created_at)
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
                cur.execute(f"SELECT id FROM {SCHEMA}.projects WHERE client_id = {user_id_int} LIMIT 1")
                project_row = cur.fetchone()
                
                if not project_row:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.projects (title, description, status, client_id, created_at)
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
                    INSERT INTO {SCHEMA}.objects ({fields_str})
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
                    INSERT INTO {SCHEMA}.works ({fields_str})
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
                is_work_start = data.get('is_work_start', False)
                inspection_id = data.get('inspection_id')
                defects_count = data.get('defects_count')
                progress = data.get('progress')
                
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
                
                if is_work_start:
                    fields.append('is_work_start')
                    values.append('TRUE')
                
                if inspection_id:
                    fields.append('inspection_id')
                    values.append(str(int(inspection_id)))
                
                if defects_count is not None:
                    fields.append('defects_count')
                    values.append(str(int(defects_count)))
                
                if progress is not None:
                    fields.append('progress')
                    values.append(str(int(progress)))
                
                fields_str = ', '.join(fields)
                values_str = ', '.join(values)
                
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.work_logs ({fields_str})
                    VALUES ({values_str})
                    RETURNING id, work_id, description, volume, materials, photo_urls, created_at, created_by
                """)
                result = cur.fetchone()
                conn.commit()
                
            elif item_type == 'inspection':
                work_id = int(data.get('work_id', 0))
                inspection_type = data.get('type', 'unscheduled')
                status = data.get('status', 'draft')
                scheduled_date = data.get('scheduled_date')
                
                # Генерируем inspection_number на основе work_id
                cur.execute(f"""
                    SELECT COALESCE(MAX(CAST(SUBSTRING(inspection_number FROM 'INS-{work_id}-(\\d+)') AS INTEGER)), 0) + 1 as next_num
                    FROM {SCHEMA}.inspections
                    WHERE work_id = {work_id}
                """)
                next_number_row = cur.fetchone()
                next_number = next_number_row['next_num'] if next_number_row and next_number_row['next_num'] else 1
                inspection_number = f"INS-{work_id}-{next_number}"
                
                fields = ['work_id', 'inspection_number', 'type', 'status', 'created_by', 'created_at']
                values = [str(work_id), f"'{inspection_number}'", f"'{inspection_type}'", f"'{status}'", str(user_id_int), 'NOW()']
                
                if scheduled_date:
                    fields.append('scheduled_date')
                    values.append(f"'{scheduled_date}'")
                
                fields_str = ', '.join(fields)
                values_str = ', '.join(values)
                
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.inspections ({fields_str})
                    VALUES ({values_str})
                    RETURNING id, work_id, inspection_number, type, status, scheduled_date, created_by, created_at
                """)
                result = cur.fetchone()
                conn.commit()
                
            elif item_type == 'chat_message':
                work_id = int(data.get('work_id', 0))
                message = data.get('message', '').replace("'", "''")
                message_type = data.get('message_type', 'text')
                photo_urls = data.get('photo_urls', '').replace("'", "''") if data.get('photo_urls') else None
                
                fields = ['work_id', 'message', 'message_type', 'created_by', 'created_at']
                values = [str(work_id), f"'{message}'", f"'{message_type}'", str(user_id_int), 'NOW()']
                
                if photo_urls:
                    fields.append('photo_urls')
                    values.append(f"'{photo_urls}'")
                
                fields_str = ', '.join(fields)
                values_str = ', '.join(values)
                
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.chat_messages ({fields_str})
                    VALUES ({values_str})
                    RETURNING id, work_id, message, message_type, photo_urls, created_at, created_by
                """)
                result = cur.fetchone()
                conn.commit()
                
            else:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                    'body': json.dumps({'success': False, 'error': f'Unknown type: {item_type}'})
                }
            
            result_dict = dict(result) if result else {}
            
            # Convert datetime objects to ISO format strings
            for key, value in result_dict.items():
                if hasattr(value, 'isoformat'):
                    result_dict[key] = value.isoformat()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True, 'data': result_dict})
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
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'success': False, 'error': 'Method not allowed'})
    }