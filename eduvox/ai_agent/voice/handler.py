import json
import os
import sounddevice as sd
import numpy as np
import scipy.io.wavfile as wav
from vosk import Model, KaldiRecognizer
from gtts import gTTS
import speech_recognition as sr
import pygame

class VoiceHandler:
    def __init__(self):
        try:
            # Check if model exists in the correct path
            model_path = "model"  # or the full path where you extracted the model
            if not os.path.exists(model_path):
                raise ValueError("Model directory not found. Please download the Vosk model.")
            
            self.model = Model(model_path)
            self.recognizer = KaldiRecognizer(self.model, 16000)
            pygame.mixer.init()
            
            # Test microphone
            print("Testing microphone...")
            print("Available devices:")
            print(sd.query_devices())
            self.device_info = sd.query_devices(None, 'input')
            print(f"Using input device: {self.device_info['name']}")
            
        except Exception as e:
            print(f"Error initializing voice handler: {e}")
            print("Please ensure:")
            print("1. Vosk model is downloaded and extracted to 'model' directory")
            print("2. Microphone is properly connected and selected")
            raise

    def record_audio(self, duration=5):
        """Record audio with better error handling"""
        try:
            print("\nRecording... (Speak now)")
            fs = 16000
            audio = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='float32')
            
            # Add visual feedback during recording
            for i in range(duration):
                print(f"Recording: {'▓' * (i+1)}{'░' * (duration-i-1)} {i+1}/{duration}s", end='\r')
                sd.sleep(1000)
            
            sd.wait()
            print("\nRecording finished!")
            
            # Normalize audio
            audio = audio / np.max(np.abs(audio))
            
            # Save to temporary file
            temp_file = "temp.wav"
            wav.write(temp_file, fs, (audio * 32767).astype(np.int16))
            
            return temp_file
            
        except Exception as e:
            print(f"\nError recording audio: {e}")
            print("Please check if your microphone is properly connected and enabled")
            return None

    def speech_to_text(self, audio_path):
        """Convert speech to text with better error handling"""
        if not audio_path or not os.path.exists(audio_path):
            print("No audio file found")
            return ""
            
        try:
            with open(audio_path, "rb") as f:
                audio_data = f.read()
                
            # Reset recognizer for new input
            self.recognizer.Reset()
            
            if self.recognizer.AcceptWaveform(audio_data):
                result = json.loads(self.recognizer.Result())
                text = result.get('text', '')
                print(f"Recognized text: {text}")  # Debug output
                return text
            else:
                partial = json.loads(self.recognizer.PartialResult())
                print(f"Partial result: {partial}")  # Debug output
                return partial.get('partial', '')
                
        except Exception as e:
            print(f"Error in speech recognition: {e}")
            return ""
        finally:
            # Cleanup
            try:
                os.remove(audio_path)
            except:
                pass
    
    def text_to_speech(self, text):
        try:
            tts = gTTS(text=text, lang='en')
            tts.save("response.mp3")
            
            try:
                pygame.mixer.music.load("response.mp3")
                pygame.mixer.music.play()
                while pygame.mixer.music.get_busy():
                    pygame.time.Clock().tick(10)
            except Exception as e:
                print(f"Error playing audio: {e}")
            
            try:
                pygame.mixer.music.unload()
                os.remove("response.mp3")
            except:
                pass
                
        except Exception as e:
            print(f"Error in text-to-speech: {e}")