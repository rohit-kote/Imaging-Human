import sqlite3

# Connect to SQLite database, or create it if it doesn't exist
connection = sqlite3.connect('content.db')

# Create a cursor object using the connection
cursor = connection.cursor()

# SQL statement to create a table for content voting
cursor.execute('''
    CREATE TABLE IF NOT EXISTS content (
        id TEXT PRIMARY KEY,
        upvotes INTEGER NOT NULL DEFAULT 0,
        downvotes INTEGER NOT NULL DEFAULT 0,
        mood TEXT DEFAULT NULL,
        content_type TEXT DEFAULT NULL
    )
''')

# Optionally, add indices to improve query performance on mood and content_type if they are used in queries
cursor.execute('CREATE INDEX IF NOT EXISTS idx_mood ON content (mood)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_content_type ON content (content_type)')

# Commit the changes and close the connection
connection.commit()
connection.close()
