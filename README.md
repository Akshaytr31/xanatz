# Xanatz

Xanatz is a full-stack web application featuring a Django REST Framework backend and a React (Vite) frontend.

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

*   **Node.js** (v18 or higher recommended)
*   **npm** (v9 or higher recommended)
*   **Python** (v3.10 or higher recommended)
*   **MySQL Server** (running locally or remotely)

---

## Getting Started

### 1. Clone the Repository

First, clone the repository to your local machine:

```bash
git clone <repository-url>
cd Xanatz
```

---

### 2. Backend Setup

The backend is built with Django and Django REST Framework.

#### Step 2.1: Navigate to the backend directory
```bash
cd backend
```

#### Step 2.2: Create and Activate a Python Virtual Environment
```bash
# Create a virtual environment named 'venv'
python -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows (Command Prompt):
# venv\Scripts\activate.bat

# On Windows (PowerShell):
# .\venv\Scripts\Activate.ps1
```

#### Step 2.3: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 2.4: Set Up Environment Variables
Create a `.env` file in the `backend/` directory (you can copy `.env` from the project workspace or base it on existing templates):

```ini
DB_NAME=xanatz_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306
SECRET_KEY=django-insecure-replace-me-later
DEBUG=True

# Email Setup
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=your_email@gmail.com

# Cloudinary Setup
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

# Google OAuth Setup
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### Step 2.5: Set Up the Database
1.  Open your MySQL client/terminal and create a database matching your `.env` configuration:
    ```sql
    CREATE DATABASE xanatz_db;
    ```
2.  Run the migrations:
    ```bash
    python manage.py migrate
    ```

#### Step 2.6: Start the Backend Server
```bash
python manage.py runserver
```
The backend API will run at `http://127.0.0.1:8000/`.

---

### 3. Frontend Setup

The frontend is built with React, Vite, and Tailwind CSS.

#### Step 3.1: Navigate to the frontend directory
Open a new terminal window/tab, navigate to the root directory, and then:
```bash
cd frontend
```

#### Step 3.2: Install npm Packages
```bash
npm install
```

#### Step 3.3: Set Up Environment Variables
Create a `.env` file in the `frontend/` directory:

```ini
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_MEDIA_BASE_URL=http://127.0.0.1:8000
```

#### Step 3.4: Start the Frontend Development Server
```bash
npm run dev
```
The frontend application will run locally, typically at `http://localhost:5173/`.

---

## Project Structure

```text
Xanatz/
├── backend/            # Django Backend
│   ├── backend_core/   # Project configuration (settings, urls, etc.)
│   ├── accounts/       # Authentication, profiles, and core logic
│   ├── manage.py       # Django CLI
│   └── requirements.txt
├── frontend/           # React Frontend
│   ├── src/            # Components, pages, assets, utilities
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md           # This guide
```
