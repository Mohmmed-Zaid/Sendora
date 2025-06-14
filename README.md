✨ Sendora: Your AI-Powered Email Reply Sidekick! ✨
Tired of crafting emails? Sendora is here to revolutionize your inbox! This full-stack application intelligently generates professional email replies using the cutting-edge Google Gemini AI. It's built with a powerful Spring Boot backend, a sleek React frontend, and integrates seamlessly with your email client via a Chrome Extension. Say goodbye to writer's block and hello to effortless communication!
🌟 What Sendora Can Do For You
AI-Powered Replies: Get contextually relevant and grammatically perfect email responses, crafted by Gemini AI. 🤖
Customizable Tone: Need to be professional, friendly, formal, or just concise? Specify your desired tone and let Sendora do the rest. ✍️
Seamless Integration: A handy Chrome Extension lets you generate replies directly from your favorite webmail, like Gmail. No more copy-pasting! 📧
Robust & Secure Backend: Our Spring Boot backend handles all the heavy lifting, ensuring your AI calls are fast and secure. 🛡️
Modern User Experience: A responsive and intuitive React frontend makes interacting with Sendora a breeze. 🚀
🏗️ The Brains Behind Sendora: Our Architecture
Sendora is a symphony of interconnected components, each playing a vital role in delivering smart email replies:
React Frontend (http://localhost:5173): This is where you, the user, interact with Sendora. It provides a clean interface to input your email content and desired tone, sending these requests to our backend.
Spring Boot Backend (http://localhost:8080): The workhorse of the application! It exposes a REST API endpoint (/api/email/generate) that:
Receives your email content and tone.
Crafts a tailored prompt for the AI.
Makes a secure call to the Google Gemini API (gemini-1.0-pro model).
Processes the AI's response and sends the generated email text back.
Chrome Extension: Your in-browser assistant! Designed to live within your webmail interface, it intelligently captures email context and sends it to the Spring Boot backend, then pops the AI-generated reply right where you need it.
Google Gemini API: The true genius! This powerful large language model is where the magic happens. It takes your prompt and generates highly relevant and coherent email responses.
graph TD
    A[React Frontend: http://localhost:5173] -->|API Request (POST /api/email/generate)| B(Spring Boot Backend: http://localhost:8080)
    C[Chrome Extension] -->|API Request (POST /api/email/generate)| B
    B -->|API Call (POST to Gemini API)| D(Google Gemini API)
    D -->|AI-Generated Text| B
    B -->|Email Reply (JSON/Text)| A
    B -->|Email Reply (JSON/Text)| C


🚀 Get Sendora Up and Running!
Ready to supercharge your email game? Follow these simple steps:
Prerequisites
Make sure you have these installed:
Java Development Kit (JDK) 17+
Maven 3.6+
Node.js 18+ and npm (or Yarn)
A Google Cloud Project with the Generative Language API enabled.
A Google Gemini API Key from the Google Cloud Console.
1. Backend Setup (Spring Boot)
Clone the repository:
git clone https://github.com/your-username/Sendora.git
cd Sendora/backend # Navigate to your Spring Boot project folder


Configure Your Gemini API Key:
Open src/main/resources/application.properties.
Find the line gemini.api.key=YOUR_GEMINI_API_KEY_HERE and replace YOUR_GEMINI_API_KEY_HERE with your actual, valid API Key.
spring.application.name=Sendora
gemini.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=
gemini.api.key=AIzaSyADs91TPsewGQJZ5bkTrEP7EdIG96DPWeo


Crucial Tip: In Google Cloud Console -> APIs & Services -> Credentials -> Your API Key, ensure:
Generative Language API is explicitly enabled for this key.
Application restrictions are set to "None" for local development, or your localhost IP/domains are whitelisted.
Billing is enabled for your Google Cloud Project (even for free tier usage).
Build and Run the Backend:
mvn clean install
mvn spring-boot:run

You should see the backend start on http://localhost:8080. Confirm this in your console logs (e.g., "Tomcat initialized with port(s): 8080").
2. Frontend Setup (React)
Navigate to the frontend directory:
cd ../frontend # Go to your React project folder


Install dependencies:
npm install
# or
yarn install


Start the React development server:
npm run dev
# or
yarn dev

Your frontend will open in your browser, usually at http://localhost:5173.
3. Chrome Extension Setup
This is how Sendora plugs directly into your browser!
Navigate to the extension directory:
cd ../chrome-extension # Go to your Chrome Extension project folder


Load the extension in Chrome:
Open Google Chrome and go to chrome://extensions.
Toggle "Developer mode" ON (top right corner).
Click on "Load unpacked" and select the folder where your manifest.json file resides (e.g., the chrome-extension folder).
Verify CORS in Backend:
Your Spring Boot EmailGenerator controller (in src/main/java/com/mtc/Sendora/controller/EmailGenerator.java) must have http://localhost:5173 and chrome-extension://* (or specific extension ID) in its @CrossOrigin annotation. If you edit this, restart your Spring Boot backend.
🎯 How to Use Sendora
Using the React Frontend
Open http://localhost:5173 in your browser.
Type or paste your email content into the input area.
(Optional) Choose a tone from a dropdown or type it in.
Hit the "Generate Reply" button! 🪄
Watch as your AI-powered reply instantly appears.
Using the Chrome Extension
Once the extension is loaded, simply navigate to your preferred webmail (e.g., Gmail).
Look for Sendora's injected UI elements or buttons near your email composer or viewer.
Click the Sendora button to magically generate a reply based on the email context. ✨
The generated text will be ready for you to use!
troubleshoot 🐛 Squashing Bugs
Encountering a snag? Don't worry, here's how to debug common issues:
Backend Logs (Your Best Friend!): 🕵️‍♀️
Always check your Spring Boot console for ERROR messages.
The most insightful message will be: WebClient error calling Gemini API: Status - [CODE], Response Body - [JSON_ERROR_MESSAGE].
The JSON_ERROR_MESSAGE from Google tells you the exact problem (e.g., PERMISSION_DENIED, NOT_FOUND, BILLING_DISABLED, QUOTA_EXCEEDED). This is key!
Browser Console/Network Tab: 🌐
CORS Errors: If you see "Access to XMLHttpRequest... has been blocked by CORS policy", ensure http://localhost:5173 and chrome-extension://* (or the specific extension ID) are present in the @CrossOrigin annotation in your Spring Boot EmailGenerator controller. Always restart your backend after CORS changes!
Network Status: In the Network tab, check the status code of the request to http://localhost:8080/api/email/generate.
200 OK: Request succeeded! Look at the response body.
4xx (e.g., 400 Bad Request, 404 Not Found): Client-side issue, or backend couldn't find resource/process request.
5xx (e.g., 500 Internal Server Error): Backend issue. Check backend logs immediately.
(pending) or (failed): Often a CORS block or the backend isn't running.
Gemini Model Name Check: 🧐
Confirm src/main/resources/application.properties specifies gemini-1.0-pro for gemini.api.url. This is a common 404 NOT_FOUND fix!
API Key Validation: 🔑
Typos: Double-check your gemini.api.key in application.properties for any typos or hidden spaces. Copy-pasting directly from Google Cloud Console is safest.
Permissions: In Google Cloud Console, verify that your API key specifically has access to the Generative Language API.
Billing: Ensure billing is enabled for your Google Cloud Project.
Backend Running? 🏃‍♀️
Always confirm your Spring Boot backend is actively running on http://localhost:8080 by checking its startup logs for "Tomcat initialized..." messages.
🌟 What's Next for Sendora?
We're always looking to enhance Sendora's capabilities! Here are some ideas:
Streaming Responses: Get AI replies even faster with real-time text generation. ⚡
User Authentication & History: Securely save and retrieve your past generated replies. 🔒
Advanced Error Feedback: More user-friendly messages for a smoother experience. 💬
Smarter Extension: Intelligent context detection and customizable UI injection for the Chrome Extension. 🧠
Explore More Gemini Features: Integrate advanced capabilities like function calling for richer interactions. ⚙️
📜 License
This project is open-source and available under the MIT License. Feel free to explore, contribute, and enhance!
