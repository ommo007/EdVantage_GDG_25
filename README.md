# EdVantage - AI for Education Equity 🚀

**Solutions Challenge Submission: AI for a better tomorrow**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<!-- Add other relevant badges here if you have them (e.g., build status, deployment status) -->

**Team:** EdVantage
**Team Leader:** Om Mohite
**Live MVP:** [https://edvantage-gdg.vercel.app](https://edvantage-gdg.vercel.app)

---

## 🎯 Project Overview

EdVantage is an AI-powered educational platform designed to tackle the critical issue of **Uneven Access to Quality Education in the Digital Age**. Our mission is to bridge the educational gap for students in underserved communities by leveraging Artificial Intelligence to provide accessible, personalized, and holistic learning support directly within schools.

---

## ❓ The Problem

Millions of students worldwide, especially in underserved areas, face significant barriers to quality education due to:

*   📉 **Poor Infrastructure:** Lack of necessary digital hardware and connectivity.
*   📚 **Limited Resources:** Insufficient access to up-to-date textbooks, learning materials, and tools.
*   🧑‍🏫 **Lack of Skilled Educators:** Shortage of trained teachers or overburdened staff.

This educational disparity fuels cycles of poverty and inequality, limiting individual potential and community growth.

---

## ✨ Our Solution: EdVantage

EdVantage aims to unlock equal access to quality education by providing an integrated AI platform with the following core components:

*   🤖 **AI-Powered Learning Support:** An AI assistant (like 'balmitra') provides real-time answers, explanations, and study materials, acting as a supplementary tutor.
*   🏫 **Centralized Learning in Schools:** The platform is designed for classroom use, ensuring students can access AI benefits even *without* personal devices or internet access at home.
*   🧠 **Tailored Syllabus & Adaptive Learning:** AI adapts educational content based on individual student performance and learning pace, enhancing understanding and critical thinking.
*   🤸 **Holistic Development:** Integrates suggestions for physical and well-being activities alongside academic learning.

**Our Vision:** "EdVantage - Education for All, Powered by AI"

---

## 🔑 Key Features

EdVantage offers tailored features for all stakeholders in the educational ecosystem:

**For Students:**
*   ✅ **AI-Assisted Q&A:** Get instant answers to academic questions.
*   ✅ **School-Based Access:** Learn with AI directly in the classroom – no personal device needed.
*   ✅ **AI-Powered Assessments:** Auto-generated, adaptive quizzes and assignments.
*   ✅ **Multilingual Support:** Content available in English, Hindi, and Marathi (expandable).
*   ✅ **Real-World Skills:** Courses on essential life skills like financial literacy.

**For Instructors:**
*   ✅ **AI Teaching Assistant:** Real-time explanations, study resources, and classroom support.
*   ✅ **Simplified Content Creation:** AI helps generate quizzes, assignments, and lesson plans.
*   ✅ **Whiteboard Integration:** Easy-to-use digital board features for visual learning.
*   ✅ **Language Barrier Solution:** Multilingual content to support diverse classrooms.

**For Administrators:**
*   ✅ **Centralized AI Setup:** Easy deployment within school infrastructure.
*   ✅ **Automated Performance Tracking:** Insights into student progress and engagement.
*   ✅ **Cost-Effective & Scalable:** AI learning without expensive individual hardware.
*   ✅ **Bridging the Resource Gap:** AI support for schools with limited teacher availability.

---

## 💡 Opportunities & Unique Value (USP)

*   **AI as a Classroom Partner:** Enhances learning by assisting *both* students and teachers.
*   **Device-Free Learning:** Focuses on equitable access within the school environment.
*   **Smarter Curriculum Integration:** AI supplements existing lessons to deepen understanding.
*   **Mind & Body Focus:** Promotes overall well-being alongside academic growth.

---

## 🛠️ Technology Stack

*   **Frontend:** React + Vite.js
*   **Backend:** Flask (Python)
*   **Database & Auth:** Supabase (PostgreSQL)
*   **AI / LLM:** Google Gemini API
*   **Web Search Integration:** Tavily API
*   **Deployment (Frontend):** Vercel
*   **Deployment (Backend):** Render
*   **Other Tools:** Firebase (Potentially for future enhancements/auth)

---

## 🏗️ Architecture

*(Consider adding the architecture diagram image from Slide 6 here)*


Our architecture separates the frontend (user interface) from the backend (logic, database interaction, AI calls). Role-based authentication ensures secure access for students, teachers, and administrators.

---

## 🚀 Getting Started (Development Setup)

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ommo007/EdVantage_GDG_25.git
    cd EdVantage_GDG_25
    ```

2.  **Setup Frontend:**
    ```bash
    cd frontend
    npm install
    # Create a .env file based on .env.example and add your Supabase keys, etc.
    # VITE_SUPABASE_URL=YOUR_SUPABASE_URL
    # VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    npm run dev
    ```

3.  **Setup Backend:**
    ```bash
    cd ../backend
    # Create a virtual environment (recommended)
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    # Create a .env file based on .env.example and add your API keys
    # GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    # TAVILY_API_KEY=YOUR_TAVILY_API_KEY
    # DATABASE_URL=YOUR_SUPABASE_POSTGRES_CONNECTION_STRING
    flask run
    ```

4.  Access the application typically at `http://localhost:5173` (Vite default) and the backend API will be running (usually on port 5000).

---

## ✨ MVP Screenshots

*(Consider adding screenshots from Slide 8 here)*

![MVP - AI Assistant Text Response](<link_or_path_to_screenshot_1.png>)
*Caption: AI Assistant providing text-based help for adding fractions.*

![MVP - AI Assistant Video Suggestion](<link_or_path_to_screenshot_2.png>)
*Caption: AI Assistant suggesting relevant YouTube videos based on student request.*

---

## 🤝 Contributing

We welcome contributions! Please feel free to open an issue to discuss potential changes or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Thank you for checking out EdVantage!
