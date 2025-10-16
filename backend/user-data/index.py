'''
Business: Load user's data from database with JWT authentication (simplified structure: objects → works)
Args: event with httpMethod GET, headers (X-Auth-Token)
Returns: JSON with all user data (objects, works, inspections, remarks, workLogs, contractors)
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
        print(f"DEBUG USER-DATA: user_id={user_id}, role={user_role}")
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
        
        if role == 'admin':
            cur.execute("""
                SELECT id, title, address, description, client_id, status, created_at, updated_at
                FROM objects
                ORDER BY created_at DESC
            """)
            objects = cur.fetchall()
            
            cur.execute("""
                SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                       c.name as contractor_name, w.status, w.start_date, w.end_date,
                       w.planned_start_date, w.planned_end_date, w.completion_percentage,
                       w.created_at, w.updated_at
                FROM works w
                LEFT JOIN contractors c ON w.contractor_id = c.id
                ORDER BY w.created_at DESC
            """)
            works = cur.fetchall()
            
        elif role == 'contractor':
            cur.execute("""
                SELECT id as contractor_id
                FROM contractors
                WHERE user_id = %s
            """, (user_id,))
            contractor = cur.fetchone()
            contractor_id = contractor['contractor_id'] if contractor else None
            
            if contractor_id:
                cur.execute("""
                    SELECT DISTINCT o.id, o.title, o.address, o.description, o.client_id, 
                           o.status, o.created_at, o.updated_at
                    FROM objects o
                    JOIN works w ON w.object_id = o.id
                    WHERE w.contractor_id = %s
                    ORDER BY o.created_at DESC
                """, (contractor_id,))
                objects = cur.fetchall()
                
                cur.execute("""
                    SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                           c.name as contractor_name, w.status, w.start_date, w.end_date,
                           w.planned_start_date, w.planned_end_date, w.completion_percentage,
                           w.created_at, w.updated_at
                    FROM works w
                    LEFT JOIN contractors c ON w.contractor_id = c.id
                    WHERE w.contractor_id = %s
                    ORDER BY w.created_at DESC
                """, (contractor_id,))
                works = cur.fetchall()
            else:
                objects, works = [], []
        else:
            print(f"DEBUG: Executing query for {role} user_id={user_id}")
            cur.execute("""
                SELECT id, title, address, description, client_id, status, created_at, updated_at
                FROM objects
                WHERE client_id = %s
                ORDER BY created_at DESC
            """, (user_id,))
            objects = cur.fetchall()
            print(f"DEBUG: Found {len(objects)} objects")
            
            object_ids = [o['id'] for o in objects]
            print(f"DEBUG: object_ids={object_ids}")
            
            if object_ids:
                cur.execute("""
                    SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                           c.name as contractor_name, w.status, w.start_date, w.end_date,
                           w.planned_start_date, w.planned_end_date, w.completion_percentage,
                           w.created_at, w.updated_at
                    FROM works w
                    LEFT JOIN contractors c ON w.contractor_id = c.id
                    WHERE w.object_id = ANY(%s)
                    ORDER BY w.created_at DESC
                """, (object_ids,))
                works = cur.fetchall()
                print(f"DEBUG: Found {len(works)} works")
            else:
                works = []
        
        work_ids = [w['id'] for w in works]
        print(f"DEBUG: work_ids={work_ids}")
        
        inspections = []
        remarks = []
        work_logs = []
        chat_messages = []
        
        if work_ids:
            cur.execute("""
                SELECT i.id, i.work_id, i.work_log_id, i.inspection_number, i.created_by, i.status,
                       i.notes, i.description, i.defects, i.photo_urls, i.created_at, i.completed_at,
                       i.scheduled_date, i.title, i.type,
                       u.name as author_name, u.role as author_role
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
                       wl.description, wl.created_by, wl.created_at, wl.is_work_start,
                       wl.is_inspection_start, wl.is_inspection_completed, 
                       wl.inspection_id, wl.defects_count,
                       wl.completion_percentage,
                       i.inspection_number,
                       u.name as author_name, u.role as author_role
                FROM work_logs wl
                LEFT JOIN users u ON wl.created_by = u.id
                LEFT JOIN inspections i ON wl.inspection_id = i.id
                WHERE wl.work_id = ANY(%s)
                ORDER BY wl.created_at DESC
            """, (work_ids,))
            work_logs = cur.fetchall()
            print(f"DEBUG: Loaded {len(work_logs)} work_logs")
            
            cur.execute("""
                SELECT cm.id, cm.work_id, cm.message, cm.created_by, cm.created_at,
                       u.name as author_name, u.role as author_role
                FROM chat_messages cm
                LEFT JOIN users u ON cm.created_by = u.id
                WHERE cm.work_id = ANY(%s)
                ORDER BY cm.created_at DESC
            """, (work_ids,))
            chat_messages = cur.fetchall()
            print(f"DEBUG: Loaded {len(chat_messages)} chat_messages")
        
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
            print(f"DEBUG: Found {len(contractors)} contractors")
        elif role == 'admin':
            cur.execute("""
                SELECT id, name, inn, contact_info, email, phone, user_id, created_at
                FROM contractors
                ORDER BY created_at DESC
            """)
            contractors = cur.fetchall()
        else:
            contractors = []
        
        unread_counts = {}
        if work_ids:
            for work_id in work_ids:
                cur.execute("""
                    SELECT last_seen_at FROM work_views 
                    WHERE user_id = %s AND work_id = %s
                """, (user_id, work_id))
                view_record = cur.fetchone()
                last_seen = view_record['last_seen_at'] if view_record else None
                
                if role == 'client':
                    unread_logs = len([wl for wl in work_logs if wl['work_id'] == work_id and (not last_seen or wl['created_at'] > last_seen)])
                    unread_messages = len([cm for cm in chat_messages if cm['work_id'] == work_id and (not last_seen or cm['created_at'] > last_seen) and cm['created_by'] != user_id])
                    unread_counts[work_id] = {'logs': unread_logs, 'messages': unread_messages}
                else:
                    unread_inspections = len([i for i in inspections if i['work_id'] == work_id and (not last_seen or i['created_at'] > last_seen)])
                    unread_messages = len([cm for cm in chat_messages if cm['work_id'] == work_id and (not last_seen or cm['created_at'] > last_seen) and cm['created_by'] != user_id])
                    unread_counts[work_id] = {'inspections': unread_inspections, 'messages': unread_messages}
        
        cur.close()
        conn.close()
        
        print(f"DEBUG: Processing dates - objects={len(objects)}, works={len(works)}, inspections={len(inspections)}, remarks={len(remarks)}, work_logs={len(work_logs)}, contractors={len(contractors)}, chat_messages={len(chat_messages)}")
        
        for item in objects + works + inspections + remarks + work_logs + contractors + chat_messages:
            for key, value in item.items():
                if hasattr(value, 'isoformat'):
                    item[key] = value.isoformat()
        
        print(f"DEBUG: Dates processed successfully")
        
        result = {
            'objects': [dict(o) for o in objects],
            'works': [dict(w) for w in works],
            'inspections': [dict(i) for i in inspections],
            'remarks': [dict(r) for r in remarks],
            'workLogs': [dict(wl) for wl in work_logs],
            'checkpoints': [],
            'contractors': [dict(c) for c in contractors],
            'chatMessages': [dict(cm) for cm in chat_messages],
            'unreadCounts': unread_counts
        }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result)
        }
    
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in user-data: {error_details}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }