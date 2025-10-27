import json
import os
from typing import Dict, Any, List
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p8942561_contractor_control_s'

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Get activity feed for user dashboard
    Args: event with httpMethod, queryStringParameters (user_id)
    Returns: HTTP response with list of events
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    # Extract user_id from X-Auth-Token or fallback to query parameter for backward compatibility
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    user_id = None
    if auth_token:
        # Format: {random}.{user_id}
        try:
            parts = auth_token.split('.')
            if len(parts) == 2:
                user_id = parts[1]
        except Exception:
            pass
    
    # Fallback to query parameter for backward compatibility
    if not user_id:
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'user_id is required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database connection not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    # Get user role
    cur.execute(f"SELECT role FROM {SCHEMA}.users WHERE id = {user_id}")
    user_row = cur.fetchone()
    
    if not user_row:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'User not found'}),
            'isBase64Encoded': False
        }
    
    user_role = user_row['role']
    events: List[Dict[str, Any]] = []
    
    # Build query based on user role
    if user_role == 'contractor':
        # Contractor sees only events related to their works
        work_logs_query = f'''
            SELECT 
                wl.id,
                wl.work_id,
                wl.description,
                wl.volume,
                wl.materials,
                wl.photo_urls,
                wl.created_at,
                w.title as work_title,
                w.object_id,
                o.title as object_title,
                o.title as project_title,
                u.name as author_name
            FROM {SCHEMA}.work_logs wl
            JOIN {SCHEMA}.works w ON wl.work_id = w.id
            JOIN {SCHEMA}.objects o ON w.object_id = o.id
            JOIN {SCHEMA}.users u ON wl.created_by = u.id
            WHERE w.contractor_id = (
                SELECT id FROM {SCHEMA}.contractors WHERE user_id = {user_id}
            )
            AND (wl.is_inspection_start IS NULL OR wl.is_inspection_start = FALSE)
            AND (wl.is_inspection_completed IS NULL OR wl.is_inspection_completed = FALSE)
            ORDER BY wl.created_at DESC
            LIMIT 20
        '''
    elif user_role == 'admin':
        # Admin sees ALL events
        work_logs_query = f'''
            SELECT 
                wl.id,
                wl.work_id,
                wl.description,
                wl.volume,
                wl.materials,
                wl.photo_urls,
                wl.created_at,
                w.title as work_title,
                w.object_id,
                o.title as object_title,
                o.title as project_title,
                u.name as author_name
            FROM {SCHEMA}.work_logs wl
            JOIN {SCHEMA}.works w ON wl.work_id = w.id
            JOIN {SCHEMA}.objects o ON w.object_id = o.id
            JOIN {SCHEMA}.users u ON wl.created_by = u.id
            WHERE (wl.is_inspection_start IS NULL OR wl.is_inspection_start = FALSE)
            AND (wl.is_inspection_completed IS NULL OR wl.is_inspection_completed = FALSE)
            ORDER BY wl.created_at DESC
            LIMIT 30
        '''
    else:
        # Client sees only events for their objects
        work_logs_query = f'''
            SELECT 
                wl.id,
                wl.work_id,
                wl.description,
                wl.volume,
                wl.materials,
                wl.photo_urls,
                wl.created_at,
                w.title as work_title,
                w.object_id,
                o.title as object_title,
                o.title as project_title,
                u.name as author_name
            FROM {SCHEMA}.work_logs wl
            JOIN {SCHEMA}.works w ON wl.work_id = w.id
            JOIN {SCHEMA}.objects o ON w.object_id = o.id
            JOIN {SCHEMA}.users u ON wl.created_by = u.id
            WHERE o.client_id = {user_id}
            AND (wl.is_inspection_start IS NULL OR wl.is_inspection_start = FALSE)
            AND (wl.is_inspection_completed IS NULL OR wl.is_inspection_completed = FALSE)
            ORDER BY wl.created_at DESC
            LIMIT 20
        '''
    
    cur.execute(work_logs_query)
    work_logs = cur.fetchall()
    
    for log in work_logs:
        photo_urls = []
        if log['photo_urls']:
            photo_url_str = log['photo_urls']
            if isinstance(photo_url_str, str):
                if photo_url_str.startswith('['):
                    try:
                        photo_urls = json.loads(photo_url_str)
                    except Exception:
                        photo_urls = [photo_url_str]
                else:
                    photo_urls = [photo_url_str]
            elif isinstance(photo_url_str, list):
                photo_urls = photo_url_str
        
        events.append({
            'id': f"work_log_{log['id']}",
            'type': 'work_log',
            'title': log['work_title'],
            'description': log['description'],
            'timestamp': log['created_at'].isoformat() if hasattr(log['created_at'], 'isoformat') else str(log['created_at']),
            'workId': log['work_id'],
            'objectId': log['object_id'],
            'projectId': log['project_id'],
            'objectTitle': log['object_title'],
            'projectTitle': log['project_title'],
            'workTitle': log['work_title'],
            'author': log['author_name'],
            'volume': log['volume'],
            'materials': log['materials'],
            'photoUrls': photo_urls
        })
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'events': events}, default=str),
        'isBase64Encoded': False
    }