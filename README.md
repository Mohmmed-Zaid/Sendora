✨ Sendora: Your AI-Powered Email Reply Sidekick
Revolutionize your inbox with intelligent email replies powered by Google Gemini AI

Sendora is a full-stack application that intelligently generates professional email replies using cutting-edge AI technology. Built with Spring Boot backend, React frontend, and seamless Chrome Extension integration, Sendora eliminates writer's block and streamlines your email communication.

📸 Screenshots
React Frontend Interface
![Sendora Frontend](screenshot/Screenshot (124).png) Clean and intuitive interface for generating AI-powered email replies

Chrome Extension in Action
![Chrome Extension](screenshot/Screenshot (127).png) Seamlessly integrated into Gmail for instant reply generation

Application Dashboard
![Application Dashboard](screenshot/Screenshot (125).png) Complete overview of Sendora's powerful features

🌟 Features
🤖 AI-Powered Replies: Generate contextually relevant and grammatically perfect email responses using Google Gemini AI
✍️ Customizable Tone: Choose from professional, friendly, formal, or concise tones to match your communication style
📧 Seamless Integration: Chrome Extension enables direct reply generation from your favorite webmail clients like Gmail
🛡️ Secure Backend: Robust Spring Boot backend ensures fast and secure AI API calls
🚀 Modern UI: Responsive and intuitive React frontend for an exceptional user experience
🏗️ Architecture
graph TD
    A[React Frontend<br/>localhost:5173] -->|POST /api/email/generate| B[Spring Boot Backend<br/>localhost:8080]
    C[Chrome Extension] -->|POST /api/email/generate| B
    B -->|API Call| D[Google Gemini API<br/>gemini-1.0-pro]
    D -->|AI Response| B
    B -->|Generated Reply| A
    B -->|Generated Reply| C
Components
React Frontend (localhost:5173): Clean interface for email content input and tone selection
Spring Boot Backend (localhost:8080): REST API that processes requests and communicates with Gemini AI
Chrome Extension: In-browser assistant for seamless webmail integration
Google Gemini API: Large language model powering intelligent email generation
🚀 Quick Start
Prerequisites
Java Development Kit (JDK) 17+
Maven 3.6+
Node.js 18+ and npm (or Yarn)
Google Cloud Project with Generative Language API enabled
Google Gemini API Key
1. Backend Setup
# Clone the repository
git clone https://github.com/your-username/Sendora.git
cd Sendora/backend

# Configure API key in src/main/resources/application.properties
# Replace YOUR_GEMINI_API_KEY_HERE with your actual API key
application.properties:

spring.application.name=Sendora
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=
gemini.api.key=YOUR_GEMINI_API_KEY_HERE
# Build and run
mvn clean install
mvn spring-boot:run
2. Frontend Setup
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
# or yarn install

# Start development server
npm run dev
# or yarn dev
3. Chrome Extension Setup
# Navigate to extension directory
cd ../chrome-extension
Load in Chrome:

Open chrome://extensions
Enable "Developer mode"
Click "Load unpacked" and select the chrome-extension folder
🎯 Usage
React Frontend
Open http://localhost:5173
Enter your email content
Select desired tone (optional)
Click "Generate Reply"
Copy your AI-generated response
Chrome Extension
Navigate to Gmail or your preferred webmail
Look for Sendora's UI elements
Click the Sendora button to generate contextual replies
Use the generated text directly in your email
🐛 Troubleshooting
Common Issues
Backend Logs: Check Spring Boot console for detailed error messages

Look for: WebClient error calling Gemini API: Status - [CODE], Response Body - [JSON_ERROR_MESSAGE]
CORS Errors: Ensure your EmailGenerator controller includes:

@CrossOrigin(origins = {"http://localhost:5173", "chrome-extension://*"})
API Key Issues:

Verify key has Generative Language API access
Check for typos in application.properties
Ensure billing is enabled in Google Cloud Console
Network Issues:

Confirm backend is running on localhost:8080
Check browser Network tab for request/response details
Verify model name is gemini-1.0-pro
🌟 Roadmap
[ ] Streaming Responses: Real-time text generation
[ ] User Authentication: Secure user accounts and reply history
[ ] Enhanced Error Handling: User-friendly error messages
[ ] Smart Context Detection: Improved Chrome Extension intelligence
[ ] Advanced Gemini Features: Function calling and richer interactions
🤝 Contributing
We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Google Gemini AI for powering intelligent email generation
Spring Boot and React communities for excellent frameworks
Chrome Extension developers for seamless browser integration
Built with ❤️ by the Team

Transform your email experience today with AI-powered communication!
