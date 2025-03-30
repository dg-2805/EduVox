# from core.ai_model import AIModel
# from core.debate_module import DebateAgent
# from core.interview_module import InterviewAgent

# def main():
#     # Initialize AI Model
#     ai_model = AIModel()
    
#     # Main menu
#     while True:
#         print("\n=== AI Agent ===")
#         print("1. Debate Module")
#         print("2. Interview Module")
#         print("3. Exit")
        
#         try:
#             choice = int(input("Select an option (1/2/3): "))
            
#             if choice == 1:
#                 debate_agent = DebateAgent(ai_model)
#                 mode = debate_agent.select_debate_mode()
#                 topic = debate_agent.get_debate_topic()
#                 stance = debate_agent.select_debate_stance(topic)
#                 report = debate_agent.conduct_debate(topic, stance)
#                 print("\n=== Debate Report ===")
#                 print(report)
            
#             elif choice == 2:
#                 interview_agent = InterviewAgent(ai_model)
#                 candidate_info = interview_agent.collect_candidate_info()
#                 difficulty = interview_agent.select_difficulty_level()
#                 questions = interview_agent.generate_interview_questions(candidate_info, difficulty)
#                 report = interview_agent.conduct_interview(candidate_info, difficulty, questions)
#                 print("\n=== Interview Report ===")
#                 print(report)
            
#             elif choice == 3:
#                 print("Exiting AI Agent. Goodbye!")
#                 break
            
#             else:
#                 print("Invalid choice. Please select 1, 2, or 3.")
        
#         except ValueError:
#             print("Please enter a valid number.")

# if __name__ == "__main__":
#     main()

from core.debate_module import DebateAgent
from core.interview_module import InterviewAgent
from core.ai_model import AIModel
# from voice.handler import VoiceHandler

def main():
    ai_model = AIModel()
    # voice_handler = VoiceHandler()
    
    while True:
        print("\n=== AI Agent ===")
        print("1. Text Debate")
        print("2. Voice Debate")
        print("3. Interview")
        print("4. Exit")
        
        choice = input("Choose mode (1-4): ")
        
        if choice == '1':
            debate_agent = DebateAgent(ai_model)
            debate_agent.run_text_debate()
        
        elif choice == '2':
            debate_agent = DebateAgent(ai_model, voice_mode=True)
            debate_agent.run_voice_debate()
        
        elif choice == '3':
            interview_agent = InterviewAgent(ai_model)
            interview_agent.run_interview()
        
        elif choice == '4':
            print("Exiting...")
            break
        
        else:
            print("Invalid choice")

if __name__ == "__main__":
    main()