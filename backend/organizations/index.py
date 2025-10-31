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
    first_user_phone = body.get('first_user_phone', '').strip()
    
    if not name or not inn:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Name and INN are required'})
        }
    
    # Проверяем, существует ли организация с таким ИНН
    cursor.execute(f"""
        SELECT id, type FROM {SCHEMA}.organizations WHERE inn = '{inn}'
    """)
    existing = cursor.fetchone()
    
    if existing:
        # Если организация уже существует, связываем текущего пользователя с ней
        org_id = existing['id']
        org_type = existing['type']
        
        # Добавляем пользователя в user_organizations если его там еще нет
        cursor.execute(f"""
            SELECT id FROM {SCHEMA}.user_organizations 
            WHERE user_id = {user_id} AND organization_id = {org_id}
        """)
        user_org_exists = cursor.fetchone()
        
        if not user_org_exists:
            cursor.execute(f"""
                INSERT INTO {SCHEMA}.user_organizations (user_id, organization_id, role, created_at)
                VALUES ({user_id}, {org_id}, 'employee', NOW())
            """)
            conn.commit()
        
        # Возвращаем существующую организацию
        cursor.execute(f"""
            SELECT id, name, inn, kpp, legal_address, actual_address, phone, email, type, status, created_at
            FROM {SCHEMA}.organizations WHERE id = {org_id}
        """)
        organization = cursor.fetchone()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'organization': dict(organization), 'message': 'Linked to existing organization'}, default=str)
        }
    
    # Создаём новую организацию с типом 'contractor'
    kpp_val = f"'{kpp}'" if kpp else 'NULL'
    legal_addr_val = f"'{legal_address}'" if legal_address else 'NULL'
    actual_addr_val = f"'{actual_address}'" if actual_address else 'NULL'
    phone_val = f"'{phone}'" if phone else 'NULL'
    email_val = f"'{email}'" if email else 'NULL'
    
    cursor.execute(f"""
        INSERT INTO {SCHEMA}.organizations 
        (name, inn, kpp, legal_address, actual_address, phone, email, type, created_at)
        VALUES ('{name}', '{inn}', {kpp_val}, {legal_addr_val}, {actual_addr_val}, {phone_val}, {email_val}, 'contractor', NOW())
        RETURNING id, name, inn, kpp, legal_address, actual_address, phone, email, type, status, created_at
    """)
    
    organization = cursor.fetchone()
    conn.commit()
    
    if first_user_phone:
        # Проверяем, существует ли пользователь с таким телефоном
        cursor.execute(f"""
            SELECT id FROM {SCHEMA}.users WHERE phone = '{first_user_phone}'
        """)
        existing_user = cursor.fetchone()
        
        if existing_user:
            invited_user_id = existing_user['id']
        else:
            # Создаём нового пользователя-подрядчика
            cursor.execute(f"""
                INSERT INTO {SCHEMA}.users 
                (phone, name, role, organization_id, organization_role, onboarding_completed, created_at)
                VALUES ('{first_user_phone}', 'Новый пользователь', 'contractor', {organization['id']}, 'admin', false, NOW())
                RETURNING id
            """)
            new_user = cursor.fetchone()
            invited_user_id = new_user['id']
            conn.commit()
        
        # Привязываем пользователя к организации в user_organizations
        cursor.execute(f"""
            SELECT id FROM {SCHEMA}.user_organizations 
            WHERE user_id = {invited_user_id} AND organization_id = {organization['id']}
        """)
        link_exists = cursor.fetchone()
        
        if not link_exists:
            cursor.execute(f"""
                INSERT INTO {SCHEMA}.user_organizations 
                (user_id, organization_id, role, created_at)
                VALUES ({invited_user_id}, {organization['id']}, 'admin', NOW())
            """)
            conn.commit()
        
        # Создаём приглашение с токеном для первого входа
        token = secrets.token_urlsafe(16)
        expires_at = datetime.now() + timedelta(days=7)
        placeholder_email = f"invite_{organization['id']}@temp.local"
        
        cursor.execute(f"""
            INSERT INTO {SCHEMA}.organization_invites 
            (organization_id, email, phone, invited_by, token, expires_at)
            VALUES ({organization['id']}, '{placeholder_email}', '{first_user_phone}', {user_id}, '{token}', '{expires_at.isoformat()}')
            RETURNING id, phone, token, expires_at
        """)
        
        invite = cursor.fetchone()
        conn.commit()
        
        organization['invite'] = dict(invite)
        organization['invited_user_id'] = invited_user_id
        
        # Добавляем подрядчика в список заказчика
        cursor.execute(f"""
            INSERT INTO {SCHEMA}.client_contractors (client_id, contractor_id, added_at)
            VALUES ({user_id}, {organization['id']}, NOW())
            ON CONFLICT (client_id, contractor_id) DO NOTHING
        """)
        conn.commit()
    
    # Получаем полную информацию об организации с подсчётами
    cursor.execute(f"""
        SELECT 
            o.*,
            COALESCE((SELECT COUNT(*) FROM {SCHEMA}.user_organizations WHERE organization_id = o.id), 0) as employees_count,
            COALESCE((SELECT COUNT(*) FROM {SCHEMA}.works WHERE contractor_id = o.id), 0) as works_count
        FROM {SCHEMA}.organizations o
        WHERE o.id = {organization['id']}
    """)
    
    full_org = cursor.fetchone()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'organization': dict(full_org)}, default=str)
    }

