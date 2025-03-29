from core.int_report_generator import InterviewReportGenerator
import google.generativeai as genai
import os
import json
import re

class InterviewAgent:
    def __init__(self, ai_model=None):
        # Initialize Gemini API with proper configuration
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not found")
        
        genai.configure(api_key=api_key)
        try:
            # Use the correct model name - gemini-2.0-flash
            model_name = "gemini-2.0-flash"
            print(f"Using model: {model_name}")
            self.model = genai.GenerativeModel(model_name)
            test_response = self.model.generate_content("Test")
            print("Gemini API connected successfully!")
        except Exception as e:
            print(f"Error initializing Gemini: {e}")
            self.model = None
        
        self.report_generator = InterviewReportGenerator()
        self.job_profile = None
        self.skills = None
        self.experience = None
        self.difficulty = None
        self.responses = []
    
    def collect_candidate_info(self):
        """Collect candidate's professional details"""
        print("\n=== Candidate Information ===")
        
        self.job_profile = input("What job profile are you interested in? ").strip()
        self.skills = [skill.strip() for skill in input("List your key skills (comma-separated): ").strip().split(',')]
        self.experience = input("Years of experience: ").strip()
        
        return {
            "job_profile": self.job_profile,
            "skills": self.skills,
            "experience": self.experience
        }
    
    def select_difficulty_level(self):
        """Select interview difficulty"""
        print("\nInterview Difficulty Levels:")
        print("1. Entry Level")
        print("2. Mid Level")
        print("3. Senior Level")
        
        while True:
            try:
                choice = int(input("Select difficulty level (1/2/3): "))
                self.difficulty = ["Entry", "Mid", "Senior"][choice - 1]
                return self.difficulty
            except (ValueError, IndexError):
                print("Invalid input. Please enter 1, 2, or 3.")

    def generate_interview_questions(self, candidate_info, difficulty):
        """Generate interview questions using Gemini API"""
        self.job_profile = candidate_info['job_profile']
        self.skills = candidate_info['skills']
        self.experience = candidate_info['experience']
        self.difficulty = difficulty

        # Adjust number of questions based on difficulty level
        question_count = 5
        if difficulty == "Mid":
            question_count = 6
        elif difficulty == "Senior":
            question_count = 8

        # Modified prompt to be more explicit about the JSON format
        prompt = f"""
        Create exactly {question_count} interview questions for a {self.job_profile} position.
        Skills required: {', '.join(self.skills)}
        Experience: {self.experience} years
        Level: {self.difficulty}

        Questions should:
        1. Test technical knowledge about {self.job_profile}
        2. Include scenario-based questions relevant to the field
        3. Progress from basic to complex
        4. Match the {self.difficulty} level experience

        Return ONLY a valid JSON array with exactly this format - no additional text or explanation:
        [
            {{"text": "First question here", "difficulty": "{self.difficulty}", "skills": ["relevant skill1", "relevant skill2"]}},
            {{"text": "Second question here", "difficulty": "{self.difficulty}", "skills": ["relevant skill1", "relevant skill3"]}}
        ]
        
        The output MUST be valid JSON that can be parsed with json.loads().
        """
        
        if not self.model:
            return self._generate_fallback_questions(self.job_profile, self.difficulty)

        try:
            response = self.model.generate_content(prompt)
            print("Generating questions...")
            
            # Get the raw response text
            raw_response = response.text
            print("DEBUG - Raw API response:")
            print(raw_response[:200] + "..." if len(raw_response) > 200 else raw_response)
            
            # Clean the response to extract valid JSON
            # Extract JSON array from response using regex
            json_match = re.search(r'\[\s*{.*}\s*\]', raw_response, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                try:
                    questions = json.loads(json_str)
                    print(f"Successfully parsed {len(questions)} questions!")
                except json.JSONDecodeError as e:
                    print(f"JSON parse error: {e}")
                    return self._generate_fallback_questions(self.job_profile, self.difficulty)
            else:
                # Alternative approach: try finding all objects and building array
                print("Trying alternative parsing method...")
                try:
                    # Clean up common formatting issues
                    cleaned = re.sub(r'```json\s*|\s*```', '', raw_response)  # Remove markdown code blocks
                    cleaned = re.sub(r'^\s*\[\s*|\s*\]\s*$', '', cleaned)  # Remove outer brackets
                    objects = re.findall(r'{[^{}]*}', cleaned)
                    
                    if objects:
                        # Reconstruct JSON array
                        json_str = "[" + ",".join(objects) + "]"
                        questions = json.loads(json_str)
                        print(f"Alternative parsing successful! Found {len(questions)} questions.")
                    else:
                        raise ValueError("No JSON objects found")
                except Exception as e:
                    print(f"Alternative parsing failed: {e}")
                    return self._generate_fallback_questions(self.job_profile, self.difficulty)
            
            # Process the questions
            formatted_questions = []
            for q in questions[:question_count]:
                formatted_questions.append({
                    'text': q['text'],
                    'difficulty': self.difficulty,
                    'skills': q.get('skills', [])
                })
            
            return formatted_questions
            
        except Exception as e:
            print(f"Error generating questions: {e}")
            return self._generate_fallback_questions(self.job_profile, self.difficulty)

    def _generate_fallback_questions(self, job_profile, difficulty):
        """Generate basic questions if Gemini API fails"""
        print("Using fallback questions")
        
        # More specific fallback questions for reel maker/video editing
        if "reel" in job_profile.lower() or "video" in job_profile.lower() or "edit" in job_profile.lower():
            questions = [
                {
                    'text': f"Tell me about your experience creating reels or short videos?",
                    'difficulty': difficulty,
                    'skills': [job_profile, "video editing"]
                },
                {
                    'text': "What video editing software are you most comfortable with and why?",
                    'difficulty': difficulty,
                    'skills': ["video editing", "technical knowledge"]
                },
                {
                    'text': "How do you approach creating engaging content for social media platforms?",
                    'difficulty': difficulty,
                    'skills': ["content creation", "social media"]
                },
                {
                    'text': "Describe your process for planning, shooting, and editing a short reel.",
                    'difficulty': difficulty,
                    'skills': ["planning", "shooting", "editing"]
                },
                {
                    'text': "How do you ensure your video content captures the audience's attention in the first few seconds?",
                    'difficulty': difficulty,
                    'skills': ["audience engagement", "creative direction"]
                }
            ]
            return questions
        
        # Generic fallback questions
        questions = [
            {
                'text': f"Tell me about your experience as a {job_profile}?",
                'difficulty': difficulty,
                'skills': [job_profile]
            },
            {
                'text': f"What are the main challenges you've faced in your {job_profile} role?",
                'difficulty': difficulty,
                'skills': [job_profile]
            },
            {
                'text': "Describe a difficult situation you handled successfully.",
                'difficulty': difficulty,
                'skills': ['problem-solving']
            },
            {
                'text': f"What technical skills do you think are most important for a {job_profile}?",
                'difficulty': difficulty,
                'skills': ['technical knowledge']
            },
            {
                'text': "Tell me about a project you're proud of and your role in it.",
                'difficulty': difficulty,
                'skills': ['project management', 'communication']
            }
        ]
        
        return questions

    def conduct_interview(self, candidate_info, difficulty, questions):
        """Conduct interview and collect responses"""
        interview_history = []
        
        print(f"\n=== {difficulty} Level Interview for {candidate_info['job_profile']} ===")
        
        for i, question in enumerate(questions, 1):
            print(f"\nQuestion {i}: {question['text']}")
            response = input("Your Answer: ").strip()
            
            interview_history.append({
                "question": question['text'],
                "response": response,
                "expected_skills": question.get('skills', [])
            })
            self.responses.append({"question": question['text'], "answer": response})
        
        # Generate interview report with AI analysis
        report = self.analyze_and_generate_report(candidate_info, difficulty, interview_history)
        return report

    def analyze_and_generate_report(self, candidate_info, difficulty, interview_history):
        """Analyze responses using Gemini and generate report"""
        analysis_prompt = f"""
        Analyze these interview responses for a {self.job_profile} position:
        
        Candidate Profile:
        - Skills: {', '.join(self.skills)}
        - Experience: {self.experience} years
        - Difficulty Level: {self.difficulty}
        
        Q&A:
        {chr(10).join([f"Q: {q['question']}{chr(10)}A: {q['response']}" for q in interview_history])}
        
        Provide analysis covering:
        1. Technical knowledge depth
        2. Problem-solving approach
        3. Communication clarity
        4. Skill validation
        5. Improvement suggestions
        6. Overall suitability
        
        Format in clear sections with bullet points.
        """
        
        try:
            analysis = self.model.generate_content(analysis_prompt)
            ai_analysis = analysis.text
        except Exception as e:
            print(f"Error generating analysis: {e}")
            ai_analysis = "Could not generate analysis due to technical error"

        return self.report_generator.generate_interview_report(
            candidate_info,
            difficulty,
            interview_history,
            ai_analysis
        )

    def run_interview(self):
        """Execute complete interview flow with responses"""
        print("\n=== Starting Interview ===")
        
        # Collect candidate information
        candidate_info = self.collect_candidate_info()
        
        # Select difficulty level
        difficulty = self.select_difficulty_level()
        
        # Generate questions using Gemini
        questions = self.generate_interview_questions(candidate_info, difficulty)
        
        # Conduct the full interview with responses
        report = self.conduct_interview(candidate_info, difficulty, questions)
        
        # Display report
        print("\n=== Interview Report ===")
        print(report)
        
        return report