import whisper
import sounddevice as sd
import numpy as np
import wave
import os
import re
import torch
import time
import json
import pygame
from enum import Enum
from gtts import gTTS
import librosa

class DebateMode(Enum):
    TEXT = "text"
    VOICE = "voice"

class DebateStage(Enum):
    OPENING = "opening"
    ARGUMENT = "argument"
    REBUTTAL_QUESTIONS = "rebuttal_questions"
    CLOSING = "closing"

class VoiceHandler:
    def __init__(self):
        self.temp_dir = "temp_audio"
        os.makedirs(self.temp_dir, exist_ok=True)
        
        # Check if GPU is available for faster processing
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {self.device}")
        
        # Load Whisper model during initialization
        self.model_size = "base"
        print(f"Loading Whisper model ({self.model_size})...")
        self.model = whisper.load_model(self.model_size, device=self.device)
        print(f"Whisper model loaded!")
    
    def record_audio(self, duration=10, samplerate=16000):
        """Record audio from microphone and save to a temporary file"""
        filename = os.path.join(self.temp_dir, f"recording_{int(time.time())}.wav")
        
        print("Recording... Speak now!")
        
        # Countdown to let user prepare
        for i in range(3, 0, -1):
            print(f"{i}...")
            time.sleep(1)
            
        audio = sd.rec(int(samplerate * duration), samplerate=samplerate, channels=1, dtype=np.int16)
        
        # Show progress during recording
        for i in range(duration):
            print(f"Recording: {i+1}/{duration} seconds", end="\r")
            time.sleep(1)
            
        sd.wait()
        print("\nRecording complete!")
        
        # Normalize audio to prevent volume issues
        audio = audio / np.max(np.abs(audio)) * 32767 if np.max(np.abs(audio)) > 0 else audio
        
        # Save recorded audio as a WAV file
        with wave.open(filename, "wb") as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)  # 16-bit PCM
            wf.setframerate(samplerate)
            wf.writeframes(audio.astype(np.int16).tobytes())
            
        return filename
    
    def speech_to_text(self, audio_file):
        """Transcribe audio using Whisper"""
        try:
            print("Transcribing audio...")
            
            # Use higher temperature for more accurate word timestamps
            result = self.model.transcribe(
                audio_file, 
                temperature=0.0,  # Keep deterministic
                initial_prompt="This is a debate recording."  # Help with context
            )
            
            transcription = result["text"].strip()
            print(f"Transcription: {transcription}")
            
            # Analyze speech patterns
            speech_metrics = self.analyze_speech(result)
            
            return transcription
        except Exception as e:
            print(f"Error during transcription: {e}")
            return None
    
    def text_to_speech(self, text):
        """Convert text to speech and play it"""
        try:
            audio_file = os.path.join(self.temp_dir, f"tts_{int(time.time())}.mp3")
            tts = gTTS(text=text, lang='en', slow=False)
            tts.save(audio_file)
            
            # Initialize pygame mixer if needed
            if not pygame.mixer.get_init():
                pygame.mixer.init()
                
            # Play the audio
            pygame.mixer.music.load(audio_file)
            pygame.mixer.music.play()
            
            # Wait for audio to finish
            while pygame.mixer.music.get_busy():
                time.sleep(0.1)
                
            return True
        except Exception as e:
            print(f"Error in text-to-speech: {e}")
            return False
    
    def analyze_speech(self, transcription_result):
        """Analyze speech patterns from Whisper result"""
        segments = transcription_result.get("segments", [])
        transcription_text = transcription_result.get("text", "").strip()
        
        if not transcription_text:
            return {"error": "Empty transcription"}
        
        # Detect pauses
        pauses = self._detect_pauses(segments)
        
        # Detect stammering/repetitions
        stammering_count = self._detect_stammering(segments, transcription_text)
        
        # Calculate speech rate
        duration = segments[-1]["end"] if segments else 0
        rate_analysis = self._analyze_speech_rate(transcription_text, duration)
        
        # Calculate filler word usage
        filler_words = ["um", "uh", "like", "you know", "so"]
        filler_count = sum(transcription_text.lower().count(word) for word in filler_words)
        
        # Fluency Score Calculation (weighted)
        base_score = 100
        pause_penalty = min(len(pauses) * 5, 40)  # Cap at 40 points max penalty
        stammer_penalty = min(stammering_count * 6, 30)  # Cap at 30 points
        filler_penalty = min(filler_count * 3, 15)  # Cap at 15 points
        
        # Adjust for very slow or very fast speech
        rate_penalty = 0
        if rate_analysis["words_per_minute"] < 80 or rate_analysis["words_per_minute"] > 200:
            rate_penalty = 10
            
        fluency_score = max(0, base_score - pause_penalty - stammer_penalty - filler_penalty - rate_penalty)
        
        return {
            "fluency_score": fluency_score,
            "speech_rate": rate_analysis["words_per_minute"],
            "pauses": len(pauses),
            "stammering": stammering_count,
            "filler_words": filler_count
        }
    
    def _detect_pauses(self, segments, threshold=0.5):
        """Detect pauses in speech"""
        pauses = []
        
        # First, check between segments
        for i in range(1, len(segments)):
            gap = segments[i]["start"] - segments[i-1]["end"]
            if gap > threshold:
                pauses.append({
                    "duration": round(gap, 2),
                    "position": f"between '{segments[i-1]['text'].strip()}' and '{segments[i]['text'].strip()}'"
                })
                
        # Then check for within-segment word pauses (if word-level timestamps available)
        for segment in segments:
            if "words" in segment:
                words = segment["words"]
                for i in range(1, len(words)):
                    gap = words[i]["start"] - words[i-1]["end"]
                    if gap > threshold:
                        pauses.append({
                            "duration": round(gap, 2),
                            "position": f"between '{words[i-1]['word']}' and '{words[i]['word']}'"
                        })
                        
        return pauses
    
    def _detect_stammering(self, segments, text):
        """Detect word repetitions (stammering)"""
        # Method 1: Pattern matching for direct repetitions
        stammer_pattern = r'\b(\w+)(?:-\1|\s+\1+)\b'
        direct_repetitions = len(re.findall(stammer_pattern, text.lower()))
        
        # Method 2: Analyze word timestamps for hesitations followed by repetitions
        word_list = []
        for segment in segments:
            if "words" in segment:
                word_list.extend(segment["words"])
        
        repetition_count = 0
        
        if len(word_list) > 1:
            for i in range(1, len(word_list)):
                current_word = word_list[i]["word"].lower().strip()
                prev_word = word_list[i-1]["word"].lower().strip()
                
                # Check for repetition with possible filler sounds
                if current_word == prev_word or (
                    len(current_word) > 2 and len(prev_word) > 2 and 
                    (current_word.startswith(prev_word[:2]) or prev_word.startswith(current_word[:2]))
                ):
                    # Check if there was a pause before repetition
                    time_diff = word_list[i]["start"] - word_list[i-1]["end"]
                    if time_diff > 0.2:  # Short hesitation threshold
                        repetition_count += 1
                        
        return direct_repetitions + repetition_count
    
    def _analyze_speech_rate(self, transcript, duration):
        """Analyze speech rate"""
        word_count = len(transcript.split())
        
        # Avoid division by zero
        if duration == 0:
            duration = 1
            
        # Words per minute calculation
        words_per_minute = (word_count / duration) * 60
        
        # Categorize speech rate
        if words_per_minute < 100:
            rate_category = "Slow"
        elif words_per_minute < 150:
            rate_category = "Average"
        elif words_per_minute < 200:
            rate_category = "Fast"
        else:
            rate_category = "Very Fast"
            
        return {
            "word_count": word_count,
            "words_per_minute": round(words_per_minute, 1),
            "category": rate_category
        }

class VoiceAnalyzer:
    def __init__(self):
        pass
    
    def analyze_audio(self, audio_file):
        """Analyze audio characteristics using librosa"""
        try:
            y, sr = librosa.load(audio_file, sr=None)
            duration = librosa.get_duration(y=y, sr=sr)
            
            # Detect speech segments
            intervals = librosa.effects.split(y, top_db=30)
            pauses = len(intervals) / duration
            
            # Extract pitch information
            pitches = librosa.yin(y, fmin=80, fmax=400, sr=sr)
            valid_pitches = pitches[~np.isnan(pitches)]
            pitch_std = np.std(valid_pitches) if len(valid_pitches) > 0 else 0
            
            # Detect onsets for speech rate
            onsets = librosa.onset.onset_detect(y=y, sr=sr)
            speech_rate = len(onsets) / duration
            
            return {
                "pauses_per_sec": pauses,
                "pitch_variation": pitch_std,
                "speech_rate": speech_rate
            }
        except Exception as e:
            print(f"Error analyzing audio: {e}")
            return None

class ImprovedFactChecker:
    def __init__(self):
        # This would typically connect to a database or API
        pass
    
    def check_statement_accuracy(self, statement):
        """Simulate fact checking (in a real implementation, this would use a database or API)"""
        # This is a dummy implementation - in real use, you would connect to a fact-checking service
        print("Performing fact check...")
        time.sleep(1)  # Simulate API call
        
        # Random accuracy between 60-100 for demo purposes
        accuracy = np.random.randint(60, 101)
        
        return {
            "accuracy_score": accuracy,
            "sources": ["simulated_source_1", "simulated_source_2", "simulated_source_3"],
            "explanation": f"This is a simulated fact check with {accuracy}% confidence."
        }

