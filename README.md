<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Study Group Finder & Collaboration Platform - README</title>
</head>
<body>

  <h1>Study Group Finder & Collaboration Platform</h1>

  <h2>🎯 Project Statement</h2>
  <p>
    The <strong>Study Group Finder & Collaboration Platform</strong> is a modern, full-stack web application designed to help students connect with peers in the same courses to form effective study groups. 
    Users can create profiles, list their enrolled courses, discover classmates, and collaborate using built-in communication and productivity tools.
  </p>
  <p>This platform enhances academic networking, improves study efficiency, and simplifies group work coordination.</p>

  <h2>👥 Team Members</h2>
  <ul>
    <li><strong>Abhishek</strong> – Frontend & Backend Developer</li>
    <li><strong>Navdeep</strong> – Frontend Developer</li>
    <li><strong>Deepika</strong> – Frontend Developer</li>
    <li><strong>Sainath</strong> – Backend Developer</li>
  </ul>

  <h2>✨ Features</h2>

  <h3>✅ Completed</h3>
  <ul>
    <li><strong>Authentication & Security</strong>
      <ul>
        <li>JWT-based login/registration</li>
        <li>Password hashing with Spring Security</li>
        <li>Email-based password reset</li>
        <li>Session management (Remember Me)</li>
      </ul>
    </li>
    <li><strong>User Profile Management</strong>
      <ul>
        <li>Full profile creation with academic details</li>
        <li>Avatar upload </li>
        <li>University, degree, and personal bio</li>
      </ul>
    </li>
    <li><strong>Course Management</strong>
      <ul>
        <li>Browse and search courses</li>
        <li>Enroll/unenroll in courses</li>
        <li>Track peers in courses</li>
      </ul>
    </li>
    <li><strong>Dashboard</strong>
      <ul>
        <li>Display enrolled courses</li>
        <li>Joined study groups count</li>
        <li>Suggested peers count</li>
      </ul>
    </li>
  </ul>

  <ul>
    <li><strong>Study Groups</strong>
      <ul>
        <li>Create and manage public/private groups</li>
        <li>Join group requests and approvals</li>
        <li>Member management</li>
        <li>Group discovery and filtering</li>
      </ul>
    </li>
    <li><strong>Communication</strong>
      <ul>
        <li>Real-time chat</li>
        <li>Group messaging</li>
        <li>Direct messaging</li>
      </ul>
    </li>
     <h3>🚧 In Progress</h3>
    <li><strong>Calendar & Scheduling</strong>
      <ul>
        <li>Schedule study sessions</li>
        <li>Event reminders (email/push notifications)</li>
        <li>Group calendar integration</li>
      </ul>
    </li>
  </ul>

  <h2>🛠️ Tech Stack</h2>

  <h3>Frontend</h3>
  <ul>
    <li>React 18 (with Vite)</li>
    <li>Tailwind CSS</li>
    <li>React Router</li>
  </ul>

  <h3>Backend</h3>
  <ul>
    <li>Spring Boot 3.5.6 (Port: 8145)</li>
    <li>Spring Security, Spring Data JPA</li>
    <li>MySQL 8+ (Database: <code>study_groupdb</code>)</li>
    <li>JWT Authentication</li>
    <li>Lombok</li>
    <li>SpringDoc OpenAPI (Swagger)</li>
  </ul>

  <h3>Third-Party Services</h3>
  <ul>
    <li>Gmail SMTP (Email Notifications)</li>
  </ul>

  <h2>📦 Prerequisites</h2>
  <ul>
    <li>Java 17+</li>
    <li>Node.js 18.x+ & npm</li>
    <li>MySQL 8+</li>
    <li>Maven 3.8+</li>
    <li>Git</li>
  </ul>

  <h2>🚀 Installation</h2>
  <ol>
    <li><strong>Clone the Repository</strong></li>
    <li><strong>Database Setup</strong> – Create a MySQL database named <code>study_groupdb</code>.</li>
    <li><strong>Backend Setup</strong> – Follow the guide below to configure local properties.</li>
    <li><strong>Frontend Setup</strong> – Install dependencies and link the backend port (8145).</li>
  </ol>

  <h2>⚙️ Configuration (Backend)</h2>

  <h3>📂 File Locations</h3>
  <ul>
    <li><strong>application.properties</strong> → <code>D:\SGF_Collaboration\backend\src\main\resources\application.properties</code></li>
    <li><strong>application-local.properties</strong> → <code>..\SGF_Collaboration\backend\src\main\resources\application-local.properties</code></li>
  </ul>

  <div class="note">
    <strong>Note:</strong> The <code>application-local.properties</code> file is <strong>ignored in Git</strong> (listed in <code>.gitignore</code>).  
    Each developer must create this file manually at the specified location.
  </div>

  <h3>⚙️ application.properties</h3>
  <pre><code># Common settings
