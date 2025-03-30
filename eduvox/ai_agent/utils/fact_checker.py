# from .google_fact_checker import GoogleFactChecker

# class FactChecker:
#     def __init__(self):
#         self.google_fact_checker = GoogleFactChecker()
    
#     def check_statement_accuracy(self, statement):
#         """
#         Comprehensive fact-checking method
#         """
#         # Use Google Fact Check API
#         fact_check_result = self.google_fact_checker.check_claim(statement)
        
#         # Interpret results
#         if fact_check_result['status'] == 'success':
#             accuracy_mapping = {
#                 'True': 1.0,
#                 'Mostly True': 0.8,
#                 'Half True': 0.5,
#                 'Mostly False': 0.2,
#                 'False': 0.0
#             }
            
#             rating = fact_check_result['rating']
#             accuracy_score = accuracy_mapping.get(rating, 0.5)
            
#             return {
#                 'accuracy_score': accuracy_score * 100,
#                 'confidence': fact_check_result['rating'],
#                 'source': fact_check_result['publisher'],
#                 'source_url': fact_check_result['url']
#             }
        
#         # Fallback for no results
#         return {
#             'accuracy_score': 50,  # Neutral score
#             'confidence': 'Unverified',
#             'source': 'No matching fact-checks found',
#             'source_url': None
#         }

# import os
# from typing import Dict, Any
# from dotenv import load_dotenv

# # Import the new AdvancedLocalFactChecker
# from utils.advanced_local_fact_checker import AdvancedLocalFactChecker

# class FactChecker:
#     def __init__(self):
#         # Initialize the advanced local fact checker
#         self.local_fact_checker = AdvancedLocalFactChecker()
    
#     def check_statement_accuracy(self, statement: str) -> Dict[str, Any]:
#         """
#         Updated method to use local NLP-based fact checking
        
#         :param statement: Statement to verify
#         :return: Fact-checking result dictionary
#         """
#         # Verify the claim using local NLP methods
#         verification_result = self.local_fact_checker.verify_claim(statement)
        
#         # Convert verification result to previous method's output format
#         return {
#             "accuracy_score": self._convert_status_to_score(verification_result['status']),
#             "confidence": verification_result['status'],
#             "details": {
#                 "most_similar_fact": verification_result.get('most_similar_fact', ''),
#                 "similarity_score": verification_result.get('similarity_score', 0)
#             }
#         }
    
#     def _convert_status_to_score(self, status: str) -> int:
#         """
#         Convert verification status to a numeric accuracy score
        
#         :param status: Verification status
#         :return: Numeric accuracy score
#         """
#         status_scores = {
#             "Verified": 3,
#             "Potentially False": 1,
#             "Uncertain": 2,
#             "Insufficient Evidence": 0
#         }
#         return status_scores.get(status, 0)
    
#     def add_fact_to_knowledge_base(self, fact: str):
#         """
#         Add a new fact to the local knowledge base
        
#         :param fact: Fact to add
#         """
#         self.local_fact_checker.add_to_knowledge_base(fact)

import requests
import json
import re
import urllib.parse
from typing import Dict, Any, List
import os
from dotenv import load_dotenv

class ImprovedFactChecker:
    def __init__(self):
        # Load environment variables
        load_dotenv()
        
        # Alternative APIs and configuration
        self.apis = {
            'mediastack_news': {
                'endpoint': 'http://api.mediastack.com/v1/news',
                'api_key': '513ba89946be4a1ece0c2957e3ca86b5'
            },
            'gnews_api': {
                'endpoint': 'https://gnews.io/api/v4/search',
                'api_key': 'ae1111f01a572a43f6890024d4873f66'
            },
            'google_fact_check': {
                'endpoint': 'https://factchecktools.googleapis.com/v1alpha1/claims:search',
                'api_key': os.getenv('GOOGLE_FACT_CHECK_API_KEY')
            }
        }
    
    def preprocess_claim(self, claim: str) -> str:
        """
        Preprocess the claim for better search matching
        
        :param claim: Input claim
        :return: Preprocessed claim
        """
        # Remove special characters and extra whitespace
        claim = re.sub(r'[^\w\s]', '', claim)
        
        # Convert to lowercase and truncate for API search
        return claim.lower().strip()[:100]
    
    def search_news_sources(self, claim: str) -> Dict[str, Any]:
        """
        Search multiple news sources for claim verification
        
        :param claim: Claim to verify
        :return: Verification results
        """
        verification_results = {
            'sources': [],
            'credibility_score': 50  # Neutral starting point
        }
        
        # Try GNews API first
        if self.apis['gnews_api']['api_key']:
            try:
                response = requests.get(
                    self.apis['gnews_api']['endpoint'],
                    params={
                        'q': claim,
                        'apikey': self.apis['gnews_api']['api_key'],
                        'max': 5  # Limit to 5 sources
                    }
                )
                
                if response.status_code == 200:
                    gnews_data = response.json()
                    if 'articles' in gnews_data:
                        verification_results['sources'].extend([
                            {
                                'title': article.get('title', 'N/A'),
                                'source': article.get('source', {}).get('name', 'Unknown'),
                                'url': article.get('url', '')
                            } 
                            for article in gnews_data['articles']
                        ])
                        
                        # Increase credibility score based on number of sources
                        verification_results['credibility_score'] += min(25, len(gnews_data['articles']) * 5)
            
            except Exception as e:
                print(f"GNews API error: {e}")
        
        # Fallback to MediaStack if GNews fails or no results
        if not verification_results['sources'] and self.apis['mediastack_news']['api_key']:
            try:
                response = requests.get(
                    self.apis['mediastack_news']['endpoint'],
                    params={
                        'access_key': self.apis['mediastack_news']['api_key'],
                        'keywords': claim,
                        'limit': 5
                    }
                )
                
                if response.status_code == 200:
                    mediastack_data = response.json()
                    if 'data' in mediastack_data:
                        verification_results['sources'].extend([
                            {
                                'title': article.get('title', 'N/A'),
                                'source': article.get('source', 'Unknown'),
                                'url': article.get('url', '')
                            } 
                            for article in mediastack_data['data']
                        ])
                        
                        # Increase credibility score
                        verification_results['credibility_score'] += min(25, len(mediastack_data['data']) * 5)
            
            except Exception as e:
                print(f"MediaStack API error: {e}")
        
        # Normalize credibility score
        verification_results['credibility_score'] = min(max(verification_results['credibility_score'], 0), 100)
        
        return verification_results
    
    def verify_claim(self, claim: str) -> Dict[str, Any]:
        """
        Main method to verify a claim
        
        :param claim: Claim to verify
        :return: Comprehensive verification results
        """
        # Preprocess the claim
        processed_claim = self.preprocess_claim(claim)
        
        # Search for verification sources
        verification_results = self.search_news_sources(processed_claim)
        
        return {
            'original_claim': claim,
            'processed_claim': processed_claim,
            'verification_results': verification_results
        }

    def check_google_facts(self, claim: str) -> Dict[str, Any]:
        """
        Check claim using Google Fact Check API
        """
        if not self.apis['google_fact_check']['api_key']:
            return None

        try:
            response = requests.get(
                self.apis['google_fact_check']['endpoint'],
                params={
                    'query': claim,
                    'key': self.apis['google_fact_check']['api_key']
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'claims' in data and data['claims']:
                    claim = data['claims'][0]
                    return {
                        'rating': claim.get('claimReview', [{}])[0].get('textualRating', 'Not rated'),
                        'publisher': claim.get('claimReview', [{}])[0].get('publisher', {}).get('name', 'Unknown'),
                        'url': claim.get('claimReview', [{}])[0].get('url', ''),
                        'score': self._convert_rating_to_score(claim.get('claimReview', [{}])[0].get('textualRating', 'Unknown'))
                    }
            return None
        
        except Exception as e:
            print(f"Google Fact Check API error: {e}")
            return None

    def _convert_rating_to_score(self, rating: str) -> float:
        """
        Convert textual rating to numerical score
        """
        rating_map = {
            'True': 100,
            'Mostly True': 80,
            'Half True': 50,
            'Mostly False': 20,
            'False': 0,
            'Unknown': 50
        }
        return rating_map.get(rating, 50)

    def check_statement_accuracy(self, statement: str) -> Dict[str, Any]:
        """
        Comprehensive fact checking using multiple sources
        """
        # First check Google Fact Check API
        google_result = self.check_google_facts(statement)
        
        # Then get news source verification
        news_result = self.verify_claim(statement)
        
        if google_result:
            # Prioritize Google Fact Check results if available
            return {
                'accuracy_score': google_result['score'],
                'confidence': google_result['rating'],
                'source': google_result['publisher'],
                'source_url': google_result['url']
            }
        else:
            # Fall back to news source verification
            return {
                'accuracy_score': news_result['verification_results']['credibility_score'],
                'confidence': 'Medium',
                'source': news_result['verification_results']['sources'][0]['source'] if news_result['verification_results']['sources'] else 'No source found',
                'source_url': news_result['verification_results']['sources'][0]['url'] if news_result['verification_results']['sources'] else None
            }

def main():
    fact_checker = ImprovedFactChecker()
    
    # Example claims to verify
    claims = [
        "Climate change is causing more frequent hurricanes",
        "Artificial intelligence will replace most jobs by 2030",
        "Global vaccination rates are increasing"
    ]
    
    for claim in claims:
        print(f"\nVerifying Claim: {claim}")
        result = fact_checker.verify_claim(claim)
        
        print("Processed Claim:", result['processed_claim'])
        print("Credibility Score:", result['verification_results']['credibility_score'])
        
        print("\nRelevant Sources:")
        for source in result['verification_results']['sources']:
            print(f"- {source['title']} (Source: {source['source']})")
            print(f"  URL: {source['url']}")

if __name__ == "__main__":
    main()