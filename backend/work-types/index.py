'''
Business: CRUD для справочника типов работ
Args: event с httpMethod, body (name, description, category, unit для POST/PUT), queryStringParameters (id для PUT/DELETE)
Returns: Список типов работ, созданный/обновленный тип работы или результат удаления
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        if method == 'GET':
            cur.execute(
                """
                SELECT id, name, code, description, category, unit, 
                       normative_base, control_points, typical_defects, 
                       acceptance_criteria, created_at, updated_at
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
                    'code': wt[2],
                    'description': wt[3],
                    'category': wt[4],
                    'unit': wt[5],
                    'normative_base': wt[6],
                    'control_points': wt[7],
                    'typical_defects': wt[8],
                    'acceptance_criteria': wt[9],
                    'created_at': wt[10].isoformat() if wt[10] else None,
                    'updated_at': wt[11].isoformat() if wt[11] else None
                })
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'work_types': work_types_list}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            code = body.get('code', '')
            description = body.get('description', '')
            category = body.get('category')
            unit = body.get('unit')
            normative_base = body.get('normative_base', '')
            control_points = body.get('control_points', '')
            typical_defects = body.get('typical_defects', '')
            acceptance_criteria = body.get('acceptance_criteria', '')
            
            if not name or not category or not unit:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields: name, category, unit'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """
                INSERT INTO work_types (name, code, description, category, unit, 
                                       normative_base, control_points, typical_defects, 
                                       acceptance_criteria, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, name, code, description, category, unit, 
                          normative_base, control_points, typical_defects, 
                          acceptance_criteria, created_at, updated_at
                """,
                (name, code or None, description, category, unit, 
                 normative_base or None, control_points or None, 
                 typical_defects or None, acceptance_criteria or None)
            )
            work_type = cur.fetchone()
            conn.commit()
            
            work_type_data = {
                'id': work_type[0],
                'name': work_type[1],
                'code': work_type[2],
                'description': work_type[3],
                'category': work_type[4],
                'unit': work_type[5],
                'normative_base': work_type[6],
                'control_points': work_type[7],
                'typical_defects': work_type[8],
                'acceptance_criteria': work_type[9],
                'created_at': work_type[10].isoformat() if work_type[10] else None,
                'updated_at': work_type[11].isoformat() if work_type[11] else None
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(work_type_data),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            params = event.get('queryStringParameters', {}) or {}
            work_id = params.get('id')
            
            if not work_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing work type id'}),
                    'isBase64Encoded': False
                }
            
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            code = body.get('code', '')
            description = body.get('description', '')
            category = body.get('category')
            unit = body.get('unit')
            normative_base = body.get('normative_base', '')
            control_points = body.get('control_points', '')
            typical_defects = body.get('typical_defects', '')
            acceptance_criteria = body.get('acceptance_criteria', '')
            
            if not name or not category or not unit:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields: name, category, unit'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """
                UPDATE work_types 
                SET name = %s, code = %s, description = %s, category = %s, unit = %s,
                    normative_base = %s, control_points = %s, typical_defects = %s,
                    acceptance_criteria = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
                RETURNING id, name, code, description, category, unit,
                          normative_base, control_points, typical_defects,
                          acceptance_criteria, created_at, updated_at
                """,
                (name, code or None, description, category, unit,
                 normative_base or None, control_points or None,
                 typical_defects or None, acceptance_criteria or None, work_id)
            )
            work_type = cur.fetchone()
            
            if not work_type:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Work type not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            
            work_type_data = {
                'id': work_type[0],
                'name': work_type[1],
                'code': work_type[2],
                'description': work_type[3],
                'category': work_type[4],
                'unit': work_type[5],
                'normative_base': work_type[6],
                'control_points': work_type[7],
                'typical_defects': work_type[8],
                'acceptance_criteria': work_type[9],
                'created_at': work_type[10].isoformat() if work_type[10] else None,
                'updated_at': work_type[11].isoformat() if work_type[11] else None
            }
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(work_type_data),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {}) or {}
            work_id = params.get('id')
            
            if not work_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing work type id'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("DELETE FROM work_types WHERE id = %s RETURNING id", (work_id,))
            deleted = cur.fetchone()
            
            if not deleted:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Work type not found'}),
                    'isBase64Encoded': False
                }
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': deleted[0]}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        import traceback
        print(f"ERROR: {str(e)}")
        print(f"TRACEBACK: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
