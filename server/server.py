from flask import Flask, request, jsonify
from flask_cors import CORS
from nakdan_test import check_web_scraping_method  # שימוש בפונקציה מהקובץ שלך

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension

@app.route('/nikud', methods=['POST'])
def get_nikud():
    try:
        data = request.get_json()
        word = data.get('word')
        
        if not word:
            return jsonify({'error': 'לא נבחרה מילה'}), 400
            
        # קריאה לפונקציה שלך
        options = check_web_scraping_method(word)
        
        if not options:
            return jsonify({'error': 'לא נמצאו אפשרויות ניקוד'}), 404
            
        return jsonify({'options': options})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000) 