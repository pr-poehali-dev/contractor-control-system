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
    
    # Get inspection events (not inspections directly)
    if user_role == 'contractor':
        inspection_events_query = f'''
            SELECT 
                ie.id,
                ie.inspection_id,
                ie.event_type,
                ie.created_at,
                ie.created_by,
                ie.metadata,
                i.work_id,
                i.inspection_number,
                i.type,
                i.status,
                i.description,
                i.defects,
                i.scheduled_date,
                i.photo_urls,
                w.title as work_title,
                w.object_id,
                o.title as object_title,
                o.project_id,
                p.title as project_title,
                u.name as author_name,
                u.role as author_role
            FROM inspection_events ie
            JOIN inspections i ON ie.inspection_id = i.id
            JOIN works w ON i.work_id = w.id
            JOIN objects o ON w.object_id = o.id
            JOIN projects p ON o.project_id = p.id
            JOIN users u ON ie.created_by = u.id
            WHERE w.contractor_id = (
                SELECT contractor_id FROM users WHERE id = {user_id}
            )
            ORDER BY ie.created_at DESC
            LIMIT 20
        '''
    elif user_role == 'admin':
        inspection_events_query = '''
            SELECT 
                ie.id,
                ie.inspection_id,
                ie.event_type,
                ie.created_at,
                ie.created_by,
                ie.metadata,
                i.work_id,
                i.inspection_number,
                i.type,
                i.status,
                i.description,
                i.defects,
                i.scheduled_date,
                i.photo_urls,
                w.title as work_title,
                w.object_id,
                o.title as object_title,
                o.project_id,
                p.title as project_title,
                u.name as author_name,
                u.role as author_role
            FROM inspection_events ie
            JOIN inspections i ON ie.inspection_id = i.id
            JOIN works w ON i.work_id = w.id
            JOIN objects o ON w.object_id = o.id
            JOIN projects p ON o.project_id = p.id
            JOIN users u ON ie.created_by = u.id
            ORDER BY ie.created_at DESC
            LIMIT 30
        '''
    else:
        inspection_events_query = f'''
            SELECT 
                ie.id,
                ie.inspection_id,
                ie.event_type,
                ie.created_at,
                ie.created_by,
                ie.metadata,
                i.work_id,
                i.inspection_number,
                i.type,
                i.status,
                i.description,
                i.defects,
                i.scheduled_date,
                i.photo_urls,
                w.title as work_title,
                w.object_id,
                o.title as object_title,
                o.project_id,
                p.title as project_title,
                u.name as author_name,
                u.role as author_role
            FROM inspection_events ie
            JOIN inspections i ON ie.inspection_id = i.id
            JOIN works w ON i.work_id = w.id
            JOIN objects o ON w.object_id = o.id
            JOIN projects p ON o.project_id = p.id
            JOIN users u ON ie.created_by = u.id
            WHERE p.client_id = {user_id}
            ORDER BY ie.created_at DESC
            LIMIT 20
        '''
    
    cur.execute(inspection_events_query)
    inspection_events = cur.fetchall()
    
    print(f"DEBUG: Found {len(inspection_events)} inspection events for user {user_id} (role: {user_role})")
    
    for ie in inspection_events:
        photo_urls = []
        if ie['photo_urls']:
            photo_url_str = ie['photo_urls']
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
        if ie['defects']:
            try:
                defects_array = json.loads(ie['defects']) if isinstance(ie['defects'], str) else ie['defects']
                defects_count = len(defects_array) if isinstance(defects_array, list) else 0
            except Exception:
                defects_count = 0
        
        # Parse metadata
        metadata = {}
        if ie.get('metadata'):
            try:
                metadata = json.loads(ie['metadata']) if isinstance(ie['metadata'], str) else ie['metadata']
            except Exception:
                metadata = {}
        
        # Generate content based on event type
        content = ''
        if ie['event_type'] == 'scheduled':
            scheduled_date = metadata.get('scheduled_date') or ie.get('scheduled_date')
            if scheduled_date:
                try:
                    date_obj = datetime.fromisoformat(str(scheduled_date).replace('Z', '+00:00'))
                    content = f"Проверка запланирована на {date_obj.strftime('%d.%m.%Y')}"
                except:
                    content = 'Проверка запланирована'
            else:
                content = 'Проверка запланирована'
        elif ie['event_type'] == 'started':
            content = 'Заказчик начал проверку'
        elif ie['event_type'] == 'completed':
            defects_from_meta = metadata.get('defects_count', defects_count)
            content = f"Проверка завершена. Замечаний: {defects_from_meta}"
        
        timestamp_str = ie['created_at'].isoformat() if hasattr(ie['created_at'], 'isoformat') else str(ie['created_at'])
        
        scheduled_date_str = None
        if ie.get('scheduled_date'):
            scheduled_date_str = ie['scheduled_date'].isoformat() if hasattr(ie['scheduled_date'], 'isoformat') else str(ie['scheduled_date'])
        
        events.append({
            'id': f"inspection_event_{ie['id']}",
            'type': f"inspection_{ie['event_type']}",
            'title': f"Проверка №{ie['inspection_number']}",
            'description': content,
            'timestamp': timestamp_str,
            'status': ie['status'],
            'inspectionId': ie['inspection_id'],
            'inspectionNumber': ie['inspection_number'],
            'inspectionType': ie.get('type', 'scheduled'),
            'workId': ie['work_id'],
            'objectId': ie['object_id'],
            'projectId': ie['project_id'],
            'objectTitle': ie['object_title'],
            'projectTitle': ie['project_title'],
            'workTitle': ie['work_title'],
            'author': ie['author_name'],
            'photoUrls': photo_urls,
            'defects': ie['defects'],
            'defectsCount': metadata.get('defects_count', defects_count),
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
    
    print(f"DEBUG: Total events before slicing: {len(events)}")
    print(f"DEBUG: Event types: {[e.get('type') for e in events[:10]]}")
    
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