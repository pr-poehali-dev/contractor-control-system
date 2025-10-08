"""
Business: Get user data (projects, objects, works, inspections) based on role and permissions
Args: event with httpMethod, headers (X-User-Id)
Returns: HTTP response with filtered data for user
"""
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event, context):
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        headers = event.get('headers', {})
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'User ID required'})
            }
        
        dsn = os.environ.get('DATABASE_URL')
        
        conn = psycopg2.connect(dsn)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT role FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        
        if not user:
            cur.close()
            conn.close()
            return {
                'statusCode': 404,
                'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'User not found'})
            }
        
        role = user['role']
        
        if role == 'contractor':
            cur.execute("""
                SELECT DISTINCT c.id as contractor_id
                FROM contractors c
                JOIN users u ON u.organization = c.name
                WHERE u.id = %s
            """, (user_id,))
            contractor = cur.fetchone()
            contractor_id = contractor['contractor_id'] if contractor else None
            
            if contractor_id:
                cur.execute("""
                    SELECT p.id, p.title, p.description, p.status, p.created_at
                    FROM projects p
                    JOIN objects o ON o.project_id = p.id
                    JOIN works w ON w.object_id = o.id
                    WHERE w.contractor_id = %s
                    GROUP BY p.id
                """, (contractor_id,))
                projects = cur.fetchall()
                
                cur.execute("""
                    SELECT o.id, o.title, o.address, o.project_id, o.status
                    FROM objects o
                    JOIN works w ON w.object_id = o.id
                    WHERE w.contractor_id = %s
                    GROUP BY o.id
                """, (contractor_id,))
                sites = cur.fetchall()
                
                cur.execute("""
                    SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                           c.name as contractor_name, w.status, w.start_date, w.end_date
                    FROM works w
                    LEFT JOIN contractors c ON w.contractor_id = c.id
                    WHERE w.contractor_id = %s
                """, (contractor_id,))
                works = cur.fetchall()
            else:
                projects, sites, works = [], [], []
        else:
            cur.execute("""
                SELECT id, title, description, status, created_at
                FROM projects
                WHERE client_id = %s
            """, (user_id,))
            projects = cur.fetchall()
            
            project_ids = [p['id'] for p in projects]
            
            if project_ids:
                placeholders = ','.join(['%s'] * len(project_ids))
                
                cur.execute(f"""
                    SELECT id, title, address, project_id, status
                    FROM objects
                    WHERE project_id IN ({placeholders})
                """, project_ids)
                sites = cur.fetchall()
                
                site_ids = [s['id'] for s in sites]
                
                if site_ids:
                    site_placeholders = ','.join(['%s'] * len(site_ids))
                    
                    cur.execute(f"""
                        SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                               c.name as contractor_name, w.status, w.start_date, w.end_date
                        FROM works w
                        LEFT JOIN contractors c ON w.contractor_id = c.id
                        WHERE w.object_id IN ({site_placeholders})
                    """, site_ids)
                    works = cur.fetchall()
                else:
                    works = []
            else:
                sites, works = [], []
        
        work_ids = [w['id'] for w in works]
        
        if work_ids:
            work_placeholders = ','.join(['%s'] * len(work_ids))
            
            cur.execute(f"""
                SELECT i.id, i.work_id, i.inspection_number, i.created_by, i.status,
                       i.notes, i.created_at, i.completed_at,
                       u.name as inspector_name
                FROM inspections i
                LEFT JOIN users u ON i.created_by = u.id
                WHERE i.work_id IN ({work_placeholders})
            """, work_ids)
            inspections = cur.fetchall()
            
            inspection_ids = [i['id'] for i in inspections]
            
            if inspection_ids:
                insp_placeholders = ','.join(['%s'] * len(inspection_ids))
                
                cur.execute(f"""
                    SELECT id, inspection_id, title, standard, status
                    FROM inspection_checkpoints
                    WHERE inspection_id IN ({insp_placeholders})
                """, inspection_ids)
                checkpoints = cur.fetchall()
                
                cur.execute(f"""
                    SELECT id, inspection_id, checkpoint_id, description,
                           normative_ref, photo_urls, status, created_at, resolved_at
                    FROM remarks
                    WHERE inspection_id IN ({insp_placeholders})
                """, inspection_ids)
                remarks = cur.fetchall()
            else:
                checkpoints, remarks = [], []
            
            cur.execute(f"""
                SELECT wl.id, wl.work_id, wl.volume, wl.materials, wl.photo_urls,
                       wl.description, wl.created_by, wl.created_at,
                       u.name as author_name, u.role as author_role
                FROM work_logs wl
                LEFT JOIN users u ON wl.created_by = u.id
                WHERE wl.work_id IN ({work_placeholders})
                ORDER BY wl.created_at DESC
            """, work_ids)
            work_logs = cur.fetchall()
        else:
            inspections, checkpoints, remarks, work_logs = [], [], [], []
        
        cur.close()
        conn.close()
        
        for item in projects + sites + works + inspections + checkpoints + remarks + work_logs:
            for key, value in item.items():
                if hasattr(value, 'isoformat'):
                    item[key] = value.isoformat()
        
        result = {
            'projects': [dict(p) for p in projects],
            'sites': [dict(s) for s in sites],
            'works': [dict(w) for w in works],
            'inspections': [dict(i) for i in inspections],
            'checkpoints': [dict(c) for c in checkpoints],
            'remarks': [dict(r) for r in remarks],
            'workLogs': [dict(wl) for wl in work_logs]
        }
        
        return {
            'statusCode': 200,
            'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
