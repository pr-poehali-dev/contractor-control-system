'''
Business: Create and manage defect reports (acts) from inspections
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with defect report data or error
'''

import json
import os
from datetime import datetime
from typing import Dict, Any, List
import psycopg2

def get_db_connection():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.set_session(autocommit=False)
    return conn

def generate_report_number(inspection_id: int, work_id: int) -> str:
    """Generate unique report number for defect report"""
    timestamp = datetime.now().strftime('%Y%m%d')
    return f"DR-{work_id}-{inspection_id}-{timestamp}"

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    auth_token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    
    # Get user_id from auth token (токен содержит user_id после .)
    user_id = None
    if auth_token:
        try:
            # Токен формата: {random_string}.{user_id}
            user_id = auth_token.split('.')[1] if '.' in auth_token else None
        except (IndexError, AttributeError):
            pass
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'POST':
            # Create defect report from inspection
            body_data = json.loads(event.get('body', '{}'))
            inspection_id = int(body_data.get('inspection_id', 0))
            notes = body_data.get('notes', '').replace("'", "''")
            
            print(f"Creating defect report for inspection_id: {inspection_id}")
            
            if not inspection_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'inspection_id is required'}),
                    'isBase64Encoded': False
                }
            
            # Get inspection with defects
            print(f"Fetching inspection data...")
            cur.execute(f"""
                SELECT i.id, i.work_id, i.inspection_number, i.created_by, i.created_at, i.defects,
                       w.object_id, w.title as work_title,
                       o.title as object_title, o.address
                FROM inspections i
                JOIN works w ON i.work_id = w.id
                JOIN objects o ON w.object_id = o.id
                WHERE i.id = {inspection_id}
            """)
            print(f"Inspection query executed")
            
            row = cur.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'Inspection not found'}),
                    'isBase64Encoded': False
                }
            
            inspection = {
                'id': row[0],
                'work_id': row[1],
                'inspection_number': row[2],
                'created_by': row[3],
                'created_at': row[4].isoformat() if row[4] else None,
                'defects': row[5],
                'object_id': row[6],
                'work_title': row[7],
                'object_title': row[8],
                'address': row[9],
                'inspector_name': 'Инспектор'  # Will be fetched from user service if needed
            }
            
            # Parse defects
            defects_json = inspection.get('defects', '[]')
            defects = json.loads(defects_json) if isinstance(defects_json, str) else []
            
            if not defects:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'No defects found in inspection'}),
                    'isBase64Encoded': False
                }
            
            # Count critical defects
            critical_count = sum(1 for d in defects if d.get('severity') == 'Критический')
            
            # Generate report number
            report_number = generate_report_number(inspection_id, inspection['work_id'])
            
            # Prepare report data for template
            report_data = {
                'inspection_id': inspection_id,
                'inspection_number': inspection['inspection_number'],
                'inspection_date': inspection['created_at'],
                'work_title': inspection['work_title'],
                'object_title': inspection['object_title'],
                'object_address': inspection.get('address'),
                'inspector_name': inspection['inspector_name'],
                'defects': defects,
                'total_defects': len(defects),
                'critical_defects': critical_count,
                'created_at': datetime.now().isoformat()
            }
            
            report_data_json = json.dumps(report_data, ensure_ascii=False).replace("'", "''")
            
            # Create defect report
            print(f"Inserting defect report...")
            cur.execute(f"""
                INSERT INTO defect_reports 
                (inspection_id, report_number, work_id, object_id, created_by, 
                 status, total_defects, critical_defects, report_data, notes)
                VALUES ({inspection_id}, '{report_number}', {inspection['work_id']}, 
                        {inspection['object_id']}, {user_id}, 'active', {len(defects)}, 
                        {critical_count}, '{report_data_json}'::jsonb, '{notes}')
                RETURNING id, inspection_id, report_number, work_id, object_id, created_by, 
                          created_at, status, total_defects, critical_defects
            """)
            
            report_row = cur.fetchone()
            report = {
                'id': report_row[0],
                'inspection_id': report_row[1],
                'report_number': report_row[2],
                'work_id': report_row[3],
                'object_id': report_row[4],
                'created_by': report_row[5],
                'created_at': report_row[6].isoformat() if report_row[6] else None,
                'status': report_row[7],
                'total_defects': report_row[8],
                'critical_defects': report_row[9]
            }
            
            # Get contractor for work
            print(f"Fetching contractor...")
            cur.execute(f"SELECT contractor_id FROM works WHERE id = {inspection['work_id']}")
            print(f"Contractor query executed")
            contractor_row = cur.fetchone()
            contractor_id = contractor_row[0] if contractor_row else None
            
            # Create remediation records for each defect
            if contractor_id:
                for defect in defects:
                    defect_id = str(defect.get('id', '')).replace("'", "''")
                    cur.execute(f"""
                        INSERT INTO defect_remediations
                        (defect_report_id, defect_id, contractor_id, status)
                        VALUES ({report['id']}, '{defect_id}', {contractor_id}, 'pending')
                    """)
            
            print(f"Committing transaction...")
            conn.commit()
            print(f"Report created successfully: {report['id']}")
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'data': report}),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            # Get defect reports
            params = event.get('queryStringParameters', {}) or {}
            report_id = params.get('report_id')
            work_id = params.get('work_id')
            inspection_id = params.get('inspection_id')
            
            if report_id:
                # Get specific report with remediations
                cur.execute(f"""
                    SELECT dr.id, dr.inspection_id, dr.report_number, dr.work_id, dr.object_id,
                           dr.created_by, dr.created_at, dr.status, dr.total_defects, 
                           dr.critical_defects, dr.report_data, dr.notes,
                           w.title as work_title,
                           o.title as object_title
                    FROM defect_reports dr
                    JOIN works w ON dr.work_id = w.id
                    JOIN objects o ON dr.object_id = o.id
                    WHERE dr.id = {report_id}
                """)
                
                report_row = cur.fetchone()
                if not report_row:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Report not found'}),
                        'isBase64Encoded': False
                    }
                
                report = {
                    'id': report_row[0],
                    'inspection_id': report_row[1],
                    'report_number': report_row[2],
                    'work_id': report_row[3],
                    'object_id': report_row[4],
                    'created_by': report_row[5],
                    'created_at': report_row[6].isoformat() if report_row[6] else None,
                    'status': report_row[7],
                    'total_defects': report_row[8],
                    'critical_defects': report_row[9],
                    'report_data': report_row[10],
                    'notes': report_row[11],
                    'created_by_name': 'Инспектор',
                    'work_title': report_row[12],
                    'object_title': report_row[13]
                }
                
                # Get remediations
                cur.execute(f"""
                    SELECT dr.id, dr.defect_report_id, dr.defect_id, dr.contractor_id,
                           dr.status, dr.remediation_description, dr.remediation_photos,
                           dr.completed_at, dr.verified_at, dr.verified_by, dr.verification_notes,
                           dr.created_at, dr.updated_at
                    FROM defect_remediations dr
                    WHERE dr.defect_report_id = {report_id}
                    ORDER BY dr.created_at
                """)
                
                remediations = []
                for rem_row in cur.fetchall():
                    remediations.append({
                        'id': rem_row[0],
                        'defect_report_id': rem_row[1],
                        'defect_id': rem_row[2],
                        'contractor_id': rem_row[3],
                        'status': rem_row[4],
                        'remediation_description': rem_row[5],
                        'remediation_photos': rem_row[6],
                        'completed_at': rem_row[7].isoformat() if rem_row[7] else None,
                        'verified_at': rem_row[8].isoformat() if rem_row[8] else None,
                        'verified_by': rem_row[9],
                        'verification_notes': rem_row[10],
                        'created_at': rem_row[11].isoformat() if rem_row[11] else None,
                        'updated_at': rem_row[12].isoformat() if rem_row[12] else None,
                        'contractor_name': 'Подрядчик'
                    })
                
                report['remediations'] = remediations
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'data': report}),
                    'isBase64Encoded': False
                }
            
            elif inspection_id:
                # Get report by inspection
                try:
                    inspection_id_int = int(inspection_id)
                except (ValueError, TypeError):
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': False, 'error': 'Invalid inspection_id'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(f"""
                    SELECT dr.id, dr.inspection_id, dr.report_number, dr.work_id, dr.object_id,
                           dr.created_by, dr.created_at, dr.status, dr.total_defects, 
                           dr.critical_defects, dr.report_data, dr.notes,
                           w.title as work_title,
                           o.title as object_title
                    FROM defect_reports dr
                    JOIN works w ON dr.work_id = w.id
                    JOIN objects o ON dr.object_id = o.id
                    WHERE dr.inspection_id = {inspection_id_int}
                """)
                
                report_row = cur.fetchone()
                report = None
                if report_row:
                    report = {
                        'id': report_row[0],
                        'inspection_id': report_row[1],
                        'report_number': report_row[2],
                        'work_id': report_row[3],
                        'object_id': report_row[4],
                        'created_by': report_row[5],
                        'created_at': report_row[6].isoformat() if report_row[6] else None,
                        'status': report_row[7],
                        'total_defects': report_row[8],
                        'critical_defects': report_row[9],
                        'report_data': report_row[10],
                        'notes': report_row[11],
                        'created_by_name': 'Инспектор',
                        'work_title': report_row[12],
                        'object_title': report_row[13]
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'data': report}),
                    'isBase64Encoded': False
                }
            
            elif work_id:
                # Get all reports for work
                cur.execute(f"""
                    SELECT dr.id, dr.inspection_id, dr.report_number, dr.work_id, dr.object_id,
                           dr.created_by, dr.created_at, dr.status, dr.total_defects, 
                           dr.critical_defects, dr.report_data, dr.notes,
                           w.title as work_title,
                           o.title as object_title
                    FROM defect_reports dr
                    JOIN works w ON dr.work_id = w.id
                    JOIN objects o ON dr.object_id = o.id
                    WHERE dr.work_id = {work_id}
                    ORDER BY dr.created_at DESC
                """)
                
                reports = []
                for report_row in cur.fetchall():
                    reports.append({
                        'id': report_row[0],
                        'inspection_id': report_row[1],
                        'report_number': report_row[2],
                        'work_id': report_row[3],
                        'object_id': report_row[4],
                        'created_by': report_row[5],
                        'created_at': report_row[6].isoformat() if report_row[6] else None,
                        'status': report_row[7],
                        'total_defects': report_row[8],
                        'critical_defects': report_row[9],
                        'report_data': report_row[10],
                        'notes': report_row[11],
                        'created_by_name': 'Инспектор',
                        'work_title': report_row[12],
                        'object_title': report_row[13]
                    })
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'data': reports}),
                    'isBase64Encoded': False
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': False, 'error': 'report_id, work_id or inspection_id required'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'success': False, 'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()