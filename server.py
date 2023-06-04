from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS, cross_origin
import pymysql
import openai
import re
import os
import mysql.connector

app = Flask(__name__, static_folder='frontend/build', static_url_path='/')

# Enable CORS for all origins and allow credentials
CORS(app, resources={r"/*": {"origins": "*", "supports_credentials": True}})

app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

@app.after_request
def add_header(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response


# Connect to the database
connection = pymysql.connect(
    host="hostname",
    user="username",
    password="",
    database="database-name",
    ssl={'ca': 'DigiCertGlobalRootCA.crt.pem'}
)

# Create a cursor object
cursor = connection.cursor()

# Set up your OpenAI API key
openai.api_key = "key"

# Retrieve the most recently inserted 10 items
def get_recent_items():
    select_query = '''
    SELECT item FROM Search
    ORDER BY id DESC
    LIMIT 10
    '''
    cursor.execute(select_query)
    results = cursor.fetchall()

    # Store the items in a Python list
    items = [result[0] for result in results]

    return items

# Generate a suggestion using the OpenAI API
def generate_suggestion(items):
    prompt = "Given my recent search history in order, suggest another item for me to buy.\n\nRecent items:\n"
    items = items[::-1]
    for item in items:
        prompt += f"- {item}\n"

    prompt += "\nPlease suggest the next item:"

    response = openai.Completion.create(
        model='text-davinci-003',
        prompt=prompt,
        max_tokens=50,
        n=1,
        stop=None,
        temperature=0.5,
        top_p=1.0
    )

    suggestion = response.choices[0].text.strip()
    suggestion = re.sub(r'[^\w\s]', '', suggestion)
    suggestion = suggestion.lower()
    return suggestion

@app.route('/items', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_items():
    items = get_recent_items()
    return jsonify({"items": items})

@app.route('/insert', methods=['POST'])
@cross_origin(supports_credentials=True)
def insert_item():
    item = request.json.get('item')

    if item:
        # Insert data into the table
        insert_query = '''
        INSERT INTO Search (item)
        VALUES (%s)
        '''

        values = (item,)
        cursor.execute(insert_query, values)
        connection.commit()

        return jsonify({"message": "Item inserted successfully."})
    else:
        return jsonify({"error": "Invalid item."}), 400

@app.route('/suggestions', methods=['GET'])
@cross_origin(supports_credentials=True)
def get_suggestion():
    items = get_recent_items()
    suggestion = generate_suggestion(items)
    suggestion = re.sub(r'[^\w\s]', '', suggestion)
    suggestion = suggestion.lower()
    return jsonify({"suggestion": suggestion})

@app.route('/delete', methods=['POST'])
@cross_origin(supports_credentials=True)
def delete_item():
    item = request.json.get('item')

    if item:
        # Delete the item from the table
        delete_query = '''
        DELETE FROM Search
        WHERE item = %s
        '''
        values = (item,)
        cursor.execute(delete_query, values)
        connection.commit()

        return jsonify({"message": "Item deleted successfully."})
    else:
        return jsonify({"error": "Invalid item."}), 400

@app.route('/update', methods=['POST'])
@cross_origin(supports_credentials=True)
def update_item():
    item = request.json.get('item')
    updated_text = request.json.get('updatedText')

    if item and updated_text:
        # Update the item in the table
        update_query = '''
        UPDATE Search
        SET item = %s
        WHERE item = %s
        '''
        values = (updated_text, item)
        cursor.execute(update_query, values)
        connection.commit()

        return jsonify({"message": "Item updated successfully."})
    else:
        return jsonify({"error": "Invalid item or updated text."}), 400

# Serve React static files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
@cross_origin(supports_credentials=True)
def serve_react_app(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True)


