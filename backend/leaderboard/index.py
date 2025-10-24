import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage game leaderboard - save and retrieve top scores
    Args: event - dict with httpMethod, body, queryStringParameters
          context - object with attributes: request_id, function_name
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    
    if method == 'GET':
        params = event.get('queryStringParameters', {})
        game_name = params.get('game', 'snake')
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT player_name, score, created_at FROM leaderboard WHERE game_name = %s ORDER BY score DESC LIMIT 10",
                (game_name,)
            )
            results = cur.fetchall()
        
        conn.close()
        
        leaderboard = []
        for row in results:
            leaderboard.append({
                'player_name': row['player_name'],
                'score': row['score'],
                'created_at': row['created_at'].isoformat() if row['created_at'] else None
            })
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'game': game_name, 'leaderboard': leaderboard}),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        player_name = body_data.get('player_name', 'Anonymous')
        game_name = body_data.get('game_name', 'snake')
        score = body_data.get('score', 0)
        
        if len(player_name) > 50:
            player_name = player_name[:50]
        
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO leaderboard (player_name, game_name, score) VALUES (%s, %s, %s)",
                (player_name, game_name, score)
            )
            conn.commit()
        
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'message': 'Score saved',
                'data': {
                    'player_name': player_name,
                    'game_name': game_name,
                    'score': score
                }
            }),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
