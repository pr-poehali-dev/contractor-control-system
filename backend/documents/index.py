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
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
        'Content-Type': 'application/json; charset=utf-8'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {**cors_headers, 'Access-Control-Max-Age': '86400'},
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'DATABASE_URL not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    schema = 't_p8942561_contractor_control_s'
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {}) or {}
            doc_id = query_params.get('id')
            
            if doc_id:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    query = f"""
                        SELECT d.id, d.work_id, d.template_id, d.document_number, d.document_type, 
                               d.title, d.content, d.status, d.created_by, d.created_at, d.updated_at,
                               w.title as work_title, w.object_id,
                               o.title as object_title,
                               u.name as created_by_name
                        FROM {schema}.documents d
                        LEFT JOIN {schema}.works w ON d.work_id = w.id
                        LEFT JOIN {schema}.objects o ON w.object_id = o.id
                        LEFT JOIN {schema}.users u ON d.created_by = u.id
                        WHERE d.id = {int(doc_id)}
                    """
                    cur.execute(query)
                    doc = cur.fetchone()
                    
                    if not doc:
                        return {
                            'statusCode': 404,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Document not found'}),
                            'isBase64Encoded': False
                        }
                    
                    template_name = ''
                    if doc['template_id']:
                        cur.execute(f"SELECT name FROM {schema}.document_templates WHERE id = {doc['template_id']}")
                        template = cur.fetchone()
                        if template:
                            template_name = template['name']
                    
                    # Найти inspection_id если это акт о дефектах
                    inspection_id = None
                    inspection_number = None
                    if template_name and 'дефект' in template_name.lower():
                        cur.execute(f"""
                            SELECT id, inspection_number 
                            FROM {schema}.inspections 
                            WHERE defect_report_document_id = {int(doc_id)}
                            LIMIT 1
                        """)
                        inspection = cur.fetchone()
                        if inspection:
                            inspection_id = inspection['id']
                            inspection_number = inspection['inspection_number']
                    
                    # Разделяем content на contentData (без html) и htmlContent
                    content = doc['content'] or {}
                    html_content = content.get('html', '')
                    content_data = {k: v for k, v in content.items() if k != 'html'}
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'isBase64Encoded': False,
                        'body': json.dumps({
                            'id': doc['id'],
                            'title': doc['title'],
                            'work_id': doc['work_id'],
                            'work_title': doc['work_title'],
                            'object_id': doc['object_id'],
                            'object_title': doc['object_title'],
                            'created_by_name': doc['created_by_name'],
                            'inspection_id': inspection_id,
                            'inspection_number': inspection_number,
                            'templateId': doc['template_id'],
                            'templateName': template_name,
                            'status': doc['status'],
                            'contentData': content_data,
                            'htmlContent': html_content,
                            'createdAt': doc['created_at'].isoformat() if doc['created_at'] else None,
                            'updatedAt': doc['updated_at'].isoformat() if doc['updated_at'] else None
                        }, ensure_ascii=False)
                    }
            else:
                params = event.get('queryStringParameters', {}) or {}
                status_filter = params.get('status')
                
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    if status_filter:
                        query = f"""SELECT d.id, d.work_id, d.template_id, d.document_number, d.document_type,
                                   d.title, d.content, d.status, d.created_by, d.created_at, d.updated_at,
                                   dt.name as template_name
                                   FROM {schema}.documents d
                                   LEFT JOIN {schema}.document_templates dt ON d.template_id = dt.id
                                   WHERE d.status = '{status_filter}' 
                                   ORDER BY d.created_at DESC"""
                    else:
                        query = f"""SELECT d.id, d.work_id, d.template_id, d.document_number, d.document_type,
                                   d.title, d.content, d.status, d.created_by, d.created_at, d.updated_at,
                                   dt.name as template_name
                                   FROM {schema}.documents d
                                   LEFT JOIN {schema}.document_templates dt ON d.template_id = dt.id
                                   ORDER BY d.created_at DESC"""
                    cur.execute(query)
                    
                    docs = cur.fetchall()
                    
                    # Подготовка списка документов без html в contentData
                    documents_list = []
                    for doc in docs:
                        content = doc['content'] or {}
                        content_data = {k: v for k, v in content.items() if k != 'html'}
                        
                        documents_list.append({
                            'id': doc['id'],
                            'title': doc['title'],
                            'templateId': doc['template_id'],
                            'templateName': doc.get('template_name', ''),
                            'status': doc['status'],
                            'contentData': content_data,
                            'createdAt': doc['created_at'].isoformat() if doc['created_at'] else None,
                            'updatedAt': doc['updated_at'].isoformat() if doc['updated_at'] else None
                        })
                    
                    return {
                        'statusCode': 200,
                        'headers': cors_headers,
                        'isBase64Encoded': False,
                        'body': json.dumps({'documents': documents_list}, ensure_ascii=False)
                    }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            title = body_data.get('title', 'Новый документ')
            template_id = body_data.get('templateId')
            work_id = body_data.get('work_id')
            content_data = body_data.get('contentData', {})
            html_content = body_data.get('htmlContent', '')
            status = body_data.get('status', 'draft')
            
            if not template_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'templateId is required'}),
                    'isBase64Encoded': False
                }
            
            if not work_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'work_id is required'}),
                    'isBase64Encoded': False
                }
            
            content_obj = content_data.copy()
            content_obj['html'] = html_content
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                # Получаем created_by из заголовков или используем владельца работы
                headers = event.get('headers', {})
                user_id = headers.get('X-User-Id') or headers.get('x-user-id')
                
                if not user_id:
                    # Fallback: получаем владельца работы
                    cur.execute(f"""
                        SELECT o.client_id FROM {schema}.works w
                        JOIN {schema}.objects o ON w.object_id = o.id
                        WHERE w.id = {int(work_id)}
                    """)
                    work_owner = cur.fetchone()
                    if work_owner:
                        user_id = work_owner['client_id']
                    else:
                        return {
                            'statusCode': 400,
                            'headers': cors_headers,
                            'body': json.dumps({'error': 'Work not found'}),
                            'isBase64Encoded': False
                        }
                
                user_id = int(user_id)
                
                content_json = json.dumps(content_obj, ensure_ascii=False).replace("'", "''")
                title_escaped = title.replace("'", "''")
                
                cur.execute(f"SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM {schema}.documents")
                next_doc_num = cur.fetchone()['next_id']
                doc_number = f"DOC-{template_id}-{next_doc_num}"
                
                query = f"""INSERT INTO {schema}.documents 
                           (title, work_id, template_id, document_type, content, status, created_by, document_number)
                           VALUES ('{title_escaped}', {work_id}, {template_id}, 'custom', '{content_json}', '{status}', {user_id}, '{doc_number}')
                           RETURNING id, work_id, template_id, document_number, document_type, title, content, status, created_by, created_at, updated_at"""
                cur.execute(query)
                doc = cur.fetchone()
                conn.commit()
                
                cur.execute(f"SELECT name FROM {schema}.document_templates WHERE id = {template_id}")
                template = cur.fetchone()
                template_name = template['name'] if template else ''
                
                # Разделяем content на contentData (без html) и htmlContent
                content = doc['content'] or {}
                html_content = content.get('html', '')
                content_data = {k: v for k, v in content.items() if k != 'html'}
                
                return {
                    'statusCode': 201,
                    'headers': cors_headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'id': doc['id'],
                        'title': doc['title'],
                        'templateId': doc['template_id'],
                        'templateName': template_name,
                        'status': doc['status'],
                        'contentData': content_data,
                        'htmlContent': html_content,
                        'createdAt': doc['created_at'].isoformat() if doc['created_at'] else None,
                        'updatedAt': doc['updated_at'].isoformat() if doc['updated_at'] else None
                    }, ensure_ascii=False)
                }
        
        elif method == 'PUT':
            # Попытка получить id из pathParams или queryStringParameters
            doc_id = event.get('pathParams', {}).get('id')
            if not doc_id:
                query_params = event.get('queryStringParameters', {}) or {}
                doc_id = query_params.get('id')
            
            if not doc_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Document ID is required'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            print(f"🔍 PUT body_data: {body_data}")
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"SELECT content FROM {schema}.documents WHERE id = {int(doc_id)}")
                existing = cur.fetchone()
                if not existing:
                    return {
                        'statusCode': 404,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'Document not found'}),
                        'isBase64Encoded': False
                    }
                
                current_content = existing['content'] or {}
                
                update_fields = []
                
                if 'title' in body_data:
                    escaped_title = body_data['title'].replace("'", "''")
                    update_fields.append(f"title = '{escaped_title}'")
                
                if 'status' in body_data:
                    update_fields.append(f"status = '{body_data['status']}'")
                
                if 'contentData' in body_data or 'htmlContent' in body_data:
                    # Обновляем только переданные поля contentData
                    if 'contentData' in body_data:
                        # Мерджим с текущими данными (не перезаписываем весь объект)
                        for key, value in body_data['contentData'].items():
                            if key != 'html':  # html обновляется отдельно через htmlContent
                                current_content[key] = value
                    
                    # Обновляем html только если он явно передан
                    if 'htmlContent' in body_data:
                        current_content['html'] = body_data['htmlContent']
                    
                    content_json = json.dumps(current_content, ensure_ascii=False).replace("'", "''")
                    update_fields.append(f"content = '{content_json}'")
                
                update_fields.append('updated_at = CURRENT_TIMESTAMP')
                
                if len(update_fields) <= 1:
                    return {
                        'statusCode': 400,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'No fields to update'}),
                        'isBase64Encoded': False
                    }
                
                update_query = f"""UPDATE {schema}.documents 
                                  SET {', '.join(update_fields)} 
                                  WHERE id = {int(doc_id)} 
                                  RETURNING id, work_id, template_id, document_number, document_type, 
                                           title, content, status, created_by, created_at, updated_at"""
                cur.execute(update_query)
                doc = cur.fetchone()
                conn.commit()
                
                template_name = ''
                if doc['template_id']:
                    cur.execute(f"SELECT name FROM {schema}.document_templates WHERE id = {doc['template_id']}")
                    template = cur.fetchone()
                    if template:
                        template_name = template['name']
                
                # Разделяем content на contentData (без html) и htmlContent
                content = doc['content'] or {}
                html_content = content.get('html', '')
                content_data = {k: v for k, v in content.items() if k != 'html'}
                
                return {
                    'statusCode': 200,
                    'headers': cors_headers,
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'id': doc['id'],
                        'title': doc['title'],
                        'templateId': doc['template_id'],
                        'templateName': template_name,
                        'status': doc['status'],
                        'contentData': content_data,
                        'htmlContent': html_content,
                        'createdAt': doc['created_at'].isoformat() if doc['created_at'] else None,
                        'updatedAt': doc['updated_at'].isoformat() if doc['updated_at'] else None
                    }, ensure_ascii=False)
                }
        
        elif method == 'DELETE':
            # Попытка получить id из pathParams или queryStringParameters
            doc_id = event.get('pathParams', {}).get('id')
            if not doc_id:
                query_params = event.get('queryStringParameters', {}) or {}
                doc_id = query_params.get('id')
            
            if not doc_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Document ID is required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                query = f"DELETE FROM {schema}.documents WHERE id = {int(doc_id)}"
                cur.execute(query)
                conn.commit()
                
                return {
                    'statusCode': 204,
                    'headers': {'Access-Control-Allow-Origin': '*'},
                    'body': '',
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': cors_headers,
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        conn.close()