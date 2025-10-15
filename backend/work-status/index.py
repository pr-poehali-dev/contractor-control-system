"""
Business: Расчет статуса работ и уведомление о начале
Args: event с httpMethod, body (work_id, action: 'get_status' | 'notify_start')
Returns: HTTP response с обновленным статусом и количеством дней отставания
"""

import json
from datetime import datetime, date, timedelta
from typing import Dict, Any, Optional


def calculate_work_status(
    planned_start: Optional[str],
    planned_end: Optional[str],
    actual_start: Optional[str],
    completion_percentage: int,
    work_started_notification_sent: bool
) -> Dict[str, Any]:
    """
    Рассчитывает текущий статус работы на основе дат и процента выполнения
    
    Статусы:
    - planned: работа еще не началась (до даты начала)
    - awaiting_start: дата начала наступила, ожидается уведомление от подрядчика
    - in_progress: работы идут (после уведомления о начале)
    - awaiting_acceptance: 100% выполнение, ожидается приемка
    - completed: работы приняты заказчиком
    - delayed: просрочка (дата окончания прошла, работы не завершены)
    """
    
    today = date.today()
    
    # Если нет плановой даты начала - статус planned
    if not planned_start:
        return {
            'status': 'planned',
            'days_delayed': 0,
            'message': 'Плановая дата начала не указана'
        }
    
    start_date = datetime.fromisoformat(planned_start.replace('Z', '+00:00')).date()
    end_date = datetime.fromisoformat(planned_end.replace('Z', '+00:00')).date() if planned_end else None
    
    # Если работа еще не началась по плану
    if today < start_date:
        return {
            'status': 'planned',
            'days_delayed': 0,
            'message': f'Начало запланировано на {start_date.strftime("%d.%m.%Y")}'
        }
    
    # Дата начала наступила, но подрядчик не уведомил
    if not work_started_notification_sent and not actual_start:
        days_delayed = (today - start_date).days
        return {
            'status': 'awaiting_start',
            'days_delayed': days_delayed,
            'message': f'Требуется подтверждение начала работ' + 
                      (f' (отставание {days_delayed} дн.)' if days_delayed > 0 else '')
        }
    
    # Работы завершены на 100% - ожидается приемка
    if completion_percentage >= 100:
        if end_date and today > end_date:
            days_delayed = (today - end_date).days
            return {
                'status': 'awaiting_acceptance',
                'days_delayed': days_delayed,
                'message': f'Готово к приемке (задержка {days_delayed} дн.)'
            }
        return {
            'status': 'awaiting_acceptance',
            'days_delayed': 0,
            'message': 'Готово к приемке'
        }
    
    # Работы в процессе, но просрочены
    if end_date and today > end_date:
        days_delayed = (today - end_date).days
        return {
            'status': 'delayed',
            'days_delayed': days_delayed,
            'message': f'С задержкой ({days_delayed} дн.)'
        }
    
    # Работы идут по плану
    return {
        'status': 'in_progress',
        'days_delayed': 0,
        'message': f'В процессе ({completion_percentage}%)'
    }


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    # CORS preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'POST':
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        if action == 'get_status':
            # Получить статус работы
            result = calculate_work_status(
                planned_start=body.get('planned_start_date'),
                planned_end=body.get('planned_end_date'),
                actual_start=body.get('actual_start_date'),
                completion_percentage=body.get('completion_percentage', 0),
                work_started_notification_sent=body.get('work_started_notification_sent', False)
            )
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps(result, ensure_ascii=False)
            }
        
        elif action == 'notify_start':
            # Уведомить о начале работ
            work_id = body.get('work_id')
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'message': 'Уведомление о начале работ отправлено',
                    'actual_start_date': datetime.now().isoformat(),
                    'work_started_notification_sent': True
                }, ensure_ascii=False)
            }
    
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }
