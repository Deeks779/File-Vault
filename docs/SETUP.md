<h1>Setup &amp; Configuration Guide</h1>

<p>
  This guide provides detailed instructions for setting up and running the 
  <b>BalkanID File Vault</b> application on a local development machine.
</p>

<hr>

<h2>📦 Prerequisites</h2>
<p>Before you begin, ensure you have the following software installed on your system:</p>
<ul>
  <li><b>Git:</b> For cloning the repository.</li>
  <li><b>Docker:</b> For running the application in containers.</li>
  <li><b>Docker Compose:</b> For orchestrating the multi-container setup.</li>
</ul>

<hr>

<h2>⚙️ Configuration</h2>
<p>
  The application uses <b>environment variables</b> for configuration.  
  You will need to create a <code>.env</code> file in both the 
  <code>backend</code> and <code>frontend</code> directories 
  (based on the provided example files).
</p>

<h3>🔹 Backend Configuration (<code>backend/.env</code>)</h3>
<p>Create a file named <code>.env</code> inside the <code>backend</code> directory and add the following variables:</p>

<table border="1" cellspacing="0" cellpadding="6">
  <thead>
    <tr>
      <th>Variable</th>
      <th>Description</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>DATABASE_URL</code></td>
      <td>The full connection string for the PostgreSQL database (Docker Compose handles this).</td>
      <td><code>postgres://postgres:password@db:5432/filevault</code></td>
    </tr>
    <tr>
      <td><code>JWT_SECRET_KEY</code></td>
      <td>A long, random, secret string used to sign JWTs for authentication.</td>
      <td><code>a-very-long-and-secure-random-string-12345</code></td>
    </tr>
    <tr>
      <td><code>CORS_ORIGIN</code></td>
      <td>The URL of the frontend application allowed to make requests to the backend.</td>
      <td><code>http://localhost:5173</code></td>
    </tr>
  </tbody>
</table>

<h3>🔹 Frontend Configuration (<code>frontend/.env</code>)</h3>
<p>Create a file named <code>.env</code> inside the <code>frontend</code> directory and add the following variable:</p>

<table border="1" cellspacing="0" cellpadding="6">
  <thead>
    <tr>
      <th>Variable</th>
      <th>Description</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>VITE_API_URL</code></td>
      <td>The base URL of the backend API the frontend connects to.</td>
      <td><code>http://localhost:8080</code></td>
    </tr>
  </tbody>
</table>

<hr>

<h2>🚀 Installation &amp; Running</h2>
<p>Follow these steps to get the application running locally:</p>

<ol>
  <li>
    <b>Clone the Repository</b>
    <pre>
git clone https://github.com/BalkanID-University/vit-2026-capstone-internship-hiring-task-Deeks779.git
cd vit-2026-capstone-internship-hiring-task-Deeks779
    </pre>
  </li>

  <li>
    <b>Set Up Environment Files</b>
    <ul>
      <li>Navigate to the <code>backend</code> directory and create a <code>.env</code> file with the variables listed above.</li>
      <li>Navigate to the <code>frontend</code> directory and create a <code>.env</code> file with its variable.</li>
    </ul>
  </li>

  <li>
    <b>Run the Application</b>
    <p>From the <b>root directory</b> of the project, run:</p>
    <pre>
docker-compose up --build
    </pre>
  </li>

  <li>
    <b>Verify It's Working</b>
    <ul>
      <li><b>Frontend Application:</b> Open <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></li>
      <li><b>Backend Health Check:</b> Test a protected API endpoint using <code>curl</code> or a tool like Postman.</li>
    </ul>
  </li>
</ol>

<hr>
