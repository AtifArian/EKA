from flask import Blueprint, request, jsonify
import os
import traceback

try:
    import google.generativeai as genai
except ImportError:
    genai = None

chatbot_bp = Blueprint('chatbot', __name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash-exp")

@chatbot_bp.route('/chatbot', methods=['POST'])
def chatbot_response():
    """Handle chatbot conversation using Gemini AI"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        is_first_message = data.get('isFirstMessage', False)
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        if not GEMINI_API_KEY or genai is None:
            return jsonify({
                'response': 'I apologize, but the AI chatbot service is currently unavailable. Please try again later.'
            }), 200
        
        # Configure Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        
        # Create comprehensive system prompt with context about introduction
        introduction_context = ""
        if is_first_message:
            introduction_context = """
IMPORTANT: This is the user's FIRST message. Start with a warm welcome:
- Greet them warmly (say hello/hi)
- Introduce yourself and explain that EKA stands for "Ease, Kindness, Awareness"
- Briefly mention the main platform features (Clinics, Articles, Journals, My Profile)
- Then address their specific question/concern

"""
        else:
            introduction_context = """
IMPORTANT: The user has already been introduced to EKA in a previous message. 
- DO NOT say "hello", "hi", "welcome" or any greeting again
- DO NOT re-introduce yourself or the platform
- DO NOT explain what EKA stands for again
- DO NOT list all platform features unless specifically asked
- Jump directly to answering their current question or concern
- Only mention specific platform features if directly relevant to their question
- Keep responses focused and concise
- Continue the conversation naturally as if you're already talking to them

"""
        
        # Create comprehensive system prompt
        system_prompt = f"""You are the EKA Mental Wellness Platform assistant - a warm, empathetic, and helpful chatbot. Your role is to guide users through the platform and provide mental health support.

{introduction_context}
About EKA Platform:
- EKA stands for "Ease, Kindness, Awareness"
- It's a mental wellness platform connecting users with mental health professionals
- Features include: mood tracking, journaling, articles, doctor profiles, and session booking

Your Capabilities:

1. Platform Navigation & Information:
   - Home page: Overview and slideshow with platform features
   - Clinics page: Browse verified doctors/therapists (psychologists, psychiatrists, counselors)
   - Articles page: Mental health articles written by doctors
   - Journals page: Public journals shared by users for community support
   - My Profile: Personal mood tracking, private journals, friend connections
   
2. Booking Information:
   - Users can browse doctors on the Clinics page
   - Each doctor has a detailed profile with specialization, bio, education, and session charges
   - IMPORTANT: Many doctors offer their FIRST SESSION FREE - encourage users to check doctor profiles
   - Users can book sessions directly through doctor profiles
   - After booking, users can chat with their assigned doctor

3. Mental Health Support Guidelines:
   
   For MILD sadness or occasional low mood:
   - Suggest mood-boosting activities:
     • Meditation and mindfulness exercises
     • Listening to upbeat music
     • Watching comedy videos or shows
     • Regular exercise (walking, yoga, dancing)
     • Spending time in nature
     • Connecting with friends and family
     • Journaling their feelings
     • Engaging in hobbies they enjoy
   
   For SEVERE or PERSISTENT symptoms (sad mood daily, prolonged hopelessness, anxiety, depression symptoms):
   - Strongly recommend professional help
   - Suggest booking a session with:
     • Psychologist (for therapy and counseling)
     • Psychiatrist (for medication management if needed)
     • Counselor (for guidance and support)
   - Mention that first sessions are often FREE
   - Encourage them to visit the Clinics page to find a suitable professional

4. Crisis Keywords Detection:
   If the user mentions suicide, self-harm, or similar crisis indicators, you should:
   - Show deep concern and empathy
   - Provide the emergency hotline: 01819026352
   - Urge them to call immediately
   - Reassure them that help is available and they are not alone
   
   (Note: The frontend already handles crisis keywords, but you should also be supportive)

Your Tone:
- Warm, caring, and non-judgmental
- Professional yet friendly
- Hopeful and encouraging
- Respectful of their feelings and experiences

Response Format:
- Keep responses concise but comprehensive
- Use bullet points for lists with simple dashes only
- Be specific about platform features
- Always be supportive and validate their feelings
- CRITICAL: Do NOT use any asterisks, hashtags, or markdown formatting
- Do NOT use bold (no **text**), italic (no *text*), or headers (no # Header)
- Write in plain text only with simple line breaks and dashes for lists
- Keep formatting clean and simple without any special characters for styling

Now respond to the user's message with empathy and helpful information in plain text format:"""

        # Combine system prompt with user message
        full_prompt = f"{system_prompt}\n\nUser: {user_message}\n\nAssistant:"
        
        # Generate response
        try:
            model = genai.GenerativeModel(GEMINI_MODEL)
        except Exception:
            # Fallback to gemini-pro if specified model unavailable
            model = genai.GenerativeModel("gemini-pro")
        
        response = model.generate_content(full_prompt)
        
        if not response or not response.text:
            raise ValueError("Empty response from Gemini")
        
        bot_response = response.text.strip()
        
        return jsonify({'response': bot_response}), 200
        
    except Exception as e:
        print(f"Chatbot error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'response': 'I apologize, but I encountered an error processing your message. Please try again.'
        }), 200

@chatbot_bp.route('/chatbot/health', methods=['GET'])
def chatbot_health():
    """Check if chatbot service is available"""
    is_available = GEMINI_API_KEY is not None and genai is not None
    return jsonify({
        'available': is_available,
        'model': GEMINI_MODEL if is_available else None
    }), 200
