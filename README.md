<h1>BalkanID Full Stack Engineering Intern — Capstone Hiring Task</h1>

<p>
  A secure file vault system built with a <b>Go backend</b> and a <b>React frontend</b>.  
  This project implements <b>content-based deduplication</b>, <b>secure file sharing</b>, and 
  <b>powerful search capabilities</b> to provide a production-ready file storage solution.
</p>



<hr>

<h2>🚀 Core Features</h2>
<ul>
  <li><b>File Deduplication:</b> Saves storage space by preventing duplicate file storage using SHA-256 hashing.</li>
  <li><b>Secure Authentication & Sharing:</b> User login & registration with JWT tokens, plus file visibility controls (private / public links).</li>
  <li><b>Advanced Search & Filtering:</b> Search by filename, MIME type, upload date, size, and tags.</li>
  <li><b>User Quotas & Rate Limiting:</b> Ensures fair storage usage and prevents API abuse.</li>
  <li><b>Admin Dashboard:</b> System-wide monitoring & management of user files.</li>
</ul>

<hr>

<h2>🛠️ Tech Stack</h2>
<ul>
  <li><b>Backend:</b> Go, Gin Framework, PostgreSQL</li>
  <li><b>Frontend:</b> React, TypeScript, Vite, Tailwind CSS</li>
  <li><b>Containerization:</b> Docker, Docker Compose</li>
  <li><b>Deployment:</b> Vercel (Frontend), Render (Backend & Database)</li>
</ul>

<hr>

<h2>📂 Project Structure</h2>
<pre>
.
├── backend/
│   ├── main.go             # Main application entry point
│   ├── internal/
│   │   ├── db/             # Database models & migrations
│   │   ├── handlers/       # API route handlers
│   │   └── middleware/     # Auth & request middlewares
│   │   ├── models/         # Data Structure
│   │   ├── utils/          # Hashing, JWT and Encrypting
│   ├── Dockerfile          # Production Dockerfile for Go
│   ├── go.sum 
│   └── go.mod
├── docs/
│   ├── API.md              # REST API documentation
│   ├── ARCHITECTURE.md     # System design & flow
│   ├── DATABASE.md         # Database schema & ER diagram
│   └── SETUP.md            # Setup & configuration steps
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api.ts          # API client logic
│   │   ├── assets/         # Images, icons, styles
│   │   ├── context/        # Reuaseable Data by other components
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page-level React components
│   │   └── App.tsx         # Main entry component
│   ├── index.html
│   └── package.json
├── .gitignore
├── docker-compose.yml
├── render.yaml             # Deployment configuration
└── README.md
</pre>

<hr>

<h2>⚡ Quick Start</h2>
<p>To run this project locally, ensure <b>Docker</b> and <b>Docker Compose</b> are installed.</p>

<ol>
  <li><b>Clone the repository</b>
    <pre>
git clone https://github.com/BalkanID-University/vit-2022-capstone-internship-hiring-task-Deeks779.git
cd vit-2022-capstone-internship-hiring-task-Deeks779
    </pre>
  </li>

  <li><b>Setup environment variables</b>
    <p>Create a <code>.env</code> file inside <code>backend/</code> with:</p>
    <pre>
DATABASE_URL=your_postgres_connection_url
JWT_SECRET_KEY=your_secret_key
    </pre>
  </li>

  <li><b>Run the application</b>
    <pre>
docker-compose up --build
    </pre>
  </li>

  <li><b>Access the services</b>
    <ul>
      <li>Frontend: <a href="http://localhost:5173">http://localhost:5173</a></li>
      <li>Backend API: <a href="http://localhost:8080">http://localhost:8080</a></li>
    </ul>
  </li>
</ol>

<hr>

<h2>📖 Documentation</h2>
<ul>
  <li><a href="./docs/SETUP.md">Setup & Configuration</a> → Local setup and environment variable details</li>
  <li><a href="./docs/ARCHITECTURE.md">Architecture Overview</a> → System design & technical decisions</li>
  <li><a href="./docs/DATABASE.md">Database Schema</a> → Tables, relationships, and migrations</li>
  <li><a href="./docs/API.md">API Reference</a> → REST API endpoints with examples</li>
</ul>

<hr>

<h2>👩‍💻 Author</h2>
<p><b>Deeksha Kushwaha</b><br>
Capstone Project for <b>BalkanID Full Stack Engineering Intern Hiring Task</b></p>

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/2xw7QaEj)
