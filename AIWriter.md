# AIWriter Project User Manual

This manual provides instructions for deploying, configuring, and using the AIWriter application.

## 1. Introduction

AIWriter is a web application designed to assist users in writing novels. It consists of a React-based frontend, a .NET backend API, and a MySQL database. The application leverages AI models for various writing tasks.

## 2. Deployment

The AIWriter project can be deployed using Docker and Docker Compose, offering flexible options for both local development and production environments.

### 2.1 Prerequisites

Before deployment, ensure you have the following installed:
*   **Docker:** [Install Docker](https://docs.docker.com/get-docker/)
*   **Docker Compose:** [Install Docker Compose](https://docs.docker.com/compose/install/) (usually comes with Docker Desktop)

### 2.2 Local Development Deployment

For local development, use the `docker-compose.yml` file. This setup builds the images from source and exposes ports for easy access.

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd AIWriter
    ```
2.  **Build and run the services:**
    Navigate to the root directory of the project where `docker-compose.yml` is located and run:
    ```bash
    docker-compose up --build
    ```
    This command will:
    *   Build the `backend` Docker image from `backend/Dockerfile`.
    *   Build the `frontend` Docker image from `frontend/Dockerfile`.
    *   Pull the `mysql:8.0` image for the database.
    *   Start all three services (`db`, `backend`, `frontend`).
    *   Expose the following ports:
        *   MySQL: `3306` (host) -> `3306` (container)
        *   Backend API: `8080` (host) -> `8080` (container)
        *   Frontend: `3000` (host) -> `80` (container)

3.  **Access the application:**
    Once all services are up and running, open your web browser and navigate to `http://localhost:3000`.

### 2.3 Production Deployment

For production environments, the deployment is executed directly by running the `docker-compose` command with the `docker-compose.prod.yml` file. This setup assumes pre-built Docker images (e.g., from a Docker registry) and uses more secure database credentials.

1.  **Ensure images are available:**
    The `docker-compose.prod.yml` file references `webber896/aiwriter-backend:latest` and `webber896/aiwriter-frontend:latest`. Ensure these images are either pulled from Docker Hub or built and pushed to your private registry.
    To build and push your own images (replace `your_docker_username`):
    ```bash
    docker build -t your_docker_username/aiwriter-backend:latest -f backend/Dockerfile .
    docker push your_docker_username/aiwriter-backend:latest

    docker build -t your_docker_username/aiwriter-frontend:latest -f frontend/Dockerfile .
    docker push your_docker_username/aiwriter-frontend:latest
    ```
    Then, update `docker-compose.prod.yml` to use your image names.

2.  **Execute the deployment:**
    Navigate to the root directory of the project where `docker-compose.prod.yml` is located and run the following command:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d
    ```
    This command directly executes the deployment defined in `docker-compose.prod.yml`. The `-d` flag runs the services in detached mode (in the background).

3.  **Access the application:**
    The frontend will be accessible on `http://localhost:3000`. Ensure your server's firewall allows traffic on this port.

## 3. Basic Configuration

### 3.1 Backend Configuration

The backend uses `appsettings.json` for configuration. Environment variables in `docker-compose.yml` and `docker-compose.prod.yml` override these settings.

*   **JWT Settings:**
    *   `Jwt:Key`: Secret key for JWT token signing. **Change this to a strong, unique key in production.**
    *   `Jwt:Issuer`: Issuer of the JWT token.
    *   `Jwt:Audience`: Audience for the JWT token.
*   **Connection Strings:**
    *   `ConnectionStrings:DefaultConnection`: Database connection string. This is typically overridden by Docker Compose environment variables.
*   **AI Proxy Settings:**
    These settings are managed within the application's database (User Settings) and are configured via the frontend UI. The backend `AIClientService` uses these settings to communicate with external AI models.

### 3.2 Frontend Configuration

The frontend is served by Nginx, configured via `frontend/nginx.conf`.

*   **API Proxy:**
    The `location /api` block in `nginx.conf` proxies all requests starting with `/api` to the backend service running at `http://backend:8080` (the Docker service name and port). If your backend service name or port changes, update this configuration.

## 4. Usage Instructions

### 4.1 Starting and Stopping the Application

*   **Start (Development):** `docker-compose up --build`
*   **Start (Production):** `docker-compose -f docker-compose.prod.yml up -d`
*   **Stop:** `docker-compose down` (stops and removes containers, networks, and volumes defined in the Compose file)

### 4.2 User Registration and Login

1.  Open the application in your browser (`http://localhost:3000`).
2.  Navigate to the registration page (if available, otherwise the login page will likely have a registration link).
3.  Follow the on-screen instructions to register a new user account.
4.  Log in with your registered credentials.

### 4.3 Managing Novels

*   **Create Novel:** From the dashboard, you can create new novels by providing a title and description.
*   **View Novels:** Your created novels will be listed on the dashboard.
*   **Edit Novel:** Select a novel to edit its details.
*   **Delete Novel:** You can delete novels from the dashboard. Deleting a novel will also delete all associated chapters and conversation histories.

### 4.4 Managing Agents

*   **View Agents:** Access the agent management section to see a list of configured AI agents.
*   **Create Agent:** Define new AI agents by specifying their name, prompt, and the AI model they should use.
*   **Update Agent:** Modify existing agent details.
*   **Delete Agent:** Remove agents from your configuration.

### 4.5 Writing Workflow

The application supports an AI-assisted writing workflow.

1.  **Select a Novel:** Choose a novel you want to work on.
2.  **Start Writing:** Initiate the writing process for a novel. The Orchestrator Service will use configured AI agents (Writer, Optimizer, Abstracter) to generate content.
3.  **Monitor Progress:** Track the progress of the writing workflow, including generated content and conversation history with the AI agents.
4.  **Stop Writing:** You can pause or stop the writing process at any time.
5.  **Regenerate Abstract:** For specific history items, you can trigger the AI to regenerate an abstract.

---
**Note:** This manual assumes a basic understanding of Docker and Docker Compose. For more advanced configurations or troubleshooting, refer to the official Docker documentation and the project's source code.