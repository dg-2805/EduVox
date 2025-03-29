from utils.fact_checker import ImprovedFactChecker
from voice.handler import VoiceHandler
from voice.analysis import VoiceAnalyzer

class InterviewReportGenerator:
    def __init__(self):
        """Initialize report generator"""
        pass
        
    def generate_interview_report(self, candidate_info, difficulty, interview_history, ai_analysis):
        """
        Generate a comprehensive interview report
        
        Parameters:
        - candidate_info: Dictionary with job_profile, skills, experience
        - difficulty: Interview difficulty level
        - interview_history: List of question-answer pairs
        - ai_analysis: AI-generated analysis of responses
        
        Returns:
        - Formatted report as string
        """
        # Create header section
        report = f"""
============================================================
               INTERVIEW ASSESSMENT REPORT
============================================================

CANDIDATE PROFILE
----------------
Job Profile: {candidate_info['job_profile']}
Experience: {candidate_info['experience']} years
Skills: {', '.join(candidate_info['skills'])}
Interview Level: {difficulty}

INTERVIEW SUMMARY
----------------
Number of Questions: {len(interview_history)}
"""

        # Add Q&A section
        report += """
INTERVIEW Q&A
----------------
"""
        for i, qa in enumerate(interview_history, 1):
            report += f"""
Question {i}: {qa['question']}
Skills Tested: {', '.join(qa['expected_skills'])}
Response: {qa['response']}
"""

        # Add AI analysis
        report += f"""

ANALYSIS
----------------
{ai_analysis}
"""
        
        # Dynamically generate conclusion based on AI analysis
        conclusion = self.generate_conclusion(ai_analysis)

        # Add conclusion
        report += f"""

CONCLUSION & RECOMMENDATIONS
----------------
{conclusion}
"""
        
        report += """
============================================================
"""
        return report
    
    def generate_conclusion(self, ai_analysis):
        """
        Generate a dynamic conclusion based on AI analysis.
        
        Parameters:
        - ai_analysis: AI-generated analysis text
        
        Returns:
        - A summarized conclusion and recommendations.
        """
        # Extract strengths and weaknesses from analysis
        strengths = []
        weaknesses = []

        for line in ai_analysis.split('\n'):
            if "strength" in line.lower():
                strengths.append(line.strip())
            elif "improve" in line.lower() or "weakness" in line.lower():
                weaknesses.append(line.strip())

        # Build conclusion dynamically
        conclusion = "Based on the AI analysis, here are the key takeaways:\n\n"
        
        if strengths:
            conclusion += "**Strengths:**\n" + "\n".join(strengths) + "\n\n"
        else:
            conclusion += "No major strengths identified.\n\n"
        
        if weaknesses:
            conclusion += "**Areas for Improvement:**\n" + "\n".join(weaknesses) + "\n\n"
        else:
            conclusion += "No major weaknesses identified.\n\n"
        
        conclusion += "To enhance performance, consider focusing on key technical skills, problem-solving strategies, and hands-on experience in relevant areas."
        
        return conclusion
