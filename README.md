Student Project Showcase

📌 About the Project

Student Project Showcase is a web-based application developed to help students submit, display, and share their academic and personal projects. It provides a central platform where students can showcase their creativity, technical skills, and project work.

The application includes a project submission form, a public project gallery, search and tag filtering, and an admin moderation system. Submitted projects remain pending until an administrator approves them.

🎯 Objectives

- Provide a platform for students to showcase their projects.
- Allow students to submit project details and links.
- Display approved projects in a public gallery.
- Enable searching and filtering projects by tags.
- Allow administrators to approve or reject submissions.
- Store project information in a database.

✨ Features

Student Features

- Submit project title and student name.
- Add project descriptions and technology tags.
- Provide GitHub repository and live demo URLs.
- Receive a submission confirmation.
- Search and filter approved projects.

Admin Features

- Admin login and session-based authentication.
- View submitted projects.
- Review pending submissions.
- Approve or reject projects.
- Filter submissions by status.

Security and Validation

- Validate required form fields.
- Validate HTTPS project URLs.
- Protect admin routes using authentication.
- Use parameterized SQL queries.
- Keep environment variables and database files out of version control.

🛠️ Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: SQLite with better-sqlite3
- Authentication: express-session
- Configuration: dotenv
- Version Control: Git and GitHub

📁 Project Structure

student-project/
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/
│   ├── server.js
│   ├── database.js
│   ├── package.json
│   ├── .env.example
│   └── projects.db
├── screenshots/
├── .gitignore
└── README.md

Note: The SQLite database file is generated locally when the application runs and should not be committed to GitHub.

⚙️ Installation and Setup

Prerequisites

Install the following software:

- Node.js and npm
- Git
- A web browser

Step 1: Clone the Repository

git clone https://github.com/YOUR-USERNAME/student-project-showcase.git

Replace "YOUR-USERNAME" with your GitHub username.

Step 2: Navigate to the Server Directory

cd student-project-showcase/server

Step 3: Install Dependencies

npm install

Step 4: Configure Environment Variables

Create a ".env" file inside the "server" directory using ".env.example" as a reference.

Configure these variables:

PORT=3000
NODE_ENV=development
SESSION_SECRET=replace_with_a_long_random_secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace_with_a_strong_password

Use your own strong password and a unique random session secret. Never upload the ".env" file to GitHub.

Step 5: Start the Application

npm start

If the server starts successfully, open:

http://localhost:3000

🔌 API Endpoints

Method| Endpoint| Description
GET| "/api/projects"| Retrieve approved projects
POST| "/api/projects"| Submit a new project
POST| "/api/admin/login"| Log in as administrator
POST| "/api/admin/logout"| Log out as administrator
GET| "/api/admin/projects"| View submissions (admin only)
PATCH| "/api/admin/projects/:id"| Approve or reject a project (admin only)

🔄 Application Workflow

1. A student opens the application.
2. The student fills in the project submission form.
3. The server validates the submitted information.
4. Valid project details are saved in the SQLite database with Pending status.
5. The administrator logs in and reviews submissions.
6. The administrator approves or rejects each project.
7. Approved projects appear in the public gallery.
8. Students can search and filter the approved projects.

🧪 Testing

The following checks should be performed:

- Submit a project with valid information.
- Verify that invalid or missing fields are rejected.
- Confirm that submissions are stored with Pending status.
- Confirm that only approved projects appear in the public gallery.
- Test project search and tag filtering.
- Verify that admin routes reject unauthenticated requests.
- Test approval and rejection actions.
- Check the application layout on desktop and mobile screens.

📸 Screenshots

Added screenshots of the application to the "screenshots/" folder and include them here after capturing them.

🚀 Future Enhancements

- Student registration and login.
- Project categories and advanced filters.
- Project likes, ratings, and comments.
- Pagination for large project collections.
- Improved automated testing.
- Production deployment with secure session storage and additional security protections.

📄 License

This project is developed for educational purposes as part of a Full Stack Development internship task.