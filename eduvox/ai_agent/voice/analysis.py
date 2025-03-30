import librosa
import numpy as np

class VoiceAnalyzer:
    def analyze(self, audio_path):
        y, sr = librosa.load(audio_path)
        
        return {
            'pauses': self._count_pauses(y, sr),
            'pitch_variation': self._pitch_analysis(y, sr),
            'speech_rate': self._speech_rate(y, sr)
        }
    
    def _count_pauses(self, y, sr, threshold=0.02):
        intervals = librosa.effects.split(y, top_db=30)
        return len(intervals) / (len(y) / sr)  # Pauses per second
    
    def _pitch_analysis(self, y, sr):
        pitches = librosa.yin(y, fmin=80, fmax=400, sr=sr)
        valid = pitches[~np.isnan(pitches)]
        return np.std(valid) if len(valid) > 0 else 0
    
    def _speech_rate(self, y, sr):
        onsets = librosa.onset.onset_detect(y=y, sr=sr)
        return len(onsets) / (len(y) / sr)  # Syllables per second