def get_organizations(cursor, user_id: str, event: dict) -> dict:
    params = event.get('queryStringParameters', {}) or {}
    org_id = params.get('id')
    
    # Получаем роль пользователя
    cursor.execute(f"""
        SELECT role FROM {SCHEMA}.users WHERE id = {user_id}
    """)
    user_role_result = cursor.fetchone()
    user_role = user_role_result['role'] if user_role_result else 'contractor'
    
    if org_id:
        cursor.execute(f"""
            SELECT o.*,
                   u.name as creator_name,
                   (SELECT COUNT(*) FROM {SCHEMA}.user_organizations WHERE organization_id = o.id) as employees_count
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
            SELECT u.id, u.name, u.email, u.phone, uo.role as organization_role, uo.created_at
            FROM {SCHEMA}.users u
            JOIN {SCHEMA}.user_organizations uo ON u.id = uo.user_id
            WHERE uo.organization_id = {org_id}
            ORDER BY uo.role DESC, uo.created_at ASC
        """)
        employees = cursor.fetchall()
        
        cursor.execute(f"""
            SELECT id, email, status, expires_at, created_at
            FROM {SCHEMA}.organization_invites
            WHERE organization_id = {org_id} AND status = 'pending'
            ORDER BY created_at DESC
        """)
        invites = cursor.fetchall()
        
        # Получаем работы организации с информацией об объектах
        cursor.execute(f"""
            SELECT w.id, w.title as name, w.status, w.start_date, w.end_date,
                   w.completion_percentage as progress, w.created_at,
                   o.id as object_id, o.title as object_name, o.address as object_address,
                   org.name as contractor_name, org.id as contractor_id
            FROM {SCHEMA}.works w
            JOIN {SCHEMA}.organizations org ON w.contractor_id = org.id
            JOIN {SCHEMA}.objects o ON w.object_id = o.id
            WHERE w.contractor_id = {org_id}
            ORDER BY w.created_at DESC
        """)
        works = cursor.fetchall()
        
        organization = dict(organization)
        organization['employees'] = [dict(emp) for emp in employees]
        organization['pending_invites'] = [dict(inv) for inv in invites]
        organization['works'] = [dict(work) for work in works]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'organization': organization}, default=str)
        }
    else:
        # Админ видит все организации
        if user_role == 'admin':
            cursor.execute(f"""
                SELECT o.*,
                       (SELECT COUNT(*) FROM {SCHEMA}.user_organizations WHERE organization_id = o.id) as employees_count,
                       (SELECT COUNT(*) FROM {SCHEMA}.works WHERE contractor_id = o.id) as works_count
                FROM {SCHEMA}.organizations o
                ORDER BY o.created_at DESC
            """)
        # Заказчик видит свою организацию и организации своих подрядчиков
        elif user_role == 'client':
            cursor.execute(f"""
                SELECT DISTINCT o.*,
                       (SELECT COUNT(*) FROM {SCHEMA}.user_organizations WHERE organization_id = o.id) as employees_count,
                       (SELECT COUNT(*) FROM {SCHEMA}.works WHERE contractor_id = o.id) as works_count
                FROM {SCHEMA}.organizations o
                WHERE o.id IN (
                    SELECT organization_id FROM {SCHEMA}.user_organizations WHERE user_id = {user_id}
                    UNION
                    SELECT contractor_id FROM {SCHEMA}.client_contractors WHERE client_id = {user_id}
                )
                ORDER BY o.created_at DESC
            """)
        # Подрядчик видит только свою организацию
        else:
            cursor.execute(f"""
                SELECT o.*,
                       (SELECT COUNT(*) FROM {SCHEMA}.user_organizations WHERE organization_id = o.id) as employees_count,
                       (SELECT COUNT(*) FROM {SCHEMA}.works WHERE contractor_id = o.id) as works_count
                FROM {SCHEMA}.organizations o
                WHERE o.id IN (
                    SELECT organization_id FROM {SCHEMA}.user_organizations WHERE user_id = {user_id}
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
        SELECT role FROM {SCHEMA}.user_organizations 
        WHERE user_id = {user_id} AND organization_id = {org_id}
    """)
    user_org_role = cursor.fetchone()
    
    if not user_org_role or user_org_role['role'] != 'admin':
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Only organization admin can update'})
        }
    
    updates = []
    if 'name' in body and body['name'].strip():
        updates.append(f"name = '{body['name'].strip()}'")
    if 'inn' in body and body['inn'].strip():
        updates.append(f"inn = '{body['inn'].strip()}'")
    if 'kpp' in body:
        updates.append(f"kpp = '{body['kpp'].strip()}'")
    if 'ogrn' in body:
        updates.append(f"ogrn = '{body['ogrn'].strip()}'")
    if 'legal_address' in body:
        updates.append(f"legal_address = '{body['legal_address'].strip()}'")
    if 'actual_address' in body:
        updates.append(f"actual_address = '{body['actual_address'].strip()}'")
    if 'phone' in body:
        updates.append(f"phone = '{body['phone'].strip()}'")
    if 'email' in body:
        updates.append(f"email = '{body['email'].strip()}'")
    if 'director_name' in body:
        updates.append(f"director_name = '{body['director_name'].strip()}'")
    if 'director_position' in body:
        updates.append(f"director_position = '{body['director_position'].strip()}'")
    if 'bik' in body:
        updates.append(f"bik = '{body['bik'].strip()}'")
    if 'bank_name' in body:
        updates.append(f"bank_name = '{body['bank_name'].strip()}'")
    if 'payment_account' in body:
        updates.append(f"payment_account = '{body['payment_account'].strip()}'")
    if 'correspondent_account' in body:
        updates.append(f"correspondent_account = '{body['correspondent_account'].strip()}'")
    
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