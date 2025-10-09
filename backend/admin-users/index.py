import json
import os
import secrets
import string
import hashlib
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Admin user management - list, edit, reset password
    Args: event with httpMethod, body containing user data
          context with request_id
    Returns: HTTP response with user data or success status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    admin_key = event.get('headers', {}).get('X-Admin-Key') or event.get('headers', {}).get('x-admin-key')
    if admin_key != 'admin123':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Forbidden'}),
            'isBase64Encoded': False
        }
    
    import psycopg2
    dsn = os.environ.get('DATABASE_URL')
    schema = 't_p8942561_contractor_control_s'
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute(f"SELECT id, name, email, phone, role, organization, is_active, created_at FROM {schema}.users ORDER BY created_at DESC")
        rows = cur.fetchall()
        
        users = []
        for row in rows:
            users.append({
                'id': row[0],
                'name': row[1],
                'email': row[2],
                'phone': row[3],
                'role': row[4],
                'organization': row[5],
                'is_active': row[6],
                'created_at': row[7].isoformat() if row[7] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'users': users}),
            'isBase64Encoded': False
        }
    
    elif method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        name = body_data.get('name', '').strip()
        email = body_data.get('email', '').strip()
        phone = body_data.get('phone', '').strip()
        organization = body_data.get('organization', '').strip()
        
        if not user_id:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id is required'}),
                'isBase64Encoded': False
            }
        
        cur.execute(
            f"UPDATE {schema}.users SET name = '{name}', email = '{email}', phone = '{phone}', organization = '{organization}' WHERE id = {user_id}"
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': True, 'message': 'User updated'}),
            'isBase64Encoded': False
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        user_id = body_data.get('user_id')
        
        if action == 'reset_password':
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            new_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(8))
            password_hash = hashlib.sha256(new_password.encode()).hexdigest()
            
            cur.execute(f"UPDATE {schema}.users SET password_hash = '{password_hash}' WHERE id = {user_id}")
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'password': new_password}),
                'isBase64Encoded': False
            }
        
        elif action == 'toggle_status':
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"UPDATE {schema}.users SET is_active = NOT is_active WHERE id = {user_id}")
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        elif action == 'delete_user':
            if not user_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(f"""
                DELETE FROM {schema}.remarks 
                WHERE inspection_id IN (
                    SELECT i.id FROM {schema}.inspections i
                    JOIN {schema}.works w ON i.work_id = w.id
                    JOIN {schema}.objects o ON w.object_id = o.id
                    JOIN {schema}.projects p ON o.project_id = p.id
                    WHERE p.client_id = {user_id} OR i.created_by = {user_id}
                )
            """)
            
            cur.execute(f"""
                DELETE FROM {schema}.inspection_checkpoints 
                WHERE inspection_id IN (
                    SELECT i.id FROM {schema}.inspections i
                    JOIN {schema}.works w ON i.work_id = w.id
                    JOIN {schema}.objects o ON w.object_id = o.id
                    JOIN {schema}.projects p ON o.project_id = p.id
                    WHERE p.client_id = {user_id} OR i.created_by = {user_id}
                )
            """)
            
            cur.execute(f"""
                DELETE FROM {schema}.inspections 
                WHERE work_id IN (
                    SELECT w.id FROM {schema}.works w
                    JOIN {schema}.objects o ON w.object_id = o.id
                    JOIN {schema}.projects p ON o.project_id = p.id
                    WHERE p.client_id = {user_id}
                ) OR created_by = {user_id}
            """)
            
            cur.execute(f"""
                DELETE FROM {schema}.work_logs 
                WHERE work_id IN (
                    SELECT w.id FROM {schema}.works w
                    JOIN {schema}.objects o ON w.object_id = o.id
                    JOIN {schema}.projects p ON o.project_id = p.id
                    WHERE p.client_id = {user_id}
                ) OR created_by = {user_id}
            """)
            
            cur.execute(f"""
                DELETE FROM {schema}.estimates 
                WHERE work_id IN (
                    SELECT w.id FROM {schema}.works w
                    JOIN {schema}.objects o ON w.object_id = o.id
                    JOIN {schema}.projects p ON o.project_id = p.id
                    WHERE p.client_id = {user_id}
                ) OR uploaded_by = {user_id}
            """)
            
            cur.execute(f"""
                DELETE FROM {schema}.works 
                WHERE object_id IN (
                    SELECT id FROM {schema}.objects 
                    WHERE project_id IN (
                        SELECT id FROM {schema}.projects WHERE client_id = {user_id}
                    )
                )
            """)
            
            cur.execute(f"DELETE FROM {schema}.objects WHERE project_id IN (SELECT id FROM {schema}.projects WHERE client_id = {user_id})")
            cur.execute(f"DELETE FROM {schema}.projects WHERE client_id = {user_id}")
            
            cur.execute(f"DELETE FROM {schema}.client_contractors WHERE client_id = {user_id}")
            cur.execute(f"DELETE FROM {schema}.contractor_invites WHERE client_id = {user_id} OR invited_by = {user_id}")
            cur.execute(f"DELETE FROM {schema}.activity_log WHERE user_id = {user_id}")
            cur.execute(f"DELETE FROM {schema}.user_sessions WHERE user_id = {user_id}")
            
            cur.execute(f"""
                DELETE FROM {schema}.contractors 
                WHERE user_id = {user_id} OR id IN (
                    SELECT contractor_id FROM {schema}.works WHERE contractor_id IN (
                        SELECT id FROM {schema}.contractors WHERE user_id = {user_id}
                    )
                )
            """)
            
            cur.execute(f"DELETE FROM {schema}.users WHERE id = {user_id}")
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }