'''
Business: Шаблоны документов с динамическими полями и визуальным редактором
Args: event - dict с httpMethod, body, queryStringParameters, headers
      context - object с request_id, function_name, function_version
Returns: HTTP response dict
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

DSN = os.environ.get('DATABASE_URL')
SCHEMA = 't_p8942561_contractor_control_s'

def handler(event: dict, context: any) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    conn = psycopg2.connect(DSN)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'POST':
            return create_template(cursor, conn, user_id, event)
        elif method == 'GET':
            return get_templates(cursor, user_id, event)
        elif method == 'PUT':
            return update_template(cursor, conn, user_id, event)
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Method not allowed'})
            }
    finally:
        cursor.close()
        conn.close()

def create_template(cursor, conn, user_id: str, event: dict) -> dict:
    body = json.loads(event.get('body', '{}'))
    
    name = body.get('name', '').strip()
    description = body.get('description', '').strip()
    template_type = body.get('template_type', '').strip()
    content = body.get('content', {})
    
    if not name or not template_type:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'name and template_type are required'})
        }
    
    content_json = json.dumps(content, ensure_ascii=False).replace("'", "''")
    description_safe = description.replace("'", "''")
    name_safe = name.replace("'", "''")
    
    cursor.execute(f"""
        INSERT INTO {SCHEMA}.document_templates
        (client_id, name, description, template_type, content)
        VALUES ({user_id}, '{name_safe}', '{description_safe}', '{template_type}', '{content_json}'::jsonb)
        RETURNING id, name, description, template_type, content, version, is_active, created_at
    """)
    
    template = cursor.fetchone()
    conn.commit()
    
    template_dict = dict(template)
    if isinstance(template_dict.get('content'), str):
        template_dict['content'] = json.loads(template_dict['content'])
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'template': template_dict}, default=str)
    }

def get_templates(cursor, user_id: str, event: dict) -> dict:
    params = event.get('queryStringParameters', {}) or {}
    template_id = params.get('id')
    template_type = params.get('type')
    
    if template_id:
        cursor.execute(f"""
            SELECT t.*,
                   u.name as created_by_name
            FROM {SCHEMA}.document_templates t
            LEFT JOIN {SCHEMA}.users u ON t.client_id = u.id
            WHERE t.id = {template_id}
        """)
        template = cursor.fetchone()
        
        if not template:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Template not found'})
            }
        
        cursor.execute(f"""
            SELECT COUNT(*) as usage_count FROM {SCHEMA}.documents
            WHERE template_id = {template_id}
        """)
        usage = cursor.fetchone()
        
        template = dict(template)
        template['usage_count'] = usage['usage_count']
        
        if isinstance(template.get('content'), str):
            template['content'] = json.loads(template['content'])
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'template': template}, default=str)
        }
    else:
        query = f"""
            SELECT t.*,
                   u.name as created_by_name,
                   (SELECT COUNT(*) FROM {SCHEMA}.documents WHERE template_id = t.id) as usage_count
            FROM {SCHEMA}.document_templates t
            LEFT JOIN {SCHEMA}.users u ON t.client_id = u.id
            WHERE (t.client_id = {user_id} OR t.is_system = true) AND t.is_active = true
        """
        
        if template_type:
            query += f" AND t.template_type = '{template_type}'"
        
        query += " ORDER BY t.is_system DESC, t.created_at DESC"
        
        cursor.execute(query)
        templates = cursor.fetchall()
        
        templates_list = []
        for t in templates:
            template_dict = dict(t)
            if isinstance(template_dict.get('content'), str):
                template_dict['content'] = json.loads(template_dict['content'])
            templates_list.append(template_dict)
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'templates': templates_list}, default=str)
        }

def update_template(cursor, conn, user_id: str, event: dict) -> dict:
    body = json.loads(event.get('body', '{}'))
    template_id = body.get('id')
    
    if not template_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Template ID is required'})
        }
    
    cursor.execute(f"""
        SELECT * FROM {SCHEMA}.document_templates 
        WHERE id = {template_id} AND client_id = {user_id}
    """)
    template = cursor.fetchone()
    
    if not template:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Template not found or access denied'})
        }
    
    updates = []
    
    if 'name' in body and body['name'].strip():
        name_safe = body['name'].strip().replace("'", "''")
        updates.append(f"name = '{name_safe}'")
    
    if 'description' in body:
        desc_safe = body['description'].strip().replace("'", "''")
        updates.append(f"description = '{desc_safe}'")
    
    if 'content' in body:
        content_json = json.dumps(body['content'], ensure_ascii=False).replace("'", "''")
        updates.append(f"content = '{content_json}'::jsonb")
        updates.append(f"version = {template['version'] + 1}")
    
    if 'is_active' in body:
        updates.append(f"is_active = {str(body['is_active']).lower()}")
    
    if not updates:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'No fields to update'})
        }
    
    updates.append(f"updated_at = '{datetime.now().isoformat()}'")
    
    cursor.execute(f"""
        UPDATE {SCHEMA}.document_templates
        SET {', '.join(updates)}
        WHERE id = {template_id}
        RETURNING *
    """)
    
    updated_template = cursor.fetchone()
    conn.commit()
    
    template_dict = dict(updated_template)
    if isinstance(template_dict.get('content'), str):
        template_dict['content'] = json.loads(template_dict['content'])
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'template': template_dict}, default=str)
    }