spring.application.name=backend
server.port=8145

# Default profile
spring.profiles.active=local

# JPA common configs
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
</code></pre>

  <h3>🧩 application-local.properties (Create Manually)</h3>
  <pre><code># 1. LOCAL DATABASE CONFIG
spring.datasource.url=jdbc:mysql://localhost:3306/study_groupdb?serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# 2. EMAIL CONFIGURATION
spring.mail.protocol=smtp
spring.mail.host=smtp.gmail.com
spring.mail.port=465
spring.mail.username=your_mail@gmail.com
spring.mail.password=your_password

spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.ssl.enable=true
spring.mail.properties.mail.smtp.socketFactory.class=javax.net.ssl.SSLSocketFactory
spring.mail.properties.mail.debug=true

spring.mail.properties.mail.smtp.connectiontimeout=60000 
spring.mail.properties.mail.smtp.timeout=60000
spring.mail.properties.mail.smtp.writetimeout=60000

# 3. JWT Configuration
jwt.secret=ThisIsASecretKeyForJWTsThatShouldBeLongAndSecureAndDifferent
jwt.expiration.ms=86400000
jwt.expiration=86400000

# 4. Logging Configuration
logging.level.org.springframework.security=DEBUG
logging.level.com.studyGroup.backend.config.JwtAuthFilter=DEBUG

# 5. File Upload Settings
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# File storage location (use a local path for development)
file.upload-dir=document-storage
</code></pre>

  <div class="note">
    <strong>Important:</strong>
    <ul>
      <li>Update <code>spring.datasource.password</code> with your MySQL root password.</li>
      <li>Replace <code>your_mail@gmail.com</code> and <code>your_password</code> with your credentials or Gmail App Password.</li>
      <li>Do not push this file to GitHub — it contains sensitive data.</li>
    </ul>
  </div>

  <h2>🚀 Running the Application</h2>
  <ol>
    <li>Ensure MySQL is running and the <code>study_groupdb</code> database exists.</li>
    <li>Navigate to <code>backend</code> and run:
      <pre><code>mvn spring-boot:run</code></pre>
    </li>
    <li>Backend will run on <code>http://localhost:8145</code></li>
    <li>Open another terminal, go to <code>frontend</code>, and run:
      <pre><code>npm install
npm run dev</code></pre>
    </li>
    <li>Frontend should now be accessible at the shown localhost URL.</li>
  </ol>

  <h2>📚 API Endpoints (Highlights)</h2>
  <ul>
    <li><strong>Authentication:</strong> <code>POST /auth/register</code>, <code>POST /auth/login</code>, <code>POST /auth/forgot-password</code></li>
    <li><strong>User Profile:</strong> <code>GET /user/profile</code>, <code>PUT /user/profile</code></li>
    <li><strong>Courses:</strong> <code>GET /courses</code>, <code>POST /courses/{courseId}/enroll</code></li>
  </ul>

  <h2>📁 Project Structure</h2>
  <ul>
    <li>Frontend – React (Vite + Tailwind)</li>
    <li>Backend – Spring Boot (Java)</li>
    <li>Database – MySQL</li>
  </ul>

  <h2>📝 License</h2>
  <p>MIT License</p>

  <h2>🙌 Acknowledgments</h2>
  <ul>
    <li>React & React Router</li>
    <li>Tailwind CSS</li>
    <li>Spring Boot Documentation</li>
  </ul>

  <footer>
    <p>© 2025 Study Group Finder & Collaboration Platform | Developed by Abhishek Hulule</p>
  </footer>
</body>
</html>
