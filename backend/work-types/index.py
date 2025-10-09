'''
Business: CRUD для справочника типов работ
Args: event с httpMethod, body (name, description, category, unit для POST)
Returns: Список типов работ или созданный тип работы
'''

import json
import os
import psycopg2
from typing import Dict, Any

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            cur.execute(
                """
                SELECT id, name, description, category, unit, created_at
                FROM work_types
                ORDER BY category, name
                """
            )
            work_types = cur.fetchall()
            
            work_types_list = []
            for wt in work_types:
                work_types_list.append({
                    'id': wt[0],
                    'name': wt[1],
                    'description': wt[2],
                    'category': wt[3],
                    'unit': wt[4],
                    'created_at': wt[5].isoformat() if wt[5] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'work_types': work_types_list})
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            description = body.get('description', '')
            category = body.get('category')
            unit = body.get('unit')
            
            if not name or not category or not unit:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields: name, category, unit'})
                }
            
            cur.execute(
                """
                INSERT INTO work_types (name, description, category, unit, created_at)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                RETURNING id, name, description, category, unit, created_at
                """,
                (name, description, category, unit)
            )
            work_type = cur.fetchone()
            conn.commit()
            
            work_type_data = {
                'id': work_type[0],
                'name': work_type[1],
                'description': work_type[2],
                'category': work_type[3],
                'unit': work_type[4],
                'created_at': work_type[5].isoformat() if work_type[5] else None
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(work_type_data)
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(f"TRACEBACK: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
