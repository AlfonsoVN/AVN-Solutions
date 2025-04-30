import groq
from django.conf import settings

class GroqService:
    def __init__(self):
        self.client = groq.Client(api_key=settings.GROQ_API_KEY)

    def generate_response(self, prompt):
        response = self.client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="mixtral-8x7b-32768",
        )
        return response.choices[0].message.content
