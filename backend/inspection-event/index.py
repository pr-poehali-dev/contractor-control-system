'''
Business: Создание и управление событиями проверок
Args: event с httpMethod, body, queryStringParameters; context с request_id
Returns: HTTP response с данными события
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p8942561_contractor_control_s'

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            inspection_id = event.get('queryStringParameters', {}).get('inspection_id') if event.get('queryStringParameters') else None
            
            if inspection_id:
                cur.execute(f"""
                    SELECT ie.*, u.name as author_name, u.role as author_role
                    FROM {SCHEMA}.inspection_events ie
                    LEFT JOIN {SCHEMA}.users u ON ie.created_by = u.id
                    WHERE ie.inspection_id = {inspection_id}
                    ORDER BY ie.created_at ASC
                """)
            else:
                cur.execute(f"""
                    SELECT ie.*, u.name as author_name, u.role as author_role
                    FROM {SCHEMA}.inspection_events ie
                    LEFT JOIN {SCHEMA}.users u ON ie.created_by = u.id
                    ORDER BY ie.created_at DESC
                    LIMIT 100
                """)
            
            events = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(e) for e in events], default=str),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            inspection_id = int(body_data.get('inspection_id', 0))
            event_type = body_data.get('event_type', '').replace("'", "''")
            created_by = int(body_data.get('created_by', 0))
            metadata = body_data.get('metadata', {})
            
            metadata_json = json.dumps(metadata, ensure_ascii=False).replace("'", "''")
            
            cur.execute(f"""
                INSERT INTO {SCHEMA}.inspection_events (inspection_id, event_type, created_by, metadata)
                VALUES ({inspection_id}, '{event_type}', {created_by}, '{metadata_json}'::jsonb)
                RETURNING *
            """)
            
            new_event = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(new_event), default=str),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
