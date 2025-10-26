'''
Business: Система документооборота - создание, управление, подписи документов
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
            return create_document(cursor, conn, user_id, event)
        elif method == 'GET':
            return get_documents(cursor, user_id, event)
        elif method == 'PUT':
            return update_document_status(cursor, conn, user_id, event)
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

def create_document(cursor, conn, user_id: str, event: dict) -> dict:
    body = json.loads(event.get('body', '{}'))
    
    work_id = body.get('work_id')
    template_id = body.get('template_id')
    document_type = body.get('document_type', '').strip()
    title = body.get('title', '').strip()
    content = body.get('content', {})
    
    if not work_id or not document_type or not title:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'work_id, document_type and title are required'})
        }
    
    cursor.execute(f"""
        SELECT w.*, o.title as object_title
        FROM {SCHEMA}.works w
        JOIN {SCHEMA}.objects o ON w.object_id = o.id
        WHERE w.id = {work_id}
    """)
    work = cursor.fetchone()
    
    if not work:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Work not found'})
        }
    
    cursor.execute(f"""
        SELECT COUNT(*) as count FROM {SCHEMA}.documents 
        WHERE work_id = {work_id} AND document_type = '{document_type}'
    """)
    doc_count = cursor.fetchone()['count']
    document_number = f"{document_type.upper()}-{work_id}-{doc_count + 1}"
    
    content_json = json.dumps(content, ensure_ascii=False).replace("'", "''")
    template_clause = f"{template_id}" if template_id else "NULL"
    
    cursor.execute(f"""
        INSERT INTO {SCHEMA}.documents 
        (work_id, template_id, document_number, document_type, title, content, created_by)
        VALUES ({work_id}, {template_clause}, '{document_number}', '{document_type}', '{title}', '{content_json}'::jsonb, {user_id})
        RETURNING id, work_id, document_number, document_type, title, content, status, created_at
    """)
    
    document = cursor.fetchone()
    
    cursor.execute(f"""
        INSERT INTO {SCHEMA}.document_versions
        (document_id, version, content, changed_by, change_description)
        VALUES ({document['id']}, 1, '{content_json}'::jsonb, {user_id}, 'Initial version')
    """)
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'document': dict(document)}, default=str)
    }

def get_documents(cursor, user_id: str, event: dict) -> dict:
    params = event.get('queryStringParameters', {}) or {}
    doc_id = params.get('id')
    work_id = params.get('work_id')
    status = params.get('status')
    
    if doc_id:
        cursor.execute(f"""
            SELECT d.*,
                   w.title as work_title,
                   o.title as object_title,
                   u.name as created_by_name,
                   org.name as contractor_organization
            FROM {SCHEMA}.documents d
            JOIN {SCHEMA}.works w ON d.work_id = w.id
            JOIN {SCHEMA}.objects o ON w.object_id = o.id
            LEFT JOIN {SCHEMA}.users u ON d.created_by = u.id
            LEFT JOIN {SCHEMA}.organizations org ON w.contractor_organization_id = org.id
            WHERE d.id = {doc_id}
        """)
        document = cursor.fetchone()
        
        if not document:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Document not found'})
            }
        
        cursor.execute(f"""
            SELECT s.*,
                   u.name as signer_name,
                   u.email as signer_email,
                   org.name as organization_name
            FROM {SCHEMA}.document_signatures s
            LEFT JOIN {SCHEMA}.users u ON s.signer_id = u.id
            LEFT JOIN {SCHEMA}.organizations org ON s.organization_id = org.id
            WHERE s.document_id = {doc_id}
            ORDER BY s.created_at ASC
        """)
        signatures = cursor.fetchall()
        
        cursor.execute(f"""
            SELECT v.*,
                   u.name as changed_by_name
            FROM {SCHEMA}.document_versions v
            LEFT JOIN {SCHEMA}.users u ON v.changed_by = u.id
            WHERE v.document_id = {doc_id}
            ORDER BY v.version DESC
        """)
        versions = cursor.fetchall()
        
        document = dict(document)
        document['signatures'] = [dict(sig) for sig in signatures]
        document['versions'] = [dict(ver) for ver in versions]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'document': document}, default=str)
        }
    else:
        query = f"""
            SELECT d.*,
                   w.title as work_title,
                   o.title as object_title,
                   u.name as created_by_name,
                   (SELECT COUNT(*) FROM {SCHEMA}.document_signatures 
                    WHERE document_id = d.id AND status = 'pending') as pending_signatures,
                   (SELECT COUNT(*) FROM {SCHEMA}.document_signatures 
                    WHERE document_id = d.id AND status = 'signed') as signed_count
            FROM {SCHEMA}.documents d
            JOIN {SCHEMA}.works w ON d.work_id = w.id
            JOIN {SCHEMA}.objects o ON w.object_id = o.id
            LEFT JOIN {SCHEMA}.users u ON d.created_by = u.id
            WHERE (w.client_id = {user_id} OR w.contractor_id = {user_id} 
                   OR EXISTS (
                       SELECT 1 FROM {SCHEMA}.users 
                       WHERE id = {user_id} AND organization_id = w.contractor_organization_id
                   ))
        """
        
        if work_id:
            query += f" AND d.work_id = {work_id}"
        if status:
            query += f" AND d.status = '{status}'"
        
        query += " ORDER BY d.created_at DESC"
        
        cursor.execute(query)
        documents = cursor.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'documents': [dict(doc) for doc in documents]}, default=str)
        }

def update_document_status(cursor, conn, user_id: str, event: dict) -> dict:
    body = json.loads(event.get('body', '{}'))
    doc_id = body.get('id')
    new_status = body.get('status', '').strip()
    
    if not doc_id or not new_status:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Document ID and status are required'})
        }
    
    allowed_statuses = ['draft', 'pending_signature', 'signed', 'rejected']
    if new_status not in allowed_statuses:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invalid status'})
        }
    
    cursor.execute(f"""
        UPDATE {SCHEMA}.documents
        SET status = '{new_status}',
            updated_at = '{datetime.now().isoformat()}'
        WHERE id = {doc_id}
        RETURNING *
    """)
    
    document = cursor.fetchone()
    
    if not document:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Document not found'})
        }
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'document': dict(document)}, default=str)
    }
