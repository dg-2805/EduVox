from flask import Flask, request, jsonify
from core.debate_module import DebateAgent
from core.interview_module import InterviewAgent
from core.ai_model import AIModel
# from core.resume_analyser import ResumeAnalyser  # Assuming this is the resume analyzer module
import os
import tempfile

app = Flask(__name__)

# Initialize the AI model
ai_model = AIModel()

# Route for Text Debate
@app.route('/text-debate', methods=['POST'])
def text_debate():
    try:
        data = request.json
        topic = data.get('topic')
        stance = data.get('stance')

        if not topic or not stance:
            return jsonify({"error": "Topic and stance are required"}), 400

        debate_agent = DebateAgent(ai_model)
        report = debate_agent.conduct_debate(topic, stance)
        return jsonify({"report": report}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for Voice Debate
@app.route('/voice-debate', methods=['POST'])
def voice_debate():
    try:
        data = request.json
        topic = data.get('topic')

        if not topic:
            return jsonify({"error": "Topic is required"}), 400

        debate_agent = DebateAgent(ai_model, voice_mode=True)
        report = debate_agent.conduct_voice_debate(topic)
        return jsonify({"report": report}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for Interview
@app.route('/interview', methods=['POST'])
def interview():
    try:
        # Check if a file is included in the request
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']

        # Check if the file has a valid name
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Save the file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            file_path = temp_file.name
            file.save(file_path)

        try:
            # Parse the JSON data from the request
            data = request.form.get('data')
            if not data:
                return jsonify({"error": "Data is required"}), 400

            data = request.get_json()  # Parse JSON data
            job_profile = data.get('job_profile')
            difficulty = data.get('difficulty')

            if not job_profile or not difficulty:
                return jsonify({"error": "Job profile and difficulty level are required"}), 400

            # Conduct the interview
            interview_agent = InterviewAgent(ai_model)
            report = interview_agent.run_interview(data, file_path)

            return jsonify({"report": report}), 200
        finally:
            # Delete the temporary file
            if os.path.exists(file_path):
                os.remove(file_path)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Default route
@app.route('/')
def home():
    return jsonify({"message": "Welcome to the AI Agent API!"}), 200

if __name__ == "__main__":
    app.run(debug=True)