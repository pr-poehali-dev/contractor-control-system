'''
Business: Load user's data from database with JWT authentication (optimized with single JOIN query)
Args: event with httpMethod GET, headers (X-Auth-Token)
Returns: JSON with all user data (objects, works, inspections, remarks, workLogs, contractors)
'''

import json
import os
import psycopg2
import jwt
from typing import Dict, Any, List
from psycopg2.extras import RealDictCursor
from collections import defaultdict

DATABASE_URL = os.environ.get('DATABASE_URL')
JWT_SECRET = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')
SCHEMA = 't_p8942561_contractor_control_s'

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def verify_jwt_token(token: str) -> Dict[str, Any]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise ValueError('Token expired')
    except jwt.InvalidTokenError:
        raise ValueError('Invalid token')

def build_hierarchy(objects: List[Dict], works: List[Dict], inspections: List[Dict], 
                     remarks: List[Dict], work_logs: List[Dict], chat_messages: List[Dict],
                     defect_reports: List[Dict], defect_remediations: List[Dict]) -> List[Dict]:
    """
    Построение иерархии данных: objects -> works -> [inspections, workLogs, etc]
    Оптимизировано: O(n) вместо N+1 запросов
    """
    
    # Группируем данные по work_id
    works_by_object = defaultdict(list)
    inspections_by_work = defaultdict(list)
    work_logs_by_work = defaultdict(list)
    chat_by_work = defaultdict(list)
    reports_by_work = defaultdict(list)
    
    # Группируем remarks по inspection_id
    remarks_by_inspection = defaultdict(list)
    for remark in remarks:
        remarks_by_inspection[remark['inspection_id']].append(dict(remark))
    
    # Группируем defect_remediations по report_id
    remediations_by_report = defaultdict(list)
    for remediation in defect_remediations:
        remediations_by_report[remediation['defect_report_id']].append(dict(remediation))
    
    # Добавляем remarks к inspections
    for inspection in inspections:
        inspection_dict = dict(inspection)
        inspection_dict['remarks'] = remarks_by_inspection.get(inspection['id'], [])
        inspections_by_work[inspection['work_id']].append(inspection_dict)
    
    # Добавляем remediations к defect_reports
    for report in defect_reports:
        report_dict = dict(report)
        report_dict['remediations'] = remediations_by_report.get(report['id'], [])
        reports_by_work[report['work_id']].append(report_dict)
    
    # Группируем work_logs и chat по work_id
    for log in work_logs:
        work_logs_by_work[log['work_id']].append(dict(log))
    
    for msg in chat_messages:
        chat_by_work[msg['work_id']].append(dict(msg))
    
    # Группируем works по object_id
    for work in works:
        work_dict = dict(work)
        work_id = work['id']
        work_dict['inspections'] = inspections_by_work.get(work_id, [])
        work_dict['workLogs'] = work_logs_by_work.get(work_id, [])
        work_dict['chatMessages'] = chat_by_work.get(work_id, [])
        work_dict['defectReports'] = reports_by_work.get(work_id, [])
        works_by_object[work['object_id']].append(work_dict)
    
    # Добавляем works к objects
    result_objects = []
    for obj in objects:
        obj_dict = dict(obj)
        obj_dict['works'] = works_by_object.get(obj['id'], [])
        result_objects.append(obj_dict)
    
    return result_objects

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
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
        
        # Проверяем пользователя
        cur.execute(
            f"SELECT id, role, is_active, name, email, phone, organization, onboarding_completed, organization_id, created_at FROM {SCHEMA}.users WHERE id = {user_id}"
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
        
        # Получаем objects и works в зависимости от роли
        if role == 'admin':
            # Админ видит все
            cur.execute(f"""
                SELECT id, title, address, description, client_id, status, created_at, updated_at
                FROM {SCHEMA}.objects
                ORDER BY created_at DESC
            """)
            objects = cur.fetchall()
            
            cur.execute(f"""
                SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                       c.name as contractor_name, w.status, w.start_date, w.end_date,
                       w.planned_start_date, w.planned_end_date, w.completion_percentage,
                       w.created_at, w.updated_at
                FROM {SCHEMA}.works w
                LEFT JOIN {SCHEMA}.contractors c ON w.contractor_id = c.id
                ORDER BY w.created_at DESC
            """)
            works = cur.fetchall()
            
        elif role == 'contractor':
            # Подрядчик видит только свои работы
            cur.execute(f"""
                SELECT id as contractor_id
                FROM {SCHEMA}.contractors
                WHERE user_id = {user_id}
            """)
            contractor = cur.fetchone()
            contractor_id = contractor['contractor_id'] if contractor else None
            
            if contractor_id:
                cur.execute(f"""
                    SELECT DISTINCT o.id, o.title, o.address, o.description, o.client_id, 
                           o.status, o.created_at, o.updated_at
                    FROM {SCHEMA}.objects o
                    JOIN {SCHEMA}.works w ON w.object_id = o.id
                    WHERE w.contractor_id = {contractor_id}
                    ORDER BY o.created_at DESC
                """)
                objects = cur.fetchall()
                
                cur.execute(f"""
                    SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                           c.name as contractor_name, w.status, w.start_date, w.end_date,
                           w.planned_start_date, w.planned_end_date, w.completion_percentage,
                           w.created_at, w.updated_at
                    FROM {SCHEMA}.works w
                    LEFT JOIN {SCHEMA}.contractors c ON w.contractor_id = c.id
                    WHERE w.contractor_id = {contractor_id}
                    ORDER BY w.created_at DESC
                """)
                works = cur.fetchall()
            else:
                objects, works = [], []
        else:
            # Клиент видит только свои объекты
            cur.execute(f"""
                SELECT id, title, address, description, client_id, status, created_at, updated_at
                FROM {SCHEMA}.objects
                WHERE client_id = {user_id}
                ORDER BY created_at DESC
            """)
            objects = cur.fetchall()
            
            object_ids = [o['id'] for o in objects]
            
            if object_ids:
                object_ids_str = ','.join(str(oid) for oid in object_ids)
                cur.execute(f"""
                    SELECT w.id, w.title, w.description, w.object_id, w.contractor_id,
                           c.name as contractor_name, w.status, w.start_date, w.end_date,
                           w.planned_start_date, w.planned_end_date, w.completion_percentage,
                           w.created_at, w.updated_at
                    FROM {SCHEMA}.works w
                    LEFT JOIN {SCHEMA}.contractors c ON w.contractor_id = c.id
                    WHERE w.object_id IN ({object_ids_str})
                    ORDER BY w.created_at DESC
                """)
                works = cur.fetchall()
            else:
                works = []
        
        work_ids = [w['id'] for w in works]
        
        # ОПТИМИЗАЦИЯ: Загружаем все связанные данные одним махом
        inspections = []
        remarks = []
        work_logs = []
        chat_messages = []
        defect_reports = []
        defect_remediations = []
        
        if work_ids:
            work_ids_str = ','.join(str(wid) for wid in work_ids)
            
            # Загружаем inspections с автором
            cur.execute(f"""
                SELECT i.id, i.work_id, i.work_log_id, i.inspection_number, i.created_by, i.status,
                       i.notes, i.description, i.defects, i.photo_urls, i.created_at, i.completed_at,
                       i.scheduled_date, i.title, i.type, i.defect_report_document_id,
                       u.name as author_name, u.role as author_role
                FROM {SCHEMA}.inspections i
                LEFT JOIN {SCHEMA}.users u ON i.created_by = u.id
                WHERE i.work_id IN ({work_ids_str})
                ORDER BY i.created_at DESC
            """)
            inspections = cur.fetchall()
            
            inspection_ids = [i['id'] for i in inspections]
            
            # Загружаем remarks если есть inspections
            if inspection_ids:
                inspection_ids_str = ','.join(str(iid) for iid in inspection_ids)
                cur.execute(f"""
                    SELECT id, inspection_id, checkpoint_id, description,
                           normative_ref, photo_urls, status, created_at, resolved_at
                    FROM {SCHEMA}.remarks
                    WHERE inspection_id IN ({inspection_ids_str})
                    ORDER BY created_at DESC
                """)
                remarks = cur.fetchall()
            
            # Загружаем work_logs
            cur.execute(f"""
                SELECT wl.id, wl.work_id, wl.description, wl.volume, wl.materials,
                       wl.photo_urls, wl.created_at, wl.created_by,
                       u.name as author_name
                FROM {SCHEMA}.work_logs wl
                LEFT JOIN {SCHEMA}.users u ON wl.created_by = u.id
                WHERE wl.work_id IN ({work_ids_str})
                ORDER BY wl.created_at DESC
            """)
            work_logs = cur.fetchall()
            
            # Загружаем chat messages
            cur.execute(f"""
                SELECT cm.id, cm.work_id, cm.message_type, cm.message, cm.photo_urls,
                       cm.created_at, cm.created_by,
                       u.name as author_name, u.role as author_role
                FROM {SCHEMA}.chat_messages cm
                LEFT JOIN {SCHEMA}.users u ON cm.created_by = u.id
                WHERE cm.work_id IN ({work_ids_str})
                ORDER BY cm.created_at DESC
            """)
            chat_messages = cur.fetchall()
            
            # Загружаем defect reports
            cur.execute(f"""
                SELECT dr.id, dr.work_id, dr.object_id, dr.inspection_id, dr.report_number,
                       dr.status, dr.created_at, dr.created_by, dr.total_defects, dr.critical_defects,
                       dr.report_data, dr.pdf_url, dr.notes,
                       u.name as author_name
                FROM {SCHEMA}.defect_reports dr
                LEFT JOIN {SCHEMA}.users u ON dr.created_by = u.id
                WHERE dr.work_id IN ({work_ids_str})
                ORDER BY dr.created_at DESC
            """)
            defect_reports = cur.fetchall()
            
            report_ids = [r['id'] for r in defect_reports]
            
            # Загружаем defect remediations
            if report_ids:
                report_ids_str = ','.join(str(rid) for rid in report_ids)
                cur.execute(f"""
                    SELECT rem.id, rem.defect_report_id, rem.defect_id, rem.contractor_id,
                           rem.remediation_description, rem.remediation_photos, rem.status,
                           rem.created_at, rem.completed_at, rem.verified_at, rem.verified_by,
                           c.name as contractor_name
                    FROM {SCHEMA}.defect_remediations rem
                    LEFT JOIN {SCHEMA}.contractors c ON rem.contractor_id = c.id
                    WHERE rem.defect_report_id IN ({report_ids_str})
                    ORDER BY rem.created_at DESC
                """)
                defect_remediations = cur.fetchall()
        
        # Загружаем contractors для пользователя
        if role == 'admin':
            cur.execute(f"""
                SELECT id, name, inn, contact_info, phone, email, user_id, created_at
                FROM {SCHEMA}.contractors
                ORDER BY name
            """)
            contractors = cur.fetchall()
        else:
            cur.execute(f"""
                SELECT DISTINCT c.id, c.name, c.inn, c.contact_info, c.phone, c.email, c.user_id, c.created_at
                FROM {SCHEMA}.contractors c
                LEFT JOIN {SCHEMA}.client_contractors cc ON c.id = cc.contractor_id
                WHERE cc.client_id = {user_id} OR c.user_id = {user_id}
                ORDER BY c.name
            """)
            contractors = cur.fetchall()
        
        # Загружаем info_posts
        cur.execute(f"""
            SELECT id, title, content, link, created_at
            FROM {SCHEMA}.info_posts
            ORDER BY created_at DESC
            LIMIT 50
        """)
        info_posts = cur.fetchall()
        
        # Загружаем work_templates
        cur.execute(f"""
            SELECT id, title, category, description
            FROM {SCHEMA}.work_templates
            ORDER BY category, title
        """)
        work_templates = cur.fetchall()
        
        # Загружаем last_seen_at для каждой работы
        work_views = {}
        if work_ids:
            work_ids_str = ','.join(str(wid) for wid in work_ids)
            cur.execute(f"""
                SELECT work_id, last_seen_at
                FROM {SCHEMA}.work_views
                WHERE user_id = {user_id} AND work_id IN ({work_ids_str})
            """)
            views_result = cur.fetchall()
            for view in views_result:
                work_views[view['work_id']] = view['last_seen_at']
        
        # Подсчёт непрочитанных по work_id
        unread_counts = {}
        
        for work in works:
            work_id = work['id']
            last_seen = work_views.get(work_id)
            
            # Считаем сообщения созданные после last_seen
            unread_messages = 0
            if last_seen:
                unread_messages = len([
                    msg for msg in chat_messages 
                    if msg['work_id'] == work_id and msg.get('created_at') and msg['created_at'] > last_seen
                ])
            else:
                unread_messages = len([msg for msg in chat_messages if msg['work_id'] == work_id])
            
            # Считаем логи созданные после last_seen
            unread_logs = 0
            if last_seen:
                unread_logs = len([
                    log for log in work_logs 
                    if log['work_id'] == work_id and log.get('created_at') and log['created_at'] > last_seen
                ])
            else:
                unread_logs = len([log for log in work_logs if log['work_id'] == work_id])
            
            # Считаем проверки созданные после last_seen (только активные)
            unread_inspections = 0
            if last_seen:
                unread_inspections = len([
                    insp for insp in inspections 
                    if insp['work_id'] == work_id and insp.get('created_at') and insp['created_at'] > last_seen and insp.get('status') in ['active', 'pending']
                ])
            else:
                unread_inspections = len([
                    insp for insp in inspections 
                    if insp['work_id'] == work_id and insp.get('status') in ['active', 'pending']
                ])
            
            unread_counts[work_id] = {
                'messages': unread_messages,
                'logs': unread_logs,
                'inspections': unread_inspections,
                'total': unread_messages + unread_logs + unread_inspections
            }
        
        # Получаем contractor_id для пользователя-подрядчика ПЕРЕД закрытием соединения
        user_contractor_id = None
        if role == 'contractor':
            cur.execute(f"""
                SELECT id as contractor_id
                FROM {SCHEMA}.contractors
                WHERE user_id = {user_id}
            """)
            contractor_result = cur.fetchone()
            if contractor_result:
                user_contractor_id = contractor_result['contractor_id']
        
        # Получаем организацию пользователя ПЕРЕД закрытием соединения
        organization = None
        if user.get('organization_id'):
            try:
                cur.execute(f"""
                    SELECT id, name, inn, kpp, legal_address, actual_address, director, phone, email, type, created_at
                    FROM {SCHEMA}.organizations
                    WHERE id = {user['organization_id']}
                """)
                org_row = cur.fetchone()
                if org_row:
                    organization = dict(org_row)
            except Exception as org_error:
                print(f"WARNING: Failed to fetch organization: {org_error}")
                organization = None
        
        # Строим иерархию данных
        objects_with_works = build_hierarchy(
            objects, works, inspections, remarks, work_logs, 
            chat_messages, defect_reports, defect_remediations
        )
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'objects': objects_with_works,
                'contractors': [dict(c) for c in contractors],
                'infoPosts': [dict(ip) for ip in info_posts],
                'workTemplates': [dict(wt) for wt in work_templates],
                'unreadCounts': unread_counts,
                'contractorId': user_contractor_id,
                'organization': organization,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'phone': user.get('phone'),
                    'organization': user.get('organization'),
                    'role': user['role'],
                    'onboarding_completed': user.get('onboarding_completed', False),
                    'organization_id': user.get('organization_id'),
                    'created_at': user.get('created_at').isoformat() if user.get('created_at') else None
                }
            }, default=str)
        }
    
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"ERROR in user-data: {error_trace}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }