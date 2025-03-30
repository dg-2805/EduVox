import os
import requests
from dotenv import load_dotenv

class GoogleFactChecker:
    def __init__(self):
        # Load API key from environment
        load_dotenv()
        self.api_key = os.getenv('GOOGLE_FACT_CHECK_API_KEY')
        
        if not self.api_key:
            raise ValueError("Google Fact Check API key not found. Set GOOGLE_FACT_CHECK_API_KEY in .env")
        
        self.base_url = "https://factchecktools.googleapis.com/v1alpha1/claims:search"
    
    def check_claim(self, claim_text):
        """
        Check the truthfulness of a claim using Google Fact Check API
        
        Args:
            claim_text (str): The statement to fact-check
        
        Returns:
            dict: Fact-checking results
        """
        params = {
            'query': claim_text,
            'key': self.api_key
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()  # Raise an exception for bad responses
            
            data = response.json()
            
            # Process and return fact-checking results
            return self._process_fact_check_results(data)
        
        except requests.exceptions.RequestException as e:
            print(f"Fact-checking error: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }
    
    def _process_fact_check_results(self, data):
        """
        Process the raw API response
        
        Args:
            data (dict): API response
        
        Returns:
            dict: Processed fact-checking results
        """
        # Check if claims exist in the response
        if 'claims' not in data or not data['claims']:
            return {
                'status': 'no_results',
                'message': 'No fact-checking results found'
            }
        
        # Take the first claim for simplicity
        claim = data['claims'][0]
        
        return {
            'status': 'success',
            'claim': claim.get('text', ''),
            'rating': claim.get('claimReview', [{}])[0].get('textualRating', 'Not rated'),
            'publisher': claim.get('claimReview', [{}])[0].get('publisher', {}).get('name', 'Unknown'),
            'url': claim.get('claimReview', [{}])[0].get('url', '')
        }