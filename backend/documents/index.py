import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления документами (создание, чтение, обновление, список)
    Args: event - dict с httpMethod, body, queryStringParameters, pathParams
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response dict с документами
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(database_url)
    schema = 't_p8942561_contractor_control_s'
    
    try:
        if method == 'GET':
            doc_id = event.get('pathParams', {}).get('id')
            
            if doc_id:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    query = f"SELECT id, title, template_id, template_name, status, content_data, html_content, created_at, updated_at FROM {schema}.documents WHERE id = {int(doc_id)}"
                    cur.execute(query)
                    doc = cur.fetchone()
                    
                    if not doc:
                        return {
                            'statusCode': 404,
                            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                            'body': json.dumps({'error': 'Document not found'})
                        }
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'id': doc['id'],
                            'title': doc['title'],
                            'templateId': doc['template_id'],
                            'templateName': doc['template_name'],
                            'status': doc['status'],
                            'contentData': doc['content_data'],
                            'htmlContent': doc['html_content'],
                            'createdAt': doc['created_at'].isoformat() if doc['created_at'] else None,
                            'updatedAt': doc['updated_at'].isoformat() if doc['updated_at'] else None
                        }, ensure_ascii=False)
                    }
            else:
                params = event.get('queryStringParameters', {}) or {}
                status_filter = params.get('status')
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    if status_filter:
                        query = f"SELECT id, title, template_id, template_name, status, content_data, created_at, updated_at FROM {schema}.documents WHERE status = '{status_filter}' ORDER BY created_at DESC"
                    else:
                        query = f"SELECT id, title, template_id, template_name, status, content_data, created_at, updated_at FROM {schema}.documents ORDER BY created_at DESC"
                    cur.execute(query)
                    
                    docs = cur.fetchall()
                    
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'documents': [{
                                'id': doc['id'],
                                'title': doc['title'],
                                'templateId': doc['template_id'],
                                'templateName': doc['template_name'],
                                'status': doc['status'],
                                'contentData': doc['content_data'],
                                'createdAt': doc['created_at'].isoformat() if doc['created_at'] else None,
                                'updatedAt': doc['updated_at'].isoformat() if doc['updated_at'] else None
                            } for doc in docs]
                        }, ensure_ascii=False)
                    }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title', 'Новый документ')
            template_id = body_data.get('templateId')
            template_name = body_data.get('templateName', '')
            content_data = body_data.get('contentData', {})
            html_content = body_data.get('htmlContent')
            status = body_data.get('status', 'draft')
            
            if not template_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'templateId is required'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                content_json = json.dumps(content_data, ensure_ascii=False).replace("'", "''")
                html_escaped = (html_content or '').replace("'", "''")
                title_escaped = title.replace("'", "''")
                template_name_escaped = template_name.replace("'", "''")
                query = f"""INSERT INTO {schema}.documents (title, template_id, template_name, status, content_data, html_content)
                       VALUES ('{title_escaped}', {template_id}, '{template_name_escaped}', '{status}', '{content_json}', '{html_escaped}')
                       RETURNING id, title, template_id, template_name, status, content_data, html_content, created_at, updated_at"""
                cur.execute(query)
                doc = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'id': doc['id'],
                        'title': doc['title'],
                        'templateId': doc['template_id'],
                        'templateName': doc['template_name'],
                        'status': doc['status'],
                        'contentData': doc['content_data'],
                        'htmlContent': doc['html_content'],
                        'createdAt': doc['created_at'].isoformat() if doc['created_at'] else None,
                        'updatedAt': doc['updated_at'].isoformat() if doc['updated_at'] else None
                    }, ensure_ascii=False)
                }
        
        elif method == 'PUT':
            doc_id = event.get('pathParams', {}).get('id')
            if not doc_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Document ID is required'})
                }
            
            body_data = json.loads(event.get('body', '{}'))
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                update_fields = []
                
                if 'title' in body_data:
                    escaped_title = body_data['title'].replace("'", "''")
                    update_fields.append(f"title = '{escaped_title}'")
                
                if 'status' in body_data:
                    update_fields.append(f"status = '{body_data['status']}'")
                
                if 'contentData' in body_data:
                    content_json = json.dumps(body_data['contentData'], ensure_ascii=False).replace("'", "''")
                    update_fields.append(f"content_data = '{content_json}'")
                
                if 'htmlContent' in body_data:
                    html_escaped = body_data['htmlContent'].replace("'", "''")
                    update_fields.append(f"html_content = '{html_escaped}'")
                
                update_fields.append('updated_at = CURRENT_TIMESTAMP')
                
                if len(update_fields) <= 1:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'No fields to update'})
                    }
                
                update_query = f"UPDATE {schema}.documents SET {', '.join(update_fields)} WHERE id = {int(doc_id)} RETURNING id, title, template_id, template_name, status, content_data, html_content, created_at, updated_at"
                cur.execute(update_query)
                doc = cur.fetchone()
                conn.commit()
                
                if not doc:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Document not found'})
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'id': doc['id'],
                        'title': doc['title'],
                        'templateId': doc['template_id'],
                        'templateName': doc['template_name'],
                        'status': doc['status'],
                        'contentData': doc['content_data'],
                        'htmlContent': doc['html_content'],
                        'createdAt': doc['created_at'].isoformat() if doc['created_at'] else None,
                        'updatedAt': doc['updated_at'].isoformat() if doc['updated_at'] else None
                    }, ensure_ascii=False)
                }
        
        elif method == 'DELETE':
            doc_id = event.get('pathParams', {}).get('id')
            if not doc_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Document ID is required'})
                }
            
            with conn.cursor() as cur:
                query = f"DELETE FROM {schema}.documents WHERE id = {int(doc_id)}"
                cur.execute(query)
                conn.commit()
                
                return {
                    'statusCode': 204,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': ''
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()
