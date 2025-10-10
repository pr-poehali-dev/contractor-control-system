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
        
        if not auth_token:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Auth token required'})
            }
        
        try:
            payload = verify_jwt_token(auth_token)
            user_id_int = payload['user_id']
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
        data = body.get('data', {})
        
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
                project_id = int(data.get('project_id', 0))
                title = data.get('title', '').replace("'", "''")
                address = data.get('address', '').replace("'", "''")
                status = data.get('status', 'active')
                
                cur.execute(f"""
                    INSERT INTO objects (title, address, project_id, status)
                    VALUES ('{title}', '{address}', {project_id}, '{status}')
                    RETURNING id, title, address, project_id, status
                """)
                result = cur.fetchone()
                conn.commit()
                
            elif item_type == 'work':
                object_id = int(data.get('object_id', 0))
                title = data.get('title', '').replace("'", "''")
                description = data.get('description', '').replace("'", "''")
                status = data.get('status', 'pending')
                contractor_id = data.get('contractor_id')
                
                if contractor_id:
                    cur.execute(f"""
                        INSERT INTO works (title, description, object_id, contractor_id, status)
                        VALUES ('{title}', '{description}', {object_id}, {int(contractor_id)}, '{status}')
                        RETURNING id, title, description, object_id, contractor_id, status, start_date, end_date
                    """)
                else:
                    cur.execute(f"""
                        INSERT INTO works (title, description, object_id, status)
                        VALUES ('{title}', '{description}', {object_id}, '{status}')
                        RETURNING id, title, description, object_id, contractor_id, status, start_date, end_date
                    """)
                result = cur.fetchone()
                conn.commit()
                
            elif item_type == 'work_log':
                work_id = int(data.get('work_id', 0))
                description = data.get('description', '').replace("'", "''")
                volume = data.get('volume', '').replace("'", "''") if data.get('volume') else None
                materials = data.get('materials', '').replace("'", "''") if data.get('materials') else None
                progress = int(data.get('progress', 0))
                
                if volume and materials:
                    cur.execute(f"""
                        INSERT INTO work_logs (work_id, description, volume, materials, created_by, created_at)
                        VALUES ({work_id}, '{description}', '{volume}', '{materials}', {user_id_int}, NOW())
                        RETURNING id, work_id, description, volume, materials, created_by, created_at
                    """)
                elif volume:
                    cur.execute(f"""
                        INSERT INTO work_logs (work_id, description, volume, created_by, created_at)
                        VALUES ({work_id}, '{description}', '{volume}', {user_id_int}, NOW())
                        RETURNING id, work_id, description, volume, materials, created_by, created_at
                    """)
                else:
                    cur.execute(f"""
                        INSERT INTO work_logs (work_id, description, created_by, created_at)
                        VALUES ({work_id}, '{description}', {user_id_int}, NOW())
                        RETURNING id, work_id, description, volume, materials, created_by, created_at
                    """)
                result = cur.fetchone()
                conn.commit()
                
            elif item_type == 'inspection':
                work_id = int(data.get('work_id', 0))
                work_log_id = data.get('work_log_id')
                description = data.get('description', '').replace("'", "''")
                status = data.get('status', 'pending')
                defects_raw = data.get('defects', '[]')
                defects = defects_raw.replace("'", "''") if isinstance(defects_raw, str) else '[]'
                photo_urls_raw = data.get('photo_urls', '')
                photo_urls = photo_urls_raw.replace("'", "''") if photo_urls_raw else None
                
                if work_log_id and photo_urls:
                    cur.execute(f"""
                        INSERT INTO inspections (work_id, work_log_id, description, status, defects, photo_urls, created_by, created_at)
                        VALUES ({work_id}, {int(work_log_id)}, '{description}', '{status}', '{defects}', '{photo_urls}', {user_id_int}, NOW())
                        RETURNING id, work_id, work_log_id, description, status, defects, photo_urls, created_by, created_at
                    """)
                elif work_log_id:
                    cur.execute(f"""
                        INSERT INTO inspections (work_id, work_log_id, description, status, defects, created_by, created_at)
                        VALUES ({work_id}, {int(work_log_id)}, '{description}', '{status}', '{defects}', {user_id_int}, NOW())
                        RETURNING id, work_id, work_log_id, description, status, defects, photo_urls, created_by, created_at
                    """)
                elif photo_urls:
                    cur.execute(f"""
                        INSERT INTO inspections (work_id, description, status, defects, photo_urls, created_by, created_at)
                        VALUES ({work_id}, '{description}', '{status}', '{defects}', '{photo_urls}', {user_id_int}, NOW())
                        RETURNING id, work_id, work_log_id, description, status, defects, photo_urls, created_by, created_at
                    """)
                else:
                    cur.execute(f"""
                        INSERT INTO inspections (work_id, description, status, defects, created_by, created_at)
                        VALUES ({work_id}, '{description}', '{status}', '{defects}', {user_id_int}, NOW())
                        RETURNING id, work_id, work_log_id, description, status, defects, photo_urls, created_by, created_at
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
            conn.rollback()
            cur.close()
            conn.close()
            return {
                'statusCode': 500,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': str(e)})
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }