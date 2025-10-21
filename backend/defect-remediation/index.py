'''
Business: Manage defect remediation by contractors
Args: event with httpMethod, body, headers; context with request_id
Returns: HTTP response with remediation data or error
'''

import json
import os
from datetime import datetime
from typing import Dict, Any
import psycopg2

def get_db_connection():
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.set_session(autocommit=False)
    return conn

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    headers = event.get('headers', {})
    
    # Extract user_id from X-Auth-Token or fallback to X-User-Id for backward compatibility
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
    
    # Fallback to X-User-Id for backward compatibility
    if not user_id:
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            # Get remediations for contractor or specific report
            params = event.get('queryStringParameters', {}) or {}
            report_id = params.get('report_id')
            contractor_id = params.get('contractor_id', user_id)
            
            if report_id:
                # Get all remediations for report
                cur.execute(f"""
                    SELECT dr.id, dr.defect_report_id, dr.defect_id, dr.contractor_id,
                           dr.status, dr.remediation_description, dr.remediation_photos,
                           dr.completed_at, dr.verified_at, dr.verified_by, dr.verification_notes,
                           dr.created_at, dr.updated_at,
                           u.full_name as contractor_name,
                           v.full_name as verified_by_name
                    FROM defect_remediations dr
                    LEFT JOIN users u ON dr.contractor_id = u.id
                    LEFT JOIN users v ON dr.verified_by = v.id
                    WHERE dr.defect_report_id = {report_id}
                    ORDER BY dr.created_at
                """)
            else:
                # Get remediations for contractor
                cur.execute(f"""
                    SELECT dr.id, dr.defect_report_id, dr.defect_id, dr.contractor_id,
                           dr.status, dr.remediation_description, dr.remediation_photos,
                           dr.completed_at, dr.verified_at, dr.verified_by, dr.verification_notes,
                           dr.created_at, dr.updated_at,
                           rep.report_number,
                           rep.work_id,
                           w.title as work_title,
                           o.title as object_title,
                           v.full_name as verified_by_name
                    FROM defect_remediations dr
                    JOIN defect_reports rep ON dr.defect_report_id = rep.id
                    JOIN works w ON rep.work_id = w.id
                    JOIN objects o ON rep.object_id = o.id
                    LEFT JOIN users v ON dr.verified_by = v.id
                    WHERE dr.contractor_id = {contractor_id}
                    ORDER BY dr.created_at DESC
                """)
            
            remediations = []
            for row in cur.fetchall():
                if report_id:
                    remediations.append({
                        'id': row[0],
                        'defect_report_id': row[1],
                        'defect_id': row[2],
                        'contractor_id': row[3],
                        'status': row[4],
                        'remediation_description': row[5],
                        'remediation_photos': row[6],
                        'completed_at': row[7].isoformat() if row[7] else None,
                        'verified_at': row[8].isoformat() if row[8] else None,
                        'verified_by': row[9],
                        'verification_notes': row[10],
                        'created_at': row[11].isoformat() if row[11] else None,
                        'updated_at': row[12].isoformat() if row[12] else None,
                        'contractor_name': row[13],
                        'verified_by_name': row[14]
                    })
                else:
                    remediations.append({
                        'id': row[0],
                        'defect_report_id': row[1],
                        'defect_id': row[2],
                        'contractor_id': row[3],
                        'status': row[4],
                        'remediation_description': row[5],
                        'remediation_photos': row[6],
                        'completed_at': row[7].isoformat() if row[7] else None,
                        'verified_at': row[8].isoformat() if row[8] else None,
                        'verified_by': row[9],
                        'verification_notes': row[10],
                        'created_at': row[11].isoformat() if row[11] else None,
                        'updated_at': row[12].isoformat() if row[12] else None,
                        'report_number': row[13],
                        'work_id': row[14],
                        'work_title': row[15],
                        'object_title': row[16],
                        'verified_by_name': row[17]
                    })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(remediations),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            # Update remediation status
            body_data = json.loads(event.get('body', '{}'))
            remediation_id = int(body_data.get('remediation_id', 0))
            status = body_data.get('status', '').replace("'", "''")
            description = body_data.get('remediation_description', '').replace("'", "''")
            photos = body_data.get('remediation_photos', [])
            
            if not remediation_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'remediation_id is required'}),
                    'isBase64Encoded': False
                }
            
            update_parts = ['updated_at = CURRENT_TIMESTAMP']
            
            if status:
                update_parts.append(f"status = '{status}'")
                if status == 'completed':
                    update_parts.append('completed_at = CURRENT_TIMESTAMP')
            
            if description:
                update_parts.append(f"remediation_description = '{description}'")
            
            if photos:
                photos_json = json.dumps(photos, ensure_ascii=False).replace("'", "''")
                update_parts.append(f"remediation_photos = '{photos_json}'::jsonb")
            
            update_sql = ', '.join(update_parts)
            
            cur.execute(f"""
                UPDATE defect_remediations
                SET {update_sql}
                WHERE id = {remediation_id}
                RETURNING id, defect_report_id, defect_id, contractor_id, status,
                          remediation_description, remediation_photos, completed_at,
                          verified_at, verified_by, verification_notes, created_at, updated_at
            """)
            
            row = cur.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Remediation not found'}),
                    'isBase64Encoded': False
                }
            
            remediation = {
                'id': row[0],
                'defect_report_id': row[1],
                'defect_id': row[2],
                'contractor_id': row[3],
                'status': row[4],
                'remediation_description': row[5],
                'remediation_photos': row[6],
                'completed_at': row[7].isoformat() if row[7] else None,
                'verified_at': row[8].isoformat() if row[8] else None,
                'verified_by': row[9],
                'verification_notes': row[10],
                'created_at': row[11].isoformat() if row[11] else None,
                'updated_at': row[12].isoformat() if row[12] else None
            }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(remediation),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Verify remediation (by client/inspector)
            body_data = json.loads(event.get('body', '{}'))
            remediation_id = int(body_data.get('remediation_id', 0))
            approved = body_data.get('approved', False)
            notes = body_data.get('verification_notes', '').replace("'", "''")
            
            if not remediation_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'remediation_id is required'}),
                    'isBase64Encoded': False
                }
            
            new_status = 'completed' if approved else 'rejected'
            
            cur.execute(f"""
                UPDATE defect_remediations
                SET status = '{new_status}',
                    verified_at = CURRENT_TIMESTAMP,
                    verified_by = {user_id},
                    verification_notes = '{notes}',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = {remediation_id}
                RETURNING id, defect_report_id, defect_id, contractor_id, status,
                          remediation_description, remediation_photos, completed_at,
                          verified_at, verified_by, verification_notes, created_at, updated_at
            """)
            
            row = cur.fetchone()
            if not row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Remediation not found'}),
                    'isBase64Encoded': False
                }
            
            remediation = {
                'id': row[0],
                'defect_report_id': row[1],
                'defect_id': row[2],
                'contractor_id': row[3],
                'status': row[4],
                'remediation_description': row[5],
                'remediation_photos': row[6],
                'completed_at': row[7].isoformat() if row[7] else None,
                'verified_at': row[8].isoformat() if row[8] else None,
                'verified_by': row[9],
                'verification_notes': row[10],
                'created_at': row[11].isoformat() if row[11] else None,
                'updated_at': row[12].isoformat() if row[12] else None
            }
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(remediation),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()