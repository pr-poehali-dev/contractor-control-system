'''
Business: Подписи документов - создание запроса на подпись, подписание, отклонение
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
            return create_signature_request(cursor, conn, user_id, event)
        elif method == 'PUT':
            return sign_document(cursor, conn, user_id, event)
        elif method == 'GET':
            return get_pending_signatures(cursor, user_id, event)
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

def create_signature_request(cursor, conn, user_id: str, event: dict) -> dict:
    body = json.loads(event.get('body', '{}'))
    
    document_id = body.get('document_id')
    signer_id = body.get('signer_id')
    signature_type = body.get('signature_type', 'sms').strip()
    
    if not document_id or not signer_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'document_id and signer_id are required'})
        }
    
    cursor.execute(f"""
        SELECT d.*, w.contractor_organization_id
        FROM {SCHEMA}.documents d
        JOIN {SCHEMA}.works w ON d.work_id = w.id
        WHERE d.id = {document_id}
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
        SELECT organization_id FROM {SCHEMA}.users WHERE id = {signer_id}
    """)
    signer = cursor.fetchone()
    
    org_clause = f"{signer['organization_id']}" if signer and signer['organization_id'] else "NULL"
    
    cursor.execute(f"""
        INSERT INTO {SCHEMA}.document_signatures
        (document_id, signer_id, organization_id, signature_type, status)
        VALUES ({document_id}, {signer_id}, {org_clause}, '{signature_type}', 'pending')
        RETURNING id, document_id, signer_id, signature_type, status, created_at
    """)
    
    signature = cursor.fetchone()
    
    cursor.execute(f"""
        UPDATE {SCHEMA}.documents
        SET status = 'pending_signature',
            updated_at = '{datetime.now().isoformat()}'
        WHERE id = {document_id}
    """)
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'signature': dict(signature)}, default=str)
    }

def sign_document(cursor, conn, user_id: str, event: dict) -> dict:
    body = json.loads(event.get('body', '{}'))
    
    signature_id = body.get('signature_id')
    action = body.get('action', '').strip()
    signature_data = body.get('signature_data', '').strip()
    rejection_reason = body.get('rejection_reason', '').strip()
    
    if not signature_id or action not in ['sign', 'reject']:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'signature_id and valid action are required'})
        }
    
    cursor.execute(f"""
        SELECT * FROM {SCHEMA}.document_signatures WHERE id = {signature_id}
    """)
    signature = cursor.fetchone()
    
    if not signature:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Signature request not found'})
        }
    
    if signature['signer_id'] != int(user_id):
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Only assigned signer can perform this action'})
        }
    
    if signature['status'] != 'pending':
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Signature already processed'})
        }
    
    if action == 'sign':
        cursor.execute(f"""
            UPDATE {SCHEMA}.document_signatures
            SET status = 'signed',
                signature_data = '{signature_data}',
                signed_at = '{datetime.now().isoformat()}'
            WHERE id = {signature_id}
            RETURNING *
        """)
        
        cursor.execute(f"""
            SELECT COUNT(*) as pending FROM {SCHEMA}.document_signatures
            WHERE document_id = {signature['document_id']} AND status = 'pending'
        """)
        pending_count = cursor.fetchone()['pending']
        
        if pending_count == 0:
            cursor.execute(f"""
                UPDATE {SCHEMA}.documents
                SET status = 'signed',
                    updated_at = '{datetime.now().isoformat()}'
                WHERE id = {signature['document_id']}
            """)
    else:
        rejection_reason_safe = rejection_reason.replace("'", "''")
        cursor.execute(f"""
            UPDATE {SCHEMA}.document_signatures
            SET status = 'rejected',
                rejection_reason = '{rejection_reason_safe}',
                rejected_at = '{datetime.now().isoformat()}'
            WHERE id = {signature_id}
            RETURNING *
        """)
        
        cursor.execute(f"""
            UPDATE {SCHEMA}.documents
            SET status = 'rejected',
                updated_at = '{datetime.now().isoformat()}'
            WHERE id = {signature['document_id']}
        """)
    
    updated_signature = cursor.fetchone()
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'signature': dict(updated_signature)}, default=str)
    }

def get_pending_signatures(cursor, user_id: str, event: dict) -> dict:
    cursor.execute(f"""
        SELECT s.*,
               d.document_number,
               d.title as document_title,
               d.document_type,
               w.title as work_title,
               o.title as object_title,
               u.name as requester_name
        FROM {SCHEMA}.document_signatures s
        JOIN {SCHEMA}.documents d ON s.document_id = d.id
        JOIN {SCHEMA}.works w ON d.work_id = w.id
        JOIN {SCHEMA}.objects o ON w.object_id = o.id
        LEFT JOIN {SCHEMA}.users u ON d.created_by = u.id
        WHERE s.signer_id = {user_id} AND s.status = 'pending'
        ORDER BY s.created_at DESC
    """)
    
    signatures = cursor.fetchall()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'pending_signatures': [dict(sig) for sig in signatures]}, default=str)
    }
