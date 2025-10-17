'''
Business: Get contractor tasks from remediations and defect reports
Args: event with queryStringParameters.contractor_id
Returns: JSON with tasks list
'''

import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {}) or {}
    contractor_id = params.get('contractor_id')
    
    if not contractor_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'contractor_id is required'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration error'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    query = '''
        SELECT 
            r.id,
            r.defect_report_id,
            dr.report_number,
            r.defect_id,
            r.status,
            r.created_at,
            dr.report_data,
            i.work_id,
            w.title as work_title,
            o.title as object_title
        FROM defect_remediations r
        JOIN defect_reports dr ON r.defect_report_id = dr.id
        JOIN inspections i ON dr.inspection_id = i.id
        JOIN works w ON i.work_id = w.id
        JOIN objects o ON w.object_id = o.id
        WHERE r.contractor_id = ''' + contractor_id + '''
        ORDER BY 
            CASE r.status 
                WHEN 'pending' THEN 1
                WHEN 'completed' THEN 2
                WHEN 'rejected' THEN 3
                WHEN 'verified' THEN 4
            END,
            r.created_at DESC
    '''
    
    cursor.execute(query)
    rows = cursor.fetchall()
    
    tasks: List[Dict[str, Any]] = []
    for row in rows:
        report_data = row[6] if row[6] else {}
        defects = report_data.get('defects', [])
        
        defect_info = next(
            (d for d in defects if d.get('id') == row[3]),
            {}
        )
        
        tasks.append({
            'id': row[0],
            'report_id': row[1],
            'report_number': row[2],
            'defect_id': row[3],
            'defect_description': defect_info.get('description', ''),
            'defect_location': defect_info.get('location'),
            'defect_severity': defect_info.get('severity'),
            'status': row[4],
            'work_title': row[8],
            'object_title': row[9],
            'created_at': row[5].isoformat() if row[5] else None
        })
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'tasks': tasks}),
        'isBase64Encoded': False
    }