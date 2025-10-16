import json
import os
from typing import Dict, Any, List
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

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
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
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
    cur.execute(f"SELECT role FROM users WHERE id = {user_id}")
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
                o.project_id,
                p.title as project_title,
                u.name as author_name
            FROM work_logs wl
            JOIN works w ON wl.work_id = w.id
            JOIN objects o ON w.object_id = o.id
            JOIN projects p ON o.project_id = p.id
            JOIN users u ON wl.created_by = u.id
            WHERE w.contractor_id = (
                SELECT contractor_id FROM users WHERE id = {user_id}
            )
            AND (wl.is_inspection_start IS NULL OR wl.is_inspection_start = FALSE)
            AND (wl.is_inspection_completed IS NULL OR wl.is_inspection_completed = FALSE)
            ORDER BY wl.created_at DESC
            LIMIT 20
        '''
    elif user_role == 'admin':
        # Admin sees ALL events from all projects
        work_logs_query = '''
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
                o.project_id,
                p.title as project_title,
                u.name as author_name
            FROM work_logs wl
            JOIN works w ON wl.work_id = w.id
            JOIN objects o ON w.object_id = o.id
            JOIN projects p ON o.project_id = p.id
            JOIN users u ON wl.created_by = u.id
            WHERE (wl.is_inspection_start IS NULL OR wl.is_inspection_start = FALSE)
            AND (wl.is_inspection_completed IS NULL OR wl.is_inspection_completed = FALSE)
            ORDER BY wl.created_at DESC
            LIMIT 30
        '''
    else:
        # Client sees only events for their projects
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
                o.project_id,
                p.title as project_title,
                u.name as author_name
            FROM work_logs wl
            JOIN works w ON wl.work_id = w.id
            JOIN objects o ON w.object_id = o.id
            JOIN projects p ON o.project_id = p.id
            JOIN users u ON wl.created_by = u.id
            WHERE p.client_id = {user_id}
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
    
    # Get inspections
    if user_role == 'contractor':
        inspections_query = f'''
            SELECT 
                i.id,
                i.work_id,
                i.inspection_number,
                i.type,
                i.status,
                i.description,
                i.defects,
                i.scheduled_date,
                i.photo_urls,
                i.created_at,
                i.updated_at,
                w.title as work_title,
                w.object_id,
                o.title as object_title,
                o.project_id,
                p.title as project_title,
                u.name as author_name
            FROM inspections i
            JOIN works w ON i.work_id = w.id
            JOIN objects o ON w.object_id = o.id
            JOIN projects p ON o.project_id = p.id
            JOIN users u ON i.created_by = u.id
            WHERE w.contractor_id = (
                SELECT contractor_id FROM users WHERE id = {user_id}
            )
            ORDER BY i.created_at DESC
            LIMIT 10
        '''
    elif user_role == 'admin':
        inspections_query = '''
            SELECT 
                i.id,
                i.work_id,
                i.inspection_number,
                i.type,
                i.status,
                i.description,
                i.defects,
                i.scheduled_date,
                i.photo_urls,
                i.created_at,
                i.updated_at,
                w.title as work_title,
                w.object_id,
                o.title as object_title,
                o.project_id,
                p.title as project_title,
                u.name as author_name
            FROM inspections i
            JOIN works w ON i.work_id = w.id
            JOIN objects o ON w.object_id = o.id
            JOIN projects p ON o.project_id = p.id
            JOIN users u ON i.created_by = u.id
            ORDER BY i.created_at DESC
            LIMIT 15
        '''
    else:
        inspections_query = f'''
            SELECT 
                i.id,
                i.work_id,
                i.inspection_number,
                i.type,
                i.status,
                i.description,
                i.defects,
                i.scheduled_date,
                i.photo_urls,
                i.created_at,
                i.updated_at,
                w.title as work_title,
                w.object_id,
                o.title as object_title,
                o.project_id,
                p.title as project_title,
                u.name as author_name
            FROM inspections i
            JOIN works w ON i.work_id = w.id
            JOIN objects o ON w.object_id = o.id
            JOIN projects p ON o.project_id = p.id
            JOIN users u ON i.created_by = u.id
            WHERE p.client_id = {user_id}
            ORDER BY i.created_at DESC
            LIMIT 10
        '''
    
    cur.execute(inspections_query)
    inspections = cur.fetchall()
    
    for insp in inspections:
        photo_urls = []
        if insp['photo_urls']:
            photo_url_str = insp['photo_urls']
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
        
        defects_count = 0
        if insp['defects']:
            try:
                defects_array = json.loads(insp['defects']) if isinstance(insp['defects'], str) else insp['defects']
                defects_count = len(defects_array) if isinstance(defects_array, list) else 0
            except Exception:
                defects_count = 0
        
        # Use updated_at for timestamp when available, otherwise created_at
        timestamp_value = insp.get('updated_at') or insp['created_at']
        timestamp_str = timestamp_value.isoformat() if hasattr(timestamp_value, 'isoformat') else str(timestamp_value)
        
        # Handle scheduled_date
        scheduled_date_str = None
        if insp.get('scheduled_date'):
            scheduled_date_str = insp['scheduled_date'].isoformat() if hasattr(insp['scheduled_date'], 'isoformat') else str(insp['scheduled_date'])
        
        events.append({
            'id': f"inspection_{insp['id']}",
            'type': 'inspection',
            'title': f"Проверка №{insp['inspection_number']}",
            'description': insp.get('description', ''),
            'timestamp': timestamp_str,
            'status': insp['status'],
            'inspectionNumber': insp['inspection_number'],
            'inspectionType': insp.get('type', 'scheduled'),
            'workId': insp['work_id'],
            'objectId': insp['object_id'],
            'projectId': insp['project_id'],
            'objectTitle': insp['object_title'],
            'projectTitle': insp['project_title'],
            'workTitle': insp['work_title'],
            'author': insp['author_name'],
            'photoUrls': photo_urls,
            'defects': insp['defects'],
            'defectsCount': defects_count,
            'scheduledDate': scheduled_date_str
        })
    

    # Get info posts (visible to all users, limited to last 5)
    info_posts_query = '''
        SELECT 
            ip.id,
            ip.title,
            ip.content,
            ip.link,
            ip.created_at,
            u.name as author_name
        FROM t_p8942561_contractor_control_s.info_posts ip
        JOIN users u ON ip.created_by = u.id
        ORDER BY ip.created_at DESC
        LIMIT 5
    '''
    
    cur.execute(info_posts_query)
    info_posts = cur.fetchall()
    
    for post in info_posts:
        events.append({
            'id': f"info_post_{post['id']}",
            'type': 'info_post',
            'title': post['title'],
            'description': post['content'],
            'timestamp': post['created_at'].isoformat() if hasattr(post['created_at'], 'isoformat') else str(post['created_at']),
            'link': post['link'],
            'author': post['author_name']
        })
    
    cur.close()
    conn.close()
    
    # Sort all events by timestamp (handle empty timestamps)
    events.sort(key=lambda x: x.get('timestamp') or '', reverse=True)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'events': events[:30]
        }),
        'isBase64Encoded': False
    }