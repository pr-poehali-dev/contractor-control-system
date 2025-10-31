"""
Business: Register new user (client or contractor)
Args: event with body {phone, email, name, role}
Returns: User data with id and role
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p8942561_contractor_control_s'

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
    
    body = json.loads(event.get('body', '{}'))
    phone = body.get('phone', '').strip()
    email = body.get('email', '').strip().lower()
    name = body.get('name', '').strip()
    role = body.get('role', 'client')
    
    if not phone or not name:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': 'Phone and name required'})
        }
    
    if role not in ['client', 'contractor']:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': 'Role must be client or contractor'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        phone_escaped = phone.replace("'", "''")
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE phone = '{phone_escaped}'")
        existing = cur.fetchone()
        
        if existing:
            cur.close()
            conn.close()
            return {
                'statusCode': 409,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'success': False, 'error': 'User already exists'})
            }
        
        name_escaped = name.replace("'", "''")
        email_escaped = email.replace("'", "''") if email else ''
        
        if email:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.users (phone, email, name, role) 
                VALUES ('{phone_escaped}', '{email_escaped}', '{name_escaped}', '{role}')
                RETURNING id, phone, email, name, role, created_at
            """)
        else:
            cur.execute(f"""
                INSERT INTO {SCHEMA}.users (phone, name, role) 
                VALUES ('{phone_escaped}', '{name_escaped}', '{role}')
                RETURNING id, phone, email, name, role, created_at
            """)
        
        new_user = cur.fetchone()
        user_id = new_user['id']
        organization_id = None
        
        # Создаём пустую организацию для нового клиента
        if role == 'client':
            cur.execute(f"""
                INSERT INTO {SCHEMA}.organizations (name, inn, type, created_at)
                VALUES ('Новая организация', '0000000000', 'client', NOW())
                RETURNING id
            """)
            org = cur.fetchone()
            organization_id = org['id']
            
            # Привязываем пользователя к организации как администратора
            cur.execute(f"""
                INSERT INTO {SCHEMA}.user_organizations (user_id, organization_id, role)
                VALUES ({user_id}, {organization_id}, 'admin')
            """)
            
            # Обновляем organization_id у пользователя
            cur.execute(f"""
                UPDATE {SCHEMA}.users 
                SET organization_id = {organization_id}
                WHERE id = {user_id}
            """)
            
            # Копируем системные шаблоны новому клиенту
            cur.execute(f"""
                INSERT INTO {SCHEMA}.document_templates 
                  (client_id, name, description, template_type, content, version, is_active, is_system, source_template_id)
                SELECT 
                  {user_id},
                  name,
                  description,
                  template_type,
                  content,
                  1,
                  true,
                  false,
                  id
                FROM {SCHEMA}.document_templates
                WHERE is_system = true
            """)
        
        conn.commit()
        
        result = dict(new_user)
        if hasattr(result.get('created_at'), 'isoformat'):
            result['created_at'] = result['created_at'].isoformat()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'data': {'user': result}})
        }
        
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': str(e)})
        }