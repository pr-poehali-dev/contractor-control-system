'''
Business: Управление подрядными организациями - создание, приглашение сотрудников, управление
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
import hashlib

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
            return create_organization(cursor, conn, user_id, event)
        elif method == 'GET':
            return get_organizations(cursor, user_id, event)
        elif method == 'PUT':
            return update_organization(cursor, conn, user_id, event)
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

def create_organization(cursor, conn, user_id: str, event: dict) -> dict:
    body = json.loads(event.get('body', '{}'))
    
    name = body.get('name', '').strip()
    inn = body.get('inn', '').strip()
    kpp = body.get('kpp', '').strip()
    legal_address = body.get('legal_address', '').strip()
    actual_address = body.get('actual_address', '').strip()
    phone = body.get('phone', '').strip()
    email = body.get('email', '').strip()
    first_user_email = body.get('first_user_email', '').strip()
    
    if not name or not inn:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Name and INN are required'})
        }
    
    cursor.execute(f"""
        SELECT id FROM {SCHEMA}.organizations WHERE inn = '{inn}'
    """)
    existing = cursor.fetchone()
    
    if existing:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Organization with this INN already exists'})
        }
    
    cursor.execute(f"""
        INSERT INTO {SCHEMA}.organizations 
        (name, inn, kpp, legal_address, actual_address, phone, email, created_by)
        VALUES ('{name}', '{inn}', '{kpp}', '{legal_address}', '{actual_address}', '{phone}', '{email}', {user_id})
        RETURNING id, name, inn, kpp, legal_address, actual_address, phone, email, status, created_at
    """)
    
    organization = cursor.fetchone()
    conn.commit()
    
    if first_user_email:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(days=7)
        
        cursor.execute(f"""
            INSERT INTO {SCHEMA}.organization_invites 
            (organization_id, email, invited_by, token, expires_at)
            VALUES ({organization['id']}, '{first_user_email}', {user_id}, '{token}', '{expires_at.isoformat()}')
            RETURNING id, email, token, expires_at
        """)
        
        invite = cursor.fetchone()
        conn.commit()
        
        organization['invite'] = dict(invite)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'organization': dict(organization)}, default=str)
    }

def get_organizations(cursor, user_id: str, event: dict) -> dict:
    params = event.get('queryStringParameters', {}) or {}
    org_id = params.get('id')
    
    if org_id:
        cursor.execute(f"""
            SELECT o.*,
                   u.name as creator_name,
                   (SELECT COUNT(*) FROM {SCHEMA}.users WHERE organization_id = o.id) as employees_count
            FROM {SCHEMA}.organizations o
            LEFT JOIN {SCHEMA}.users u ON o.created_by = u.id
            WHERE o.id = {org_id}
        """)
        organization = cursor.fetchone()
        
        if not organization:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Organization not found'})
            }
        
        cursor.execute(f"""
            SELECT u.id, u.name, u.email, u.phone, u.organization_role, u.created_at
            FROM {SCHEMA}.users u
            WHERE u.organization_id = {org_id}
            ORDER BY u.organization_role DESC, u.created_at ASC
        """)
        employees = cursor.fetchall()
        
        cursor.execute(f"""
            SELECT id, email, status, expires_at, created_at
            FROM {SCHEMA}.organization_invites
            WHERE organization_id = {org_id} AND status = 'pending'
            ORDER BY created_at DESC
        """)
        invites = cursor.fetchall()
        
        organization = dict(organization)
        organization['employees'] = [dict(emp) for emp in employees]
        organization['pending_invites'] = [dict(inv) for inv in invites]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'organization': organization}, default=str)
        }
    else:
        cursor.execute(f"""
            SELECT o.*,
                   (SELECT COUNT(*) FROM {SCHEMA}.users WHERE organization_id = o.id) as employees_count,
                   (SELECT COUNT(*) FROM {SCHEMA}.works WHERE contractor_organization_id = o.id) as works_count
            FROM {SCHEMA}.organizations o
            WHERE o.created_by = {user_id} OR o.id IN (
                SELECT organization_id FROM {SCHEMA}.users WHERE id = {user_id}
            )
            ORDER BY o.created_at DESC
        """)
        organizations = cursor.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'organizations': [dict(org) for org in organizations]}, default=str)
        }

def update_organization(cursor, conn, user_id: str, event: dict) -> dict:
    body = json.loads(event.get('body', '{}'))
    org_id = body.get('id')
    
    if not org_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Organization ID is required'})
        }
    
    cursor.execute(f"""
        SELECT * FROM {SCHEMA}.organizations WHERE id = {org_id}
    """)
    organization = cursor.fetchone()
    
    if not organization:
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Organization not found'})
        }
    
    cursor.execute(f"""
        SELECT organization_role FROM {SCHEMA}.users 
        WHERE id = {user_id} AND organization_id = {org_id}
    """)
    user_role = cursor.fetchone()
    
    if not user_role or user_role['organization_role'] != 'admin':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Only organization admin can update'})
        }
    
    updates = []
    if 'name' in body and body['name'].strip():
        updates.append(f"name = '{body['name'].strip()}'")
    if 'legal_address' in body:
        updates.append(f"legal_address = '{body['legal_address'].strip()}'")
    if 'actual_address' in body:
        updates.append(f"actual_address = '{body['actual_address'].strip()}'")
    if 'phone' in body:
        updates.append(f"phone = '{body['phone'].strip()}'")
    if 'email' in body:
        updates.append(f"email = '{body['email'].strip()}'")
    
    if not updates:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'No fields to update'})
        }
    
    updates.append(f"updated_at = '{datetime.now().isoformat()}'")
    
    cursor.execute(f"""
        UPDATE {SCHEMA}.organizations
        SET {', '.join(updates)}
        WHERE id = {org_id}
        RETURNING *
    """)
    
    updated_org = cursor.fetchone()
    conn.commit()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'organization': dict(updated_org)}, default=str)
    }
