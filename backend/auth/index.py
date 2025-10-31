'''
Business: Регистрация и авторизация пользователей (заказчики, подрядчики)
Args: event с httpMethod, body (email/phone, password, name, role)
Returns: JWT токен и данные пользователя
'''

import json
import os
import psycopg2
import bcrypt
import jwt
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL')
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')
SCHEMA = 't_p8942561_contractor_control_s'

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    # Support both SHA-256 (legacy/admin reset) and bcrypt
    if len(hashed) == 64:  # SHA-256 hash is 64 characters
        return hashlib.sha256(password.encode()).hexdigest() == hashed
    else:  # bcrypt hash
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        except ValueError:
            # If bcrypt fails, try SHA-256 as fallback
            return hashlib.sha256(password.encode()).hexdigest() == hashed

def create_jwt_token(user_id: int, role: str) -> str:
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=30),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_jwt_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise ValueError('Token expired')
    except jwt.InvalidTokenError:
        raise ValueError('Invalid token')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        path = event.get('queryStringParameters', {}).get('action', '') if event.get('queryStringParameters') else ''
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'POST' and path == 'register':
            body = json.loads(event.get('body', '{}'))
            email = body.get('email', '').replace("'", "''") if body.get('email') else None
            phone = body.get('phone', '').replace("'", "''") if body.get('phone') else None
            password = body.get('password')
            name = body.get('name', '').replace("'", "''")
            role = body.get('role', 'client')
            organization = body.get('organization', '').replace("'", "''") if body.get('organization') else None
            
            if not password or not name or not (email or phone):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            if role not in ['client', 'contractor', 'admin']:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid role'})
                }
            
            email_check = f"'{email}'" if email else 'NULL'
            phone_check = f"'{phone}'" if phone else 'NULL'
            
            cur.execute(
                f"SELECT id FROM {SCHEMA}.users WHERE email = {email_check} OR phone = {phone_check}"
            )
            if cur.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User already exists'})
                }
            
            password_hash = hash_password(password).replace("'", "''")
            
            email_val = f"'{email}'" if email else 'NULL'
            phone_val = f"'{phone}'" if phone else 'NULL'
            org_val = f"'{organization}'" if organization else 'NULL'
            
            cur.execute(
                f"""
                INSERT INTO {SCHEMA}.users (email, phone, password_hash, name, role, organization, is_active, created_at, updated_at)
                VALUES ({email_val}, {phone_val}, '{password_hash}', '{name}', '{role}', {org_val}, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, email, phone, name, role, organization, created_at
                """
            )
            user = cur.fetchone()
            conn.commit()
            
            user_data = {
                'id': user[0],
                'email': user[1],
                'phone': user[2],
                'name': user[3],
                'role': user[4],
                'organization': user[5],
                'created_at': user[6].isoformat() if user[6] else None
            }
            
            token = create_jwt_token(user_data['id'], user_data['role'])
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'data': {
                        'token': token,
                        'user': user_data
                    }
                })
            }
        
        elif method == 'POST' and path == 'login':
            body = json.loads(event.get('body', '{}'))
            email = body.get('email', '').replace("'", "''") if body.get('email') else ''
            phone = body.get('phone', '').replace("'", "''") if body.get('phone') else ''
            password = body.get('password')
            
            print(f"DEBUG LOGIN: email={email}, phone={phone}, has_password={bool(password)}")
            
            if not password or not (email or phone):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing email/phone or password'})
                }
            
            email_cond = f"email = '{email}'" if email else "1=0"
            phone_cond = f"phone = '{phone}'" if phone else "1=0"
            
            cur.execute(
                f"""
                SELECT id, email, phone, name, role, organization, password_hash, is_active, created_at,
                       onboarding_completed, organization_id
                FROM {SCHEMA}.users
                WHERE ({email_cond} OR {phone_cond}) 
                  AND password_hash IS NOT NULL
                """
            )
            user = cur.fetchone()
            
            print(f"DEBUG: user found={bool(user)}")
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid credentials'})
                }
            
            user_id, user_email, user_phone, user_name, user_role, user_org, password_hash, is_active, user_created_at, onboarding_completed, organization_id = user
            
            print(f"DEBUG: user_id={user_id}, is_active={is_active}, has_hash={bool(password_hash)}")
            
            if not is_active:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Account is inactive'})
                }
            
            password_match = verify_password(password, password_hash)
            print(f"DEBUG: password_match={password_match}")
            
            if not password_match:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid credentials'})
                }
            
            cur.execute(
                f"UPDATE {SCHEMA}.users SET last_login = CURRENT_TIMESTAMP WHERE id = {user_id}"
            )
            conn.commit()
            
            user_data = {
                'id': user_id,
                'email': user_email,
                'phone': user_phone,
                'name': user_name,
                'role': user_role,
                'organization': user_org,
                'created_at': user_created_at.isoformat() if user_created_at else None,
                'onboarding_completed': onboarding_completed if onboarding_completed is not None else False,
                'organization_id': organization_id
            }
            
            token = create_jwt_token(user_id, user_role)
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'data': {
                        'token': token,
                        'user': user_data
                    }
                })
            }
        
        elif method == 'GET' and path == 'verify':
            auth_header = event.get('headers', {}).get('x-auth-token') or event.get('headers', {}).get('X-Auth-Token')
            
            if not auth_header:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'No token provided'})
                }
            
            try:
                payload = verify_jwt_token(auth_header)
                user_id = payload['user_id']
                
                cur.execute(
                    f"""
                    SELECT id, email, phone, name, role, organization, is_active, created_at, 
                           onboarding_completed, organization_id
                    FROM {SCHEMA}.users
                    WHERE id = {user_id}
                    """
                )
                user = cur.fetchone()
                
                if not user or not user[6]:  # is_active
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'User not found or inactive'})
                    }
                
                user_data = {
                    'id': user[0],
                    'email': user[1],
                    'phone': user[2],
                    'name': user[3],
                    'role': user[4],
                    'organization': user[5],
                    'created_at': user[7].isoformat() if user[7] else None,
                    'onboarding_completed': user[8] if user[8] is not None else False,
                    'organization_id': user[9]
                }
                
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'data': {
                            'user': user_data
                        }
                    })
                }
                
            except ValueError as e:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': str(e)})
                }
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Endpoint not found'})
            }
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR: {error_trace}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }