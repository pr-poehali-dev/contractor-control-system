import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Initialize default document templates for a user
    Args: event with httpMethod, body (user_id)
    Returns: HTTP response with created templates
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    user_id = body_data.get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'user_id is required'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Database not configured'})
        }
    
    default_templates = [
        {
            'name': 'Акт проверки (об обнаружении замечаний)',
            'description': 'Системный шаблон для фиксации замечаний по результатам проверки работ',
            'template_type': 'inspection',
            'is_system': True,
            'content': {
                'basePdf': '',
                'schemas': [
                    [
                        {
                            'name': 'title',
                            'type': 'text',
                            'position': {'x': 20, 'y': 20},
                            'width': 170,
                            'height': 10,
                            'fontSize': 18,
                            'fontName': 'NotoSerifJP'
                        },
                        {
                            'name': 'date',
                            'type': 'text',
                            'position': {'x': 20, 'y': 35},
                            'width': 80,
                            'height': 7
                        },
                        {
                            'name': 'objectName',
                            'type': 'text',
                            'position': {'x': 20, 'y': 45},
                            'width': 170,
                            'height': 7
                        },
                        {
                            'name': 'workName',
                            'type': 'text',
                            'position': {'x': 20, 'y': 55},
                            'width': 170,
                            'height': 7
                        },
                        {
                            'name': 'defects',
                            'type': 'text',
                            'position': {'x': 20, 'y': 70},
                            'width': 170,
                            'height': 80
                        }
                    ]
                ]
            }
        },
        {
            'name': 'Акт об устранении дефектов',
            'description': 'Системный шаблон для подтверждения устранения замечаний',
            'template_type': 'defect_elimination',
            'is_system': True,
            'content': {
                'basePdf': '',
                'schemas': [
                    [
                        {
                            'name': 'title',
                            'type': 'text',
                            'position': {'x': 20, 'y': 20},
                            'width': 170,
                            'height': 10,
                            'fontSize': 18
                        },
                        {
                            'name': 'date',
                            'type': 'text',
                            'position': {'x': 20, 'y': 35},
                            'width': 80,
                            'height': 7
                        },
                        {
                            'name': 'objectName',
                            'type': 'text',
                            'position': {'x': 20, 'y': 45},
                            'width': 170,
                            'height': 7
                        },
                        {
                            'name': 'eliminatedDefects',
                            'type': 'text',
                            'position': {'x': 20, 'y': 70},
                            'width': 170,
                            'height': 80
                        }
                    ]
                ]
            }
        },
        {
            'name': 'Акт приёмки выполненных работ',
            'description': 'Системный шаблон для приёмки завершённых работ',
            'template_type': 'completion',
            'is_system': True,
            'content': {
                'basePdf': '',
                'schemas': [
                    [
                        {
                            'name': 'title',
                            'type': 'text',
                            'position': {'x': 20, 'y': 20},
                            'width': 170,
                            'height': 10,
                            'fontSize': 18
                        },
                        {
                            'name': 'date',
                            'type': 'text',
                            'position': {'x': 20, 'y': 35},
                            'width': 80,
                            'height': 7
                        },
                        {
                            'name': 'objectName',
                            'type': 'text',
                            'position': {'x': 20, 'y': 45},
                            'width': 170,
                            'height': 7
                        },
                        {
                            'name': 'workDescription',
                            'type': 'text',
                            'position': {'x': 20, 'y': 70},
                            'width': 170,
                            'height': 50
                        },
                        {
                            'name': 'workCost',
                            'type': 'text',
                            'position': {'x': 20, 'y': 125},
                            'width': 80,
                            'height': 7
                        }
                    ]
                ]
            }
        }
    ]
    
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    
    cur.execute('''
        SELECT id FROM t_p8942561_contractor_control_s.users WHERE id = %s
    ''', (user_id,))
    
    user_exists = cur.fetchone()
    if not user_exists:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'User not found'})
        }
    
    created_templates = []
    
    for template in default_templates:
        cur.execute('''
            SELECT id FROM t_p8942561_contractor_control_s.document_templates 
            WHERE client_id = %s AND name = %s AND is_system = true
        ''', (user_id, template['name']))
        
        existing = cur.fetchone()
        
        if not existing:
            cur.execute('''
                INSERT INTO t_p8942561_contractor_control_s.document_templates 
                (client_id, name, description, template_type, content, is_system, version, is_active)
                VALUES (%s, %s, %s, %s, %s, %s, 1, true)
                RETURNING id, name, description, template_type, created_at
            ''', (
                user_id,
                template['name'],
                template['description'],
                template['template_type'],
                json.dumps(template['content']),
                template['is_system']
            ))
            
            result = cur.fetchone()
            created_templates.append({
                'id': result[0],
                'name': result[1],
                'description': result[2],
                'template_type': result[3],
                'created_at': result[4].isoformat()
            })
    
    conn.commit()
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'created_count': len(created_templates),
            'templates': created_templates
        })
    }