#interview_module.py
from core.int_report_generator import InterviewReportGenerator
import google.generativeai as genai
import os
import json
import re
import sys
from pdf2image import convert_from_path
from PIL import Image
import spacy
import easyocr
import numpy as np

# Initialize EasyOCR reader for English (set gpu=True if you have a GPU)
reader = easyocr.Reader(['en'], gpu=False)

# ----------------- Resume Analysis Functions -----------------

def extract_text_from_pdf(pdf_path):
    """
    Converts PDF pages to images and applies OCR (using EasyOCR) to extract text.
    Requires Poppler installed and in your system PATH.
    """
    try:
        pages = convert_from_path(pdf_path)
    except Exception as e:
        print(f"Error converting PDF: {e}")
        return ""
    
    text = ""
    for i, page in enumerate(pages):
        # Convert PIL image to numpy array for EasyOCR
        page_np = np.array(page)
        page_text_list = reader.readtext(page_np, detail=0, paragraph=True)
        page_text = "\n".join(page_text_list)
        text += f"\n--- Page {i+1} ---\n" + page_text
    return text

def extract_text_from_image(image_path):
    """
    Opens an image file and extracts text via EasyOCR.
    """
    try:
        image = Image.open(image_path)
        image_np = np.array(image)
        text_list = reader.readtext(image_np, detail=0, paragraph=True)
        text = "\n".join(text_list)
        print("Extracted Text:\n", text)
        return text
    except Exception as e:
        print(f"Error processing image: {e}")
        return ""

def extract_sections(text):
    """
    Uses regex patterns to extract sections like skills, achievements, and experience.
    This version checks for all instances and combines them.
    Adjust or expand the patterns as needed to suit different resume formats.
    """
    sections = {}
    patterns = {
        'skills': r'(?:Skills|Technical Skills|Areas of Expertise|Core Competencies|Proficiencies|Abilities|skits|skis)[:\n]*(.*?)(?=\n[A-Z]|\Z)',
        'achievements': r'(?:Achievements|Accomplishments|Awards|Honors)[:\n]*(.*?)(?=\n[A-Z]|\Z)',
        'experience': r'(?:Experience|Work Experience|Professional Experience|Employment History|Work History)[:\n]*(.*?)(?=\n[A-Z]|\Z)'
    }
    
    for section, pattern in patterns.items():
        # Find all instances of the pattern
        matches = re.findall(pattern, text, re.DOTALL | re.IGNORECASE)
        if matches:
            # Clean and combine all instances
            combined = "\n".join(match.strip() for match in matches if match.strip())
            sections[section] = combined
    print("Extracted Sections:", sections)
    return sections

def perform_named_entity_recognition(text):
    """
    Uses spaCy to extract named entities from the text.
    """
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception as e:
        print("spaCy model not found. Please install 'en_core_web_sm' by running:")
        print("python -m spacy download en_core_web_sm")
        return []
    doc = nlp(text)
    entities = [(ent.text, ent.label_) for ent in doc.ents]
    return entities

# ----------------- Interview Agent -----------------

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
        self.skills = None
        self.achievements = None
        self.experience = None
        self.difficulty = None
        self.responses = []

    def analyze_resume_with_gemini(self, resume_text):
        """
        Uses Gemini API to analyze resume text and extract skills, experience, and achievements.
        """
        if not self.model:
            print("Gemini API not available. Falling back to regex extraction.")
            return None
        
        try:
            analysis_prompt = f"""
            Analyze the following resume text and extract the following information in JSON format:
            
            1. Skills: List all professional skills mentioned
            2. Experience: Extract years of experience (as a number if possible)
            3. Achievements: List all professional achievements or accomplishments
            
            Resume Text:
            {resume_text}
            
            Return ONLY a valid JSON object with exactly this format:
            {{
                "skills": ["skill1", "skill2", "skill3", ...],
                "experience": "X years",
                "achievements": ["achievement1", "achievement2", ...]
            }}
            """
            
            response = self.model.generate_content(analysis_prompt)
            print("Analyzing resume with Gemini...")
            
            # Extract JSON from response
            raw_response = response.text
            json_match = re.search(r'{.*}', raw_response, re.DOTALL)
            
            if json_match:
                json_str = json_match.group(0)
                try:
                    resume_data = json.loads(json_str)
                    print("Successfully parsed resume data with Gemini!")
                    return resume_data
                except json.JSONDecodeError as e:
                    print(f"JSON parse error: {e}")
                    return None
            else:
                print("No valid JSON found in Gemini response")
                return None
                
        except Exception as e:
            print(f"Error analyzing resume with Gemini: {e}")
            return None

    def collect_candidate_info(self, job_profile, resume_path):
        """
        Collect candidate's professional details from the resume file.
        Extracts skills, achievements, and experience from the resume file (PDF or image).
        """
        print("\n=== Collecting Candidate Information ===")
        
        resume_skills = []
        resume_experience = ""
        resume_achievements = []

        if os.path.exists(resume_path):
            ext = os.path.splitext(resume_path)[1].lower()
            
            text = ""
            if ext == '.pdf':
                print("Processing PDF resume...")
                text = extract_text_from_pdf(resume_path)
            elif ext in ['.jpg', '.jpeg', '.png', '.tiff']:
                print("Processing image resume...")
                text = extract_text_from_image(resume_path)
            else:
                print("Unsupported file format for resume extraction.")
            
            if text:
                # Use Gemini for analysis if available
                gemini_analysis = self.analyze_resume_with_gemini(text)
                
                if gemini_analysis:
                    # Extract data from Gemini analysis
                    resume_skills = gemini_analysis.get('skills', [])
                    resume_experience = gemini_analysis.get('experience', "")
                    resume_achievements = gemini_analysis.get('achievements', [])
                else:
                    # Fallback to regex-based extraction
                    sections = extract_sections(text)
                    if 'skills' in sections:
                        resume_skills = [skill.strip() for skill in re.split(r',|;|\n', sections['skills']) if skill.strip()]
                    if 'experience' in sections:
                        resume_experience = sections['experience']
                    if 'achievements' in sections:
                        resume_achievements = [
                            achievement.strip() 
                            for achievement in re.split(r'•|\*|\-|\n', sections['achievements']) 
                            if achievement.strip()
                        ]
        
        # Store the extracted information
        self.skills = resume_skills
        self.experience = resume_experience
        
        return {
            "job_profile": job_profile,
            "skills": resume_skills,
            "experience": resume_experience,
            "achievements": resume_achievements
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
        job_profile = candidate_info['job_profile']
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
        Create exactly {question_count} interview questions for a {job_profile} position.
        Skills required: {', '.join(self.skills)}
        Experience: {self.experience} years
        Level: {self.difficulty}

        Questions should:
        1. Test technical knowledge about {job_profile}
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
            return self._generate_fallback_questions(job_profile, self.difficulty)

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
                    return self._generate_fallback_questions(job_profile, self.difficulty)
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
                    return self._generate_fallback_questions(job_profile, self.difficulty)
            
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
            return self._generate_fallback_questions(job_profile, self.difficulty)

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
        # Include achievements in analysis if available
        achievements_text = ""
        if 'achievements' in candidate_info and candidate_info['achievements']:
            achievements_text = f"- Notable Achievements: {chr(10)}  " + f"{chr(10)}  ".join([
                f"• {achievement}" for achievement in candidate_info['achievements'][:3]
            ])
        
        analysis_prompt = f"""
        Analyze these interview responses for a {candidate_info['job_profile']} position:
        
        Candidate Profile:
        - Skills: {', '.join(self.skills)}
        - Experience: {self.experience} years
        - Difficulty Level: {self.difficulty}
        {achievements_text}
        
        Q&A:
        {chr(10).join([f"Q: {q['question']}{chr(10)}A: {q['response']}" for q in interview_history])}
        
        Provide analysis covering:
        -Technical knowledge depth
        -Problem-solving approach
        -Communication clarity
        -Skill validation
        -Improvement suggestions
        -Overall suitability
        
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

    def run_interview(self, data, resume_path):
        """
        Execute the complete interview process.
        Parameters:
        - data: Parsed JSON from the frontend containing job_profile and difficulty.
        - resume_path: Path to the uploaded resume file.
        """
        print("\n=== Starting Interview ===")
        
        # Extract job profile and difficulty from the data
        job_profile = data.get('job_profile')
        difficulty = data.get('difficulty')

        if not job_profile or not difficulty:
            raise ValueError("Job profile and difficulty level are required.")

        # Collect candidate information
        candidate_info = self.collect_candidate_info(job_profile, resume_path)

        # Generate questions using Gemini
        questions = self.generate_interview_questions(candidate_info, difficulty)

        # Conduct the full interview with responses
        report = self.conduct_interview(candidate_info, difficulty, questions)

        return report