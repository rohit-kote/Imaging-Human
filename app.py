from flask import Flask, request, jsonify, send_from_directory
import sqlite3

app = Flask(__name__, static_folder='static')

def get_db_connection():
    conn = sqlite3.connect('content.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<mood>')
def mood_page(mood):
    # This function serves different HTML pages based on the mood
    return send_from_directory(app.static_folder, f'{mood}.html')

@app.route('/vote', methods=['POST'])
def vote():
    content_id = request.json['contentID']
    vote_type = request.json['voteType']  # 'upvotes' or 'downvotes'
    mood = request.json.get('mood', 'unknown')  # Optional mood parameter
    content_type = request.json.get('contentType', 'unknown')  # Optional content type parameter
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM content WHERE id = ?', (content_id,))
        content = cursor.fetchone()

        if content:
            new_votes = content[vote_type] + 1
            cursor.execute(f'UPDATE content SET {vote_type} = ? WHERE id = ?', (new_votes, content_id))
            conn.commit()
        else:
            # Insert new content if not found
            cursor.execute('INSERT INTO content (id, upvotes, downvotes, mood, content_type) VALUES (?, ?, ?, ?, ?)',
                           (content_id, 1 if vote_type == 'upvotes' else 0, 1 if vote_type == 'downvotes' else 0, mood, content_type))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        conn.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/get_votes', methods=['GET'])
def get_votes():
    conn = get_db_connection()
    try:
        vote_counts = conn.execute('SELECT id, upvotes, downvotes FROM content').fetchall()
        votes = {str(item['id']): {'upvotes': item['upvotes'], 'downvotes': item['downvotes']} for item in vote_counts}
        return jsonify(votes)
    finally:
        conn.close()

if __name__ == '__main__':
    app.run(debug=True)
