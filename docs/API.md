<h1>📖 API Reference Guide</h1>

<p>
  This document provides a reference for the <strong>BalkanID File Vault</strong> REST API, 
  including authentication, available endpoints, and example requests.
</p>

<hr />

<h2>🔐 Authentication</h2>
<p>
  All protected endpoints (<code>/api</code> and <code>/admin</code>) require a JSON Web Token (JWT) 
  in the <code>Authorization</code> header.
</p>

<p><strong>Format:</strong> <code>Authorization: &lt;YOUR_JWT_TOKEN&gt;</code></p>

<p>
  You can obtain a token by sending a <code>POST</code> request to the <code>/login</code> endpoint.
</p>

<hr />

<h2>📌 Endpoints</h2>

<h3>👤 Authentication</h3>

<h4><code>POST /register</code></h4>
<p>Creates a new user account.</p>

<p><strong>Body (JSON):</strong></p>
<pre><code>{
  "username": "newuser",
  "password": "strongpassword123",
  "email": "newuser@example.com"
}
</code></pre>

<p><strong>Success Response (201 Created):</strong></p>
<pre><code>{ "message": "User registered" }
</code></pre>

<h4><code>POST /login</code></h4>
<p>Authenticates a user and returns a JWT.</p>

<p><strong>Body (JSON):</strong></p>
<pre><code>{
  "username": "newuser",
  "password": "strongpassword123"
}
</code></pre>

<p><strong>Success Response (200 OK):</strong></p>
<pre><code>{ "token": "ey..." }
</code></pre>

<hr />

<h3>📂 File Operations (User)</h3>

<h4><code>POST /api/upload</code></h4>
<p>
  Uploads one or more files.  
  This is a <code>multipart/form-data</code> request.
</p>

<p><strong>Headers:</strong> <code>Authorization: &lt;TOKEN&gt;</code></p>

<p><strong>Example <code>curl</code> command:</strong></p>
<pre><code>curl -X POST http://localhost:8080/api/upload \
  -H "Authorization: &lt;TOKEN&gt;" \
  -F "files=@/path/to/your/file1.txt" \
  -F "files=@/path/to/your/image.png"
</code></pre>

<p><strong>Success Response (200 OK):</strong></p>
<pre><code>{
  "files": [
    { "filename": "file1.txt", "status": "uploaded", "id": 1 },
    { "filename": "image.png", "status": "duplicate (reference added)" }
  ]
}
</code></pre>

<h4><code>GET /api/files</code></h4>
<p>Lists all files for the authenticated user.</p>

<p><strong>Headers:</strong> <code>Authorization: &lt;TOKEN&gt;</code></p>

<p><strong>Success Response (200 OK):</strong></p>
<pre><code>{
  "files": [
    {
      "id": 1,
      "filename": "report.pdf",
      "mime_type": "application/pdf",
      "size": 123456,
      "upload_date": "...",
      "ref_count": 1
    }
  ]
}
</code></pre>

<h4><code>GET /api/search</code></h4>
<p>
  Performs an advanced search for files.  
  All query parameters are optional.
</p>

<p><strong>Headers:</strong> <code>Authorization: &lt;TOKEN&gt;</code></p>

<p><strong>Example <code>curl</code> (Search for PDF reports with the "work" tag):</strong></p>
<pre><code>curl -G "http://localhost:8080/api/search" \
  -H "Authorization: &lt;TOKEN&gt;" \
  --data-urlencode "filename=report" \
  --data-urlencode "mime=application/pdf" \
  --data-urlencode "tags=work"
</code></pre>

<p><strong>Success Response (200 OK):</strong></p>
<pre><code>{ "results": [ ... ] }
</code></pre>

<h4><code>DELETE /api/files/:id</code></h4>
<p>Deletes a file owned by the authenticated user.</p>

<p><strong>Headers:</strong> <code>Authorization: &lt;TOKEN&gt;</code></p>

<p><strong>Example <code>curl</code>:</strong></p>
<pre><code>curl -X DELETE http://localhost:8080/api/files/1 \
  -H "Authorization: &lt;TOKEN&gt;"
</code></pre>

<p><strong>Success Response (200 OK):</strong></p>
<pre><code>{
  "message": "File reference deleted. File will be physically removed if no other references exist."
}
</code></pre>

<hr />

<h2>⚠️ Error Responses</h2>

<h4>Rate Limit Exceeded</h4>
<p><strong>Status:</strong> <code>429 Too Many Requests</code></p>
<pre><code>{
  "error": "Rate limit exceeded. Try again later."
}
</code></pre>

<h4>Storage Quota Exceeded</h4>
<p><strong>Status:</strong> <code>403 Forbidden</code></p>
<pre><code>{
  "error": "Storage quota exceeded."
}
</code></pre>
