import nemo.collections.asr as nemo_asr
import sounddevice as sd
import numpy as np
import wave
import re

# Function to record audio
def record_audio(filename="input.wav", duration=10, samplerate=16000):
    print("Recording... Speak now!")
    audio = sd.rec(int(samplerate * duration), samplerate=samplerate, channels=1, dtype=np.int16)
    sd.wait()  
    print("Recording complete!")

    # Save the recorded audio
    with wave.open(filename, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(samplerate)
        wf.writeframes(audio.tobytes())

# Function to transcribe using Titanet
def transcribe_audio(filename="input.wav"):
    asr_model = nemo_asr.models.ASRModel.from_pretrained("stt_en_titanet_large")
    transcription = asr_model.transcribe([filename])[0]
    return transcription

# Function to analyze pauses and stammering
def analyze_speech(transcription):
    words = transcription.split()
    word_count = len(words)

    # Detect pauses (long silences)
    pauses = transcription.count("...")  # Example: "Hello ... my name is ..."
    
    # Detect stammers (repeated words or sounds)
    stammers = len(re.findall(r'\b(\w+)\s+\1\b', transcription))  # Repeated words like "I-I" or "um um"

    # Fluency score calculation
    fluency_score = max(0, 100 - (pauses * 5 + stammers * 10))  # Simple scoring model

    # Generate Report
    report = f"""
    Speech Analysis Report:
    -----------------------
    Total Words Spoken: {word_count}
    Number of Pauses: {pauses}
    Number of Stammers: {stammers}
    Fluency Score: {fluency_score}/100

    Interpretation:
    - 90-100: Excellent Fluency
    - 70-89: Good Fluency with minor issues
    - 50-69: Moderate Fluency, needs improvement
    - Below 50: Significant pauses/stammering detected
    """

    return report

# Main function
def main():
    record_audio()
    transcription = transcribe_audio()
    print("\nTranscription:\n", transcription)
    
    report = analyze_speech(transcription)
    print("\n", report)

if __name__ == "__main__":
    main()
