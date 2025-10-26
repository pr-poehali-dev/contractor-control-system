'''
Business: Приглашения сотрудников в организацию и принятие приглашений
Args: event - dict с httpMethod, body, queryStringParameters, headers
      context - object с request_id, function_name, function_version
Returns: HTTP response dict
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import secrets

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
    
    conn = psycopg2.connect(DSN)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'POST':
            return send_invite(cursor, conn, event)
        elif method == 'PUT':
            return accept_invite(cursor, conn, event)
        elif method == 'GET':
            return check_invite(cursor, event)
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

def send_invite(cursor, conn, event: dict) -> dict:
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    body = json.loads(event.get('body', '{}'))
    organization_id = body.get('organization_id')
    email = body.get('email', '').strip().lower()
    
    if not organization_id or not email:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Organization ID and email are required'})
        }
    
    cursor.execute(f"""
        SELECT organization_role FROM {SCHEMA}.users 
        WHERE id = {user_id} AND organization_id = {organization_id}
    """)
    user_role = cursor.fetchone()
    
    if not user_role or user_role['organization_role'] != 'admin':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Only organization admin can invite'})
        }
    
    cursor.execute(f"""
        SELECT id FROM {SCHEMA}.users WHERE email = '{email}' AND organization_id = {organization_id}
    """)
    existing_user = cursor.fetchone()
    
    if existing_user:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'User already in organization'})
        }
    
    cursor.execute(f"""
        SELECT id FROM {SCHEMA}.organization_invites 
        WHERE organization_id = {organization_id} 
        AND email = '{email}' 
        AND status = 'pending'
        AND expires_at > '{datetime.now().isoformat()}'
    """)
    existing_invite = cursor.fetchone()
    
    if existing_invite:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invite already sent'})
        }
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now() + timedelta(days=7)
    
    cursor.execute(f"""
        INSERT INTO {SCHEMA}.organization_invites 
        (organization_id, email, invited_by, token, expires_at)
        VALUES ({organization_id}, '{email}', {user_id}, '{token}', '{expires_at.isoformat()}')
        RETURNING id, email, token, expires_at, created_at
    """)
    
    invite = cursor.fetchone()
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'invite': dict(invite)}, default=str)
    }

def accept_invite(cursor, conn, event: dict) -> dict:
    headers = event.get('headers', {})
    user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    body = json.loads(event.get('body', '{}'))
    token = body.get('token', '').strip()
    
    if not token:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Token is required'})
        }
    
    cursor.execute(f"""
        SELECT i.*, o.name as organization_name
        FROM {SCHEMA}.organization_invites i
        JOIN {SCHEMA}.organizations o ON i.organization_id = o.id
        WHERE i.token = '{token}' 
        AND i.status = 'pending'
        AND i.expires_at > '{datetime.now().isoformat()}'
    """)
    invite = cursor.fetchone()
    
    if not invite:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invite not found or expired'})
        }
    
    cursor.execute(f"""
        SELECT email FROM {SCHEMA}.users WHERE id = {user_id}
    """)
    user = cursor.fetchone()
    
    if not user or user['email'].lower() != invite['email'].lower():
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invite is for different email'})
        }
    
    cursor.execute(f"""
        SELECT COUNT(*) as count FROM {SCHEMA}.users 
        WHERE organization_id = {invite['organization_id']}
    """)
    employees_count = cursor.fetchone()['count']
    
    role = 'admin' if employees_count == 0 else 'employee'
    
    cursor.execute(f"""
        UPDATE {SCHEMA}.users
        SET organization_id = {invite['organization_id']},
            organization_role = '{role}'
        WHERE id = {user_id}
    """)
    
    cursor.execute(f"""
        UPDATE {SCHEMA}.organization_invites
        SET status = 'accepted',
            accepted_at = '{datetime.now().isoformat()}'
        WHERE id = {invite['id']}
    """)
    
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'organization_id': invite['organization_id'],
            'organization_name': invite['organization_name'],
            'role': role
        })
    }

def check_invite(cursor, event: dict) -> dict:
    params = event.get('queryStringParameters', {}) or {}
    token = params.get('token', '').strip()
    
    if not token:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Token is required'})
        }
    
    cursor.execute(f"""
        SELECT i.*, o.name as organization_name, o.inn
        FROM {SCHEMA}.organization_invites i
        JOIN {SCHEMA}.organizations o ON i.organization_id = o.id
        WHERE i.token = '{token}'
    """)
    invite = cursor.fetchone()
    
    if not invite:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Invite not found'})
        }
    
    is_valid = (
        invite['status'] == 'pending' and 
        datetime.fromisoformat(str(invite['expires_at'])) > datetime.now()
    )
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'invite': {
                'email': invite['email'],
                'organization_name': invite['organization_name'],
                'organization_inn': invite['inn'],
                'status': invite['status'],
                'is_valid': is_valid,
                'expires_at': str(invite['expires_at'])
            }
        })
    }
