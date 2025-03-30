import whisper
import sounddevice as sd
import numpy as np
import wave
import os
import re
import torch
from collections import Counter
import time

# Check if GPU is available for faster processing
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Function to record audio
def record_audio(filename="input.wav", duration=10, samplerate=16000):
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

# Function to transcribe using Whisper
def transcribe_audio(filename="input.wav", model_size="base"):
    try:
        print(f"Loading Whisper model ({model_size})...")
        model = whisper.load_model(model_size, device=device)
        
        print("Transcribing audio...")
        # Use higher temperature for more accurate word timestamps
        result = model.transcribe(
            filename, 
            temperature=0.0,  # Keep deterministic for stammering detection
            word_timestamps=True,
            initial_prompt="This is a fluency test recording."  # Help with context
        )
        return result
    except Exception as e:
        print(f"Error during transcription: {e}")
        return None

# Function to detect word repetitions (stammering)
def detect_stammering(words, text):
    # Method 1: Pattern matching for direct repetitions
    stammer_pattern = r'\b(\w+)(?:-\1|\s+\1+)\b'
    direct_repetitions = len(re.findall(stammer_pattern, text.lower()))
    
    # Method 2: Analyze word timestamps for hesitations followed by repetitions
    word_list = [w for segment in words for w in segment.get("words", [])]
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

# Function to detect pauses
def detect_pauses(segments, threshold=0.5):
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

# Function to analyze speech rate
def analyze_speech_rate(transcript, duration):
    word_count = len(transcript.split())
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

# Function to analyze speech fluency with detailed metrics
def analyze_speech(transcription_result, duration=10):
    if not transcription_result:
        return "Error: No transcription available."

    segments = transcription_result.get("segments", [])
    transcription_text = transcription_result.get("text", "").strip()
    
    if not transcription_text:
        return "Error: Empty transcription."
    
    # Detect pauses
    pauses = detect_pauses(segments)
    
    # Detect stammering/repetitions
    stammering_count = detect_stammering(segments, transcription_text)
    
    # Analyze speech rate
    rate_analysis = analyze_speech_rate(transcription_text, duration)
    
    # Calculate filler word usage
    filler_words = ["um", "uh", "like", "you know", "so"]
    filler_count = sum(transcription_text.lower().count(word) for word in filler_words)
    
    # Fluency Score Calculation (weighted)
    # Base score is 100, deductions for issues
    base_score = 100
    pause_penalty = min(len(pauses) * 5, 40)  # Cap at 40 points max penalty
    stammer_penalty = min(stammering_count * 6, 30)  # Cap at 30 points
    filler_penalty = min(filler_count * 3, 15)  # Cap at 15 points
    
    # Adjust for very slow or very fast speech
    rate_penalty = 0
    if rate_analysis["words_per_minute"] < 80 or rate_analysis["words_per_minute"] > 200:
        rate_penalty = 10
    
    fluency_score = max(0, base_score - pause_penalty - stammer_penalty - filler_penalty - rate_penalty)
    
    # Generate Report
    report = f"""
Speech Analysis Report:
==========================
Transcription: "{transcription_text}"

Basic Metrics:
- Total Words: {rate_analysis["word_count"]} words
- Speech Rate: {rate_analysis["words_per_minute"]} words per minute ({rate_analysis["category"]})
- Number of Pauses: {len(pauses)}
- Stammering/Repetitions: {stammering_count}
- Filler Words: {filler_count}

Fluency Score: {fluency_score}/100

Detailed Analysis:
"""
    
    # Add pause details if any
    if pauses:
        report += "\nPause Details:\n"
        for i, pause in enumerate(pauses[:3]):  # Show only first 3 pauses
            report += f"  • {pause['duration']}s pause {pause['position']}\n"
        if len(pauses) > 3:
            report += f"  • ...and {len(pauses) - 3} more pauses\n"
    
    # Add interpretation
    report += f"""
Interpretation:
- 90-100: Excellent Fluency (minimal pauses or repetitions)
- 70-89: Good Fluency (occasional pauses/repetitions)
- 50-69: Moderate Fluency (noticeable pauses/repetitions)
- Below 50: Significant fluency challenges

Your Score: {fluency_score}/100 - {
    "Excellent Fluency" if fluency_score >= 90 else
    "Good Fluency" if fluency_score >= 70 else
    "Moderate Fluency" if fluency_score >= 50 else
    "Needs Improvement"
}
"""

    # Add recommendations based on issues
    report += "\nRecommendations:\n"
    
    if len(pauses) > 2:
        report += "- Practice with prepared speech to reduce pauses\n"
    if stammering_count > 2:
        report += "- Try speaking slightly slower to reduce repetitions\n"
    if filler_count > 3:
        report += "- Be conscious of filler words and practice replacing them with pauses\n"
    if rate_analysis["words_per_minute"] < 80:
        report += "- Try to increase your speaking pace slightly\n"
    if rate_analysis["words_per_minute"] > 200:
        report += "- Consider slowing down slightly for better clarity\n"
    
    return report

# Main function with improved robustness
def main():
    try:
        # Allow user to set duration
        try:
            duration = int(input("Enter recording duration in seconds (default: 10): ") or 10)
        except ValueError:
            duration = 10
            print("Invalid input, using default 10 seconds")
        
        # Allow user to choose model size
        model_size = input("Choose Whisper model size (tiny, base, small, medium) [default: base]: ").lower() or "base"
        if model_size not in ["tiny", "base", "small", "medium"]:
            print(f"Invalid model size '{model_size}', using 'base' instead")
            model_size = "base"
            
        # Record audio
        filename = record_audio(duration=duration)
        
        if os.path.exists(filename):
            # Transcribe and analyze
            transcription_result = transcribe_audio(filename, model_size)
            if transcription_result:
                print("\nAnalyzing speech patterns...")
                report = analyze_speech(transcription_result, duration)
                print(report)
                
                # Save report to file
                with open("speech_analysis_report.txt", "w") as f:
                    f.write(report)
                print("Report saved to speech_analysis_report.txt")
            else:
                print("Error: Transcription failed.")
        else:
            print(f"Error: Audio file {filename} not found")
            
    except KeyboardInterrupt:
        print("\nProcess interrupted by user")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()