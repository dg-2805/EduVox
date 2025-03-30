import os
from dotenv import load_dotenv
import google.generativeai as genai

class AIModel:
    def __init__(self, model_name='gemini-2.0-flash'):
        # Load environment variables
        load_dotenv()
        
        # Configure API key
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("API key not found. Create a .env file with GEMINI_API_KEY=your_key")
        
        # Configure the model
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(model_name)
    
    def generate_response(self, prompt, max_tokens=500):
        """Generate a response from the model"""
        try:
            generation_config = {
                'max_output_tokens': max_tokens,
                'temperature': 0.7,  # Creativity level
                'top_p': 1  # Diversity of response
            }
            response = self.model.generate_content(
                prompt, 
                generation_config=generation_config
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error generating response: {e}")
            return None