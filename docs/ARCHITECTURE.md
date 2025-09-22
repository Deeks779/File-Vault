<h1>🏗️ Architecture Overview</h1>

<p>
  This document explains the high-level architecture of the <strong>BalkanID File Vault</strong> application, 
  along with the key technical decisions made during its development.
</p>

<hr />

<h2>🌐 High-Level Overview</h2>

<p>
  This project is a <strong>containerized, full-stack application</strong> orchestrated with 
  <strong>Docker Compose</strong>. It consists of three main services:
</p>

<ol>
  <li>
    <strong>⚛️ React Frontend:</strong> A modern single-page application (SPA) built with 
    <em>TypeScript</em> and <em>Vite</em>, providing a fast and responsive user interface.
  </li>
  <li>
    <strong>🐹 Go Backend:</strong> A robust REST API server built with the <em>Gin framework</em>, 
    responsible for business logic, authentication, and file management.
  </li>
  <li>
    <strong>🗄️ PostgreSQL Database:</strong> A relational database that persists all 
    <code>user</code> and <code>file</code> metadata.
  </li>
</ol>

<p>
  The React frontend communicates with the Go backend via a <strong>RESTful API</strong>, and the entire 
  environment is designed to be <em>portable</em> and <em>easy to run locally or deploy to the cloud</em>.
</p>

<hr />

<h2>🧩 Key Design Decisions</h2>

<h3>📦 File Deduplication Strategy</h3>
<p>
  To optimize storage, the system ensures the same file content is never stored more than once per user. 
  Deduplication is handled through the <code>files</code> table:
</p>

<ol>
  <li>When a user uploads a file, it is temporarily saved, and its <strong>SHA-256 hash</strong> is calculated.</li>
  <li>The backend checks if a record with the same <code>hash</code> and <code>user_id</code> exists.</li>
  <li>
    <strong>If a match is found:</strong> The <code>ref_count</code> of the existing record is incremented, 
    and the uploaded file is discarded (no duplicate storage).
  </li>
  <li>
    <strong>If no match is found:</strong> A new record is created, the file is saved, and 
    <code>ref_count</code> defaults to <code>1</code>.
  </li>
</ol>

<hr />

<h3>🔌 API Layer (REST)</h3>
<p>
  A <strong>REST API</strong> was chosen for its simplicity, widespread adoption, and strong support in Go and 
  frontend libraries like Axios. 
</p>
<ul>
  <li>Clear, conventional structure for CRUD operations (perfect for file management).</li>
  <li>All endpoints are <strong>stateless</strong> and secured with <strong>JWT authentication</strong>.</li>
</ul>

<hr />

<h3>⚖️ Rate Limiting & Quotas</h3>
<p>
  To ensure <em>server stability</em> and <em>fair usage</em>, two middleware layers are used in the Go backend:
</p>

<ul>
  <li>
    <strong>Rate Limiting:</strong> Implements a <em>token bucket algorithm</em> per user.  
    - Each request consumes a token.  
    - Empty bucket → <code>429 Too Many Requests</code> until refill.
  </li>
  <li>
    <strong>Storage Quotas:</strong> Each upload request is checked against the user’s <code>storage_quota</code>.  
    - If exceeded → <code>403 Forbidden</code>.
  </li>
</ul>

<hr />