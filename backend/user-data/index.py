'''
Business: Load user's data from database with JWT authentication
Args: event with httpMethod GET, headers (X-Auth-Token)
Returns: JSON with all user data (projects, sites, works, inspections, remarks, workLogs, contractors)
'''

import json
import os
import psycopg2
import jwt
from typing import Dict, Any
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Get and verify JWT token
    auth_header = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')
    
    if not auth_header:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'No token provided'})
        }
    
    try:
        payload = verify_jwt_token(auth_header)
        user_id = payload['user_id']
        user_role = payload['role']
    except ValueError as e:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid token'})
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Verify user exists and is active
        cur.execute(
            "SELECT id, role, is_active FROM users WHERE id = %s",
            (user_id,)
        )
        user = cur.fetchone()
        
        if not user or not user['is_active']:
            cur.close()
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found or inactive'})
            }
        
        role = user['role']
        
        # Load projects based on role
        if role == 'admin':
            cur.execute("""
                SELECT id, title, description, client_id, status, created_at, updated_at
                FROM projects
                WHERE status != 'archived'
                ORDER BY created_at DESC
            """)
            projects = cur.fetchall()
            
            cur.execute("""
                SELECT id, title, address, project_id, status, created_at, updated_at
                FROM objects
                ORDER BY created_at DESC
            """)
            sites = cur.fetchall()
            
            cur.execute("""
                SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                       c.name as contractor_name, w.status, w.start_date, w.end_date,
                       w.created_at, w.updated_at
                FROM works w
                LEFT JOIN contractors c ON w.contractor_id = c.id
                ORDER BY w.created_at DESC
            """)
            works = cur.fetchall()
            
        elif role == 'contractor':
            # Get contractor ID for this user
            cur.execute("""
                SELECT id as contractor_id
                FROM contractors
                WHERE user_id = %s
            """, (user_id,))
            contractor = cur.fetchone()
            contractor_id = contractor['contractor_id'] if contractor else None
            
            if contractor_id:
                cur.execute("""
                    SELECT DISTINCT p.id, p.title, p.description, p.client_id, p.status, 
                           p.created_at, p.updated_at
                    FROM projects p
                    JOIN objects o ON o.project_id = p.id
                    JOIN works w ON w.object_id = o.id
                    WHERE w.contractor_id = %s
                    ORDER BY p.created_at DESC
                """, (contractor_id,))
                projects = cur.fetchall()
                
                cur.execute("""
                    SELECT DISTINCT o.id, o.title, o.address, o.project_id, o.status,
                           o.created_at, o.updated_at
                    FROM objects o
                    JOIN works w ON w.object_id = o.id
                    WHERE w.contractor_id = %s
                    ORDER BY o.created_at DESC
                """, (contractor_id,))
                sites = cur.fetchall()
                
                cur.execute("""
                    SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                           c.name as contractor_name, w.status, w.start_date, w.end_date,
                           w.created_at, w.updated_at
                    FROM works w
                    LEFT JOIN contractors c ON w.contractor_id = c.id
                    WHERE w.contractor_id = %s
                    ORDER BY w.created_at DESC
                """, (contractor_id,))
                works = cur.fetchall()
            else:
                projects, sites, works = [], [], []
                
        else:  # client role
            cur.execute("""
                SELECT id, title, description, client_id, status, created_at, updated_at
                FROM projects
                WHERE client_id = %s AND status != 'archived'
                ORDER BY created_at DESC
            """, (user_id,))
            projects = cur.fetchall()
            
            project_ids = [p['id'] for p in projects]
            
            if project_ids:
                cur.execute("""
                    SELECT id, title, address, project_id, status, created_at, updated_at
                    FROM objects
                    WHERE project_id = ANY(%s)
                    ORDER BY created_at DESC
                """, (project_ids,))
                sites = cur.fetchall()
                
                site_ids = [s['id'] for s in sites]
                
                if site_ids:
                    cur.execute("""
                        SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                               c.name as contractor_name, w.status, w.start_date, w.end_date,
                               w.created_at, w.updated_at
                        FROM works w
                        LEFT JOIN contractors c ON w.contractor_id = c.id
                        WHERE w.object_id = ANY(%s)
                        ORDER BY w.created_at DESC
                    """, (site_ids,))
                    works = cur.fetchall()
                else:
                    works = []
            else:
                sites, works = [], []
        
        # Load inspections, remarks, work logs for accessible works
        work_ids = [w['id'] for w in works]
        
        if work_ids:
            cur.execute("""
                SELECT i.id, i.work_id, i.inspection_number, i.created_by, i.status,
                       i.notes, i.created_at, i.completed_at,
                       u.name as inspector_name
                FROM inspections i
                LEFT JOIN users u ON i.created_by = u.id
                WHERE i.work_id = ANY(%s)
                ORDER BY i.created_at DESC
            """, (work_ids,))
            inspections = cur.fetchall()
            
            inspection_ids = [i['id'] for i in inspections]
            
            if inspection_ids:
                cur.execute("""
                    SELECT id, inspection_id, checkpoint_id, description,
                           normative_ref, photo_urls, status, created_at, resolved_at
                    FROM remarks
                    WHERE inspection_id = ANY(%s)
                    ORDER BY created_at DESC
                """, (inspection_ids,))
                remarks = cur.fetchall()
            else:
                remarks = []
            
            cur.execute("""
                SELECT wl.id, wl.work_id, wl.volume, wl.materials, wl.photo_urls,
                       wl.description, wl.created_by, wl.created_at,
                       u.name as author_name, u.role as author_role
                FROM work_logs wl
                LEFT JOIN users u ON wl.created_by = u.id
                WHERE wl.work_id = ANY(%s)
                ORDER BY wl.created_at DESC
            """, (work_ids,))
            work_logs = cur.fetchall()
        else:
            inspections, remarks, work_logs = [], [], []
        
        # Load contractors based on role
        if role == 'client':
            cur.execute("""
                SELECT c.id, c.name, c.inn, c.contact_info, c.email, c.phone, 
                       c.user_id, c.created_at
                FROM contractors c
                JOIN client_contractors cc ON cc.contractor_id = c.id
                WHERE cc.client_id = %s
                ORDER BY c.created_at DESC
            """, (user_id,))
            contractors = cur.fetchall()
        elif role == 'admin':
            cur.execute("""
                SELECT id, name, inn, contact_info, email, phone, user_id, created_at
                FROM contractors
                ORDER BY created_at DESC
            """)
            contractors = cur.fetchall()
        else:
            contractors = []
        
        cur.close()
        conn.close()
        
        # Convert datetime objects to ISO format strings
        for item in projects + sites + works + inspections + remarks + work_logs + contractors:
            for key, value in item.items():
                if hasattr(value, 'isoformat'):
                    item[key] = value.isoformat()
        
        # Build response
        result = {
            'projects': [dict(p) for p in projects],
            'sites': [dict(s) for s in sites],
            'works': [dict(w) for w in works],
            'inspections': [dict(i) for i in inspections],
            'remarks': [dict(r) for r in remarks],
            'workLogs': [dict(wl) for wl in work_logs],
            'checkpoints': [],  # Empty for now as per requirements
            'contractors': [dict(c) for c in contractors]
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }