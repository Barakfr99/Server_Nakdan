from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from nakdan_test import check_web_scraping_method

app = Flask(__name__)
CORS(app)

@app.route('/nikud', methods=['POST', 'OPTIONS'])
def get_nikud():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        data = request.get_json()
        word = data.get('word')
        
        if not word:
            return jsonify({'error': 'לא הוזנה מילה'}), 400
            
        options = check_web_scraping_method(word)
        return jsonify({'options': options})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port) 