class DebateReportGenerator:
    def __init__(self):
        pass
    
    def generate_report(self, debate_data):
        """Generate a structured debate report"""
        # In a real implementation, this would create a more sophisticated report
        return debate_data

class AIModel:
    """Mock AI model for debate responses"""
    def __init__(self, model_name="mock_model"):
        self.model_name = model_name
        print(f"Initializing AI Model: {model_name}")
    
    def generate_response(self, prompt):
        """Generate AI response (mock implementation)"""
        # In a real implementation, this would call a language model API
        
        # For testing, we'll generate some simple mock responses
        if "opening" in prompt.lower():
            return "This is a simulated AI opening statement. I would like to present three key arguments. First, evidence suggests this position has merit. Second, multiple studies confirm these findings. Third, we should consider the broader implications."
        
        elif "argument" in prompt.lower():
            return "Here's my counterpoint: While that position has some validity, recent evidence suggests otherwise. Consider the following facts that challenge this assumption."
        
        elif "question" in prompt.lower():
            return "How do you reconcile your position with the recent findings that suggest an alternative interpretation of the data?"
        
        else:
            return "I acknowledge your points and would like to respond with a thoughtful consideration of the evidence presented."

class DebateAgent:
    def __init__(self, ai_model, voice_mode=False):
        self.ai_model = ai_model
        self.fact_checker = ImprovedFactChecker()
        self.report_generator = DebateReportGenerator()
        self.voice_mode = voice_mode
        
        # Initialize voice components with Whisper
        self.voice_handler = VoiceHandler() if voice_mode else None
        self.voice_analyzer = VoiceAnalyzer() if voice_mode else None
        
        self.audio_clips = []
        self.debate_history = []
        self.rebuttal_tracker = {"user": [], "ai": []}
        
        # Initialize pygame for audio playback if in voice mode
        if voice_mode and not pygame.mixer.get_init():
            pygame.mixer.init()
        
        # Time limits for voice debate (in seconds)
        self.time_limits = {
            DebateStage.OPENING: 30,
            DebateStage.ARGUMENT: 15,
            DebateStage.REBUTTAL_QUESTIONS: 60,
            DebateStage.CLOSING: 60
        }
        
        # Word limits for text debate
        self.word_limits = {
            DebateStage.OPENING: 150,
            DebateStage.ARGUMENT: 100,
            DebateStage.REBUTTAL_QUESTIONS: 75,
            DebateStage.CLOSING: 100
        }

    def run_text_debate(self):
        """Handle text debate with structured format"""
        print("\n=== Text Debate ===")
        topic = self._get_text_topic()
        stance = self._get_text_stance()
        rounds = self._get_number_of_rounds()
        report = self._conduct_text_debate(topic, stance, rounds)
        self._display_report(report)
        return report

    def run_voice_debate(self):
        """Handle voice debate with structured format"""
        print("\n=== Voice Debate with Whisper ===")
        topic = self._get_text_topic()
        stance = self._get_text_stance()
        rounds = self._get_number_of_rounds()
        report = self._conduct_voice_debate(topic, stance, rounds)
        self._display_report(report)
        return report

    # Time and word counting methods
    def _timed_input(self, prompt, time_limit):
        """Get user input with a time limit and return both input and time taken"""
        print(f"\nTime remaining: {time_limit}s")
        start_time = time.time()
        user_input = input(prompt)
        elapsed = time.time() - start_time
        
        if elapsed > time_limit:
            print(f"\nTime's up! Your input was truncated after {time_limit} seconds.")
            return user_input[:int(len(user_input) * (time_limit/elapsed))], time_limit
        return user_input, elapsed
    
    def _word_count(self, text):
        """Count words in text"""
        return len(text.split())
    
    def _enforce_word_limit(self, text, limit):
        """Truncate text to word limit"""
        words = text.split()
        if len(words) <= limit:
            return text
        
        print(f"\nWord limit exceeded! Input truncated to {limit} words.")
        return " ".join(words[:limit])
    
    # Common configuration methods
    def _get_number_of_rounds(self):
        """Get number of debate rounds"""
        while True:
            try:
                rounds = int(input("\nEnter number of debate rounds (3-10): "))
                if 3 <= rounds <= 10:
                    return rounds
                print("Please enter a number between 3 and 10.")
            except ValueError:
                print("Please enter a valid number.")
    
    def _get_rebuttal_questions_count(self):
        """Get number of rebuttal questions"""
        while True:
            try:
                count = int(input("\nEnter number of rebuttal questions (1-5): "))
                if 1 <= count <= 5:
                    return count
                print("Please enter a number between 1 and 5.")
            except ValueError:
                print("Please enter a valid number.")
    
    # Text Debate Methods
    def _get_text_topic(self):
        while True:
            topic = input("\nEnter debate topic (min 10 chars): ").strip()
            if len(topic) >= 10:
                return topic
            print("Topic too short. Please enter at least 10 characters.")

    def _get_text_stance(self):
        while True:
            stance = input("Are you for or against this topic? (For/Against): ").capitalize()
            if stance in ["For", "Against"]:
                return stance
            print("Invalid input. Please enter 'For' or 'Against'.")

    def _conduct_text_debate(self, topic, stance, rounds):
        opposite_stance = "Against" if stance == "For" else "For"
        self.debate_history = []
        
        # Opening argument from User
        print(f"\n=== OPENING STATEMENTS (max {self.word_limits[DebateStage.OPENING]} words) ===")
        user_opening = input("\nYour Opening Statement:\n> ")
        user_opening = self._enforce_word_limit(user_opening, self.word_limits[DebateStage.OPENING])
        self._add_to_history("User", user_opening, DebateStage.OPENING)

        ai_opening = self._generate_ai_argument(topic, opposite_stance, DebateStage.OPENING)
        print(f"\nAI Opening ({opposite_stance}):\n{ai_opening}")
        self._add_to_history("AI", ai_opening, DebateStage.OPENING)

        # Main debate loop with alternating turns
        for round_num in range(1, rounds + 1):
            print(f"\n=== DEBATE ROUND {round_num}/{rounds} (max {self.word_limits[DebateStage.ARGUMENT]} words) ===")
            
            if round_num % 2 == 1:  # User goes first in odd rounds
                print("\nYour Argument:")
                user_argument = input("> ")
                user_argument = self._enforce_word_limit(user_argument, self.word_limits[DebateStage.ARGUMENT])
                self._add_to_history("User", user_argument, DebateStage.ARGUMENT)
                
                ai_argument = self._generate_ai_argument(topic, opposite_stance, DebateStage.ARGUMENT)
                print(f"\nAI Argument:\n{ai_argument}")
                self._add_to_history("AI", ai_argument, DebateStage.ARGUMENT)
            else:  # AI goes first in even rounds
                ai_argument = self._generate_ai_argument(topic, opposite_stance, DebateStage.ARGUMENT)
                print(f"\nAI Argument:\n{ai_argument}")
                self._add_to_history("AI", ai_argument, DebateStage.ARGUMENT)
                
                print("\nYour Response (type 'f' to fact check last AI point):")
                user_response = input("> ")
                
                if user_response.lower() == 'f':
                    self._handle_fact_check(ai_argument)
                    user_response = input("\nNow enter your response:\n> ")
                
                user_response = self._enforce_word_limit(user_response, self.word_limits[DebateStage.ARGUMENT])
                self._add_to_history("User", user_response, DebateStage.ARGUMENT)

        # Stage 3: Rebuttal Questions (post-debate)
        print(f"\n=== REBUTTAL QUESTIONS ===")
        rebuttal_questions = self._get_rebuttal_questions_count()
        
        for q in range(1, rebuttal_questions + 1):
            print(f"\n--- Rebuttal Question {q}/{rebuttal_questions} ---")
            
            if q % 2 == 1:  # User asks questions on odd numbers
                question = input("\nAsk the AI a question:\n> ")
                question = self._enforce_word_limit(question, self.word_limits[DebateStage.REBUTTAL_QUESTIONS])
                self._add_to_history("User", question, DebateStage.REBUTTAL_QUESTIONS)
                
                ai_answer = self._generate_ai_response(question, topic, opposite_stance)
                print(f"\nAI Answer:\n{ai_answer}")
                self._add_to_history("AI", ai_answer, DebateStage.REBUTTAL_QUESTIONS)
            else:  # AI asks questions on even numbers
                ai_question = self._generate_ai_question(topic, opposite_stance)
                print(f"\nAI Question:\n{ai_question}")
                self._add_to_history("AI", ai_question, DebateStage.REBUTTAL_QUESTIONS)
                
                user_answer = input("\nYour Answer:\n> ")
                user_answer = self._enforce_word_limit(user_answer, self.word_limits[DebateStage.REBUTTAL_QUESTIONS])
                self._add_to_history("User", user_answer, DebateStage.REBUTTAL_QUESTIONS)

        return self._generate_final_report(topic, stance, rounds)

    # Voice Debate Methods
    def _conduct_voice_debate(self, topic, stance, rounds):
        opposite_stance = "Against" if stance == "For" else "For"
        self.debate_history = []
        self.audio_clips = []
        self.rebuttal_tracker = {"user": [], "ai": []}
        
        # Stage 1: Opening Statements
        print(f"\n=== OPENING STATEMENTS ===")
        ai_opening = self._generate_ai_argument(topic, opposite_stance, DebateStage.OPENING)
        print(f"\nAI Opening Statement:\n{ai_opening}")
        
        # Play AI opening and show a clear indicator that speech is done
        print("\nPlaying AI opening statement...")
        self.voice_handler.text_to_speech(ai_opening)
        print("\n[AI has finished speaking]")
        
        self._add_to_history("AI", ai_opening, DebateStage.OPENING)
        
        print("\nSpeak your opening statement after the beep...")
        user_opening = self._get_voice_input(DebateStage.OPENING)
        if not user_opening:
            return self._early_exit()
        
        # Stage 2: Main Debate Rounds (alternating between AI and User)
        for round_num in range(1, rounds + 1):
            print(f"\n=== DEBATE ROUND {round_num}/{rounds} ({self.time_limits[DebateStage.ARGUMENT]}s limit) ===")
            
            # Alternate who goes first
            if round_num % 2 == 1:
                # AI goes first in odd-numbered rounds
                ai_argument = self._generate_ai_argument(topic, opposite_stance, DebateStage.ARGUMENT)
                print("\nAI Argument:")
                print(f"{ai_argument}")
                
                print("\nPlaying AI argument...")
                self.voice_handler.text_to_speech(ai_argument)
                print("\n[AI has finished speaking]")
                
                self._add_to_history("AI", ai_argument, DebateStage.ARGUMENT)
                
                print("\nSpeak your response after the beep (say 'fact check' to verify last point)...")
                user_response = self._get_voice_input(DebateStage.ARGUMENT)
                if not user_response:
                    return self._early_exit()
                
                if "fact check" in user_response.lower():
                    self._handle_fact_check(ai_argument)
                    print("\nNow speak your response after the beep...")
                    user_response = self._get_voice_input(DebateStage.ARGUMENT)
                    if not user_response:
                        return self._early_exit()
                
                self._add_to_history("User", user_response, DebateStage.ARGUMENT)
            else:
                # User goes first in even-numbered rounds
                print("\nSpeak your argument after the beep...")
                user_argument = self._get_voice_input(DebateStage.ARGUMENT)
                if not user_argument:
                    return self._early_exit()
                
                self._add_to_history("User", user_argument, DebateStage.ARGUMENT)
                
                ai_response = self._generate_ai_response(user_argument, topic, opposite_stance)
                print(f"\nAI Response:\n{ai_response}")
                
                print("\nPlaying AI response...")
                self.voice_handler.text_to_speech(ai_response)
                print("\n[AI has finished speaking]")
                
                self._add_to_history("AI", ai_response, DebateStage.ARGUMENT)

        # Stage 3: Closing Arguments
        print(f"\n=== CLOSING ARGUMENTS ({self.time_limits[DebateStage.CLOSING]}s limit) ===")
        print("\nSpeak your closing statement after the beep...")
        user_close = self._get_voice_input(DebateStage.CLOSING)
        if not user_close:
            return self._early_exit()
        
        self._add_to_history("User", user_close, DebateStage.CLOSING)
        
        ai_close = self._generate_ai_argument(topic, opposite_stance, DebateStage.CLOSING)
        print(f"\nAI Closing Statement:\n{ai_close}")
        
        print("\nPlaying AI closing statement...")
        self.voice_handler.text_to_speech(ai_close)
        print("\n[AI has finished speaking]")
        
        self._add_to_history("AI", ai_close, DebateStage.CLOSING)
        
        # Stage 4: Rebuttal Questions (post-debate)
        rebuttal_questions = self._get_rebuttal_questions_count()
        print(f"\n=== REBUTTAL QUESTIONS ({rebuttal_questions}) ===")
        
        for q in range(1, rebuttal_questions + 1):
            print(f"\n--- Rebuttal Question {q}/{rebuttal_questions} ---")
            
            if q % 2 == 1:  # User asks questions on odd numbers
                print("\nSpeak your question after the beep...")
                question = self._get_voice_input(DebateStage.REBUTTAL_QUESTIONS)
                if not question:
                    return self._early_exit()
                
                self._add_to_history("User", question, DebateStage.REBUTTAL_QUESTIONS)
                
                ai_answer = self._generate_ai_response(question, topic, opposite_stance)
                print(f"\nAI Answer:\n{ai_answer}")
                
                print("\nPlaying AI answer...")
                self.voice_handler.text_to_speech(ai_answer)
                print("\n[AI has finished speaking]")
                
                self._add_to_history("AI", ai_answer, DebateStage.REBUTTAL_QUESTIONS)
            else:  # AI asks questions on even numbers
                ai_question = self._generate_ai_question(topic, opposite_stance)
                print(f"\nAI Question:\n{ai_question}")
                
                print("\nPlaying AI question...")
                self.voice_handler.text_to_speech(ai_question)
                print("\n[AI has finished speaking]")
                
                self._add_to_history("AI", ai_question, DebateStage.REBUTTAL_QUESTIONS)
                
                print("\nSpeak your answer after the beep...")
                user_answer = self._get_voice_input(DebateStage.REBUTTAL_QUESTIONS)
                if not user_answer:
                    return self._early_exit()
                
                self._add_to_history("User", user_answer, DebateStage.REBUTTAL_QUESTIONS)

        return self._generate_final_report(topic, stance, rounds)

    # Shared Methods
    def _get_voice_input(self, stage):
        """Get user voice input for the debate stage using Whisper"""
        try:
            limit = self.time_limits[stage]
            print(f"\nSpeak now (max {limit}s)...")
            
            # Play a beep sound if available
            try:
                if os.path.exists("resources/beep.wav"):
                    pygame.mixer.Sound("resources/beep.wav").play()
                else:
                    print("BEEP")
            except Exception:
                print("BEEP")
                
            time.sleep(0.5)  # Short pause after beep
            
            # Record audio using the VoiceHandler
            audio_file = self.voice_handler.record_audio(limit)
            if not audio_file:
                print("Recording failed. Please try again.")
                return self._get_voice_input(stage)
                
            self.audio_clips.append(audio_file)
            
            print("Processing your speech using Whisper...")
            transcription = self.voice_handler.speech_to_text(audio_file)
            
            if not transcription or transcription.strip() == "":
                print("No speech detected or recognition failed. Please try again.")
                return self._get_voice_input(stage)
                
            print(f"You said: {transcription}")
            
            # Allow user to verify text and retry if needed
            verify = input("Is this correct? (y/n): ")
            if verify.lower() != 'y':
                print("Let's try again...")
                return self._get_voice_input(stage)
                
            return transcription
        except KeyboardInterrupt:
            print("\nDebate ended early by user.")
            return None
        except Exception as e:
            print(f"Error processing audio: {e}")
            print("Let's try again...")
            return self._get_voice_input(stage)

    def _generate_ai_argument(self, topic, stance, stage):
        """Generate AI argument based on topic and stance"""
        # In a real implementation, this would call a better prompt
        prompt = f"Generate a {stage.value} argument about '{topic}' from the {stance} perspective."
        response = self.ai_model.generate_response(prompt)
        
        # Enforce word limits for consistency
        words = response.split()
        if len(words) > self.word_limits[stage]:
            response = " ".join(words[:self.word_limits[stage]])
            
        return response
    
    def _generate_ai_response(self, user_input, topic, stance):
        """Generate AI response to user input"""
        prompt = f"Respond to this point in a debate about '{topic}' from the {stance} perspective: '{user_input}'"
        return self.ai_model.generate_response(prompt)
    
    def _generate_ai_question(self, topic, stance):
        """Generate AI question for rebuttal phase"""
        prompt = f"Generate a challenging question about '{topic}' from the {stance} perspective."
        return self.ai_model.generate_response(prompt)
    
    def _handle_fact_check(self, statement):
        """Perform fact checking on AI statement"""
        print("\nFact checking in progress...")
        result = self.fact_checker.check_statement_accuracy(statement)
        
        print(f"\nFact Check Results:")
        print(f"Accuracy Score: {result['accuracy_score']}%")
        print(f"Explanation: {result['explanation']}")
        print("Sources:", ", ".join(result['sources']))
        
        return result
    
    def _add_to_history(self, speaker, text, stage):
        """Add debate entry to history"""
        entry = {
            "speaker": speaker,
            "text": text,
            "stage": stage.value,
            "timestamp": time.strftime("%H:%M:%S"),
            "word_count": self._word_count(text)
        }
        
        # Add to rebuttal tracker if in rebuttal stage
        if stage == DebateStage.REBUTTAL_QUESTIONS:
            if speaker == "User":
                self.rebuttal_tracker["user"].append(text)
            else:
                self.rebuttal_tracker["ai"].append(text)
                
        self.debate_history.append(entry)
    
    def _early_exit(self):
        """Handle early exit from debate"""
        print("\nDebate ended early.")
        return {"status": "incomplete", "reason": "user_exit", "history": self.debate_history}
    
    def _generate_final_report(self, topic, stance, rounds):
        """Generate final debate report"""
        print("\nGenerating debate report...")
        
        # Calculate basic statistics
        user_words = sum(entry["word_count"] for entry in self.debate_history if entry["speaker"] == "User")
        ai_words = sum(entry["word_count"] for entry in self.debate_history if entry["speaker"] == "AI")
        
        user_turns = sum(1 for entry in self.debate_history if entry["speaker"] == "User")
        ai_turns = sum(1 for entry in self.debate_history if entry["speaker"] == "AI")
        
        # Analyze argument structure and flow
        user_arguments = [entry["text"] for entry in self.debate_history 
                         if entry["speaker"] == "User" and entry["stage"] == DebateStage.ARGUMENT.value]
        
        ai_arguments = [entry["text"] for entry in self.debate_history 
                       if entry["speaker"] == "AI" and entry["stage"] == DebateStage.ARGUMENT.value]
        
        # Generate report structure
        report = {
            "topic": topic,
            "user_stance": stance,
            "ai_stance": "Against" if stance == "For" else "For",
            "rounds_completed": min(rounds, len(user_arguments)),
            "total_turns": user_turns + ai_turns,
            "word_count": {
                "user_total": user_words,
                "ai_total": ai_words,
                "average_per_turn": round((user_words + ai_words) / (user_turns + ai_turns) if (user_turns + ai_turns) > 0 else 0, 1)
            },
            "debate_flow": self.debate_history,
            "rebuttal_questions": {
                "user_questions": self.rebuttal_tracker["user"],
                "ai_questions": self.rebuttal_tracker["ai"]
            },
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Add voice metrics if available
        if self.voice_mode and self.voice_analyzer and self.audio_clips:
            voice_metrics = []
            for audio_file in self.audio_clips:
                metrics = self.voice_analyzer.analyze_audio(audio_file)
                if metrics:
                    voice_metrics.append(metrics)
            
            if voice_metrics:
                report["voice_analysis"] = {
                    "average_pauses": sum(m["pauses_per_sec"] for m in voice_metrics) / len(voice_metrics),
                    "average_pitch_variation": sum(m["pitch_variation"] for m in voice_metrics) / len(voice_metrics),
                    "average_speech_rate": sum(m["speech_rate"] for m in voice_metrics) / len(voice_metrics)
                }
        
        return self.report_generator.generate_report(report)
    
    def _display_report(self, report):
        """Display debate report to user"""
        print("\n" + "="*50)
        print("DEBATE REPORT")
        print("="*50)
        
        print(f"\nTopic: {report['topic']}")
        print(f"Your Stance: {report['user_stance']}")
        print(f"AI Stance: {report['ai_stance']}")
        print(f"Rounds Completed: {report['rounds_completed']}")
        
        print("\nStatistics:")
        print(f"  Total User Words: {report['word_count']['user_total']}")
        print(f"  Total AI Words: {report['word_count']['ai_total']}")
        print(f"  Average Words Per Turn: {report['word_count']['average_per_turn']}")
        
        # Display voice metrics if available
        if "voice_analysis" in report:
            print("\nVoice Analysis:")
            print(f"  Average Pauses: {report['voice_analysis']['average_pauses']:.2f} per second")
            print(f"  Average Pitch Variation: {report['voice_analysis']['average_pitch_variation']:.2f}")
            print(f"  Average Speech Rate: {report['voice_analysis']['average_speech_rate']:.2f}")
        
        print("\nDebate Flow:")
        for i, entry in enumerate(report["debate_flow"]):
            speaker = entry["speaker"]
            stage = entry["stage"].capitalize()
            words = entry["word_count"]
            print(f"  {i+1}. [{stage}] {speaker} ({words} words)")
        
        print("\nRun the following to save your debate report:")
        print("  save_report(report, 'my_debate_report.json')")

def save_report(report, filename):
    """Save debate report to file"""
    try:
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        print(f"\nReport saved to {filename}")
    except Exception as e:
        print(f"Error saving report: {e}")

def main():
    """Main entry point for debate application"""
    print("\n=== AI Debate Assistant ===")
    print("This program helps you practice debating against an AI opponent")
    
    # Initialize AI model
    ai_model = AIModel()
    
    # Initialize pygame for audio playback
    try:
        pygame.init()
        pygame.mixer.init()
    except pygame.error:
        print("Warning: Pygame initialization failed. Audio playback may not work.")
    
    # Main program loop
    while True:
        print("\nSelect debate mode:")
        print("1. Text debate")
        print("2. Voice debate (requires microphone)")
        print("3. Exit")
        
        choice = input("\nEnter your choice (1-3): ")
        
        if choice == '1':
            agent = DebateAgent(ai_model, voice_mode=False)
            report = agent.run_text_debate()
        elif choice == '2':
            agent = DebateAgent(ai_model, voice_mode=True)
            report = agent.run_voice_debate()
        elif choice == '3':
            print("\nExiting program. Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")
            continue
        
        # Ask if user wants to save the report
        save_choice = input("\nDo you want to save the debate report? (y/n): ")
        if save_choice.lower() == 'y':
            filename = input("Enter filename (default: debate_report.json): ").strip()
            if not filename:
                filename = "debate_report.json"
            save_report(report, filename)
        
        # Ask if user wants to start a new debate
        continue_choice = input("\nDo you want to start another debate? (y/n): ")
        if continue_choice.lower() != 'y':
            print("\nExiting program. Goodbye!")
            break

if __name__ == "__main__":
    main()