# Project Overview
This repository contains a full-stack Web Application (Group Chat) built to satisfy specific architectural and deployment requirements. The system is divided into completely independent frontend and backend modules, utilizing a microservices architecture locally via Docker, with a target cloud deployment on AWS using Terraform.

## Core Requirements & Architecture
The AI Assistant MUST adhere to the following project constraints:
1. **API Endpoints**: The backend must expose at least 2 GET and 2 POST endpoints. At least one POST/GET pair must be explicitly dedicated to uploading and downloading multimedia files.
2. **Module Separation**: Frontend and Backend are strictly separated and must be hosted independently.
3. **Containerization**: Every module must have its own Docker configuration (`Dockerfile`).
4. **Cloud Infrastructure (AWS via Terraform)**: The target infrastructure is defined via Terraform (`main.tf`) and includes:
   - **AWS Elastic Beanstalk**: For hosting the application (Frontend and Backend deployed on separate Beanstalk environments).
   - **AWS RDS**: For storing relational data (PostgreSQL).
   - **AWS S3**: For storing multimedia files.
   - **AWS CloudWatch**: For logging and monitoring.
   - **AWS Cognito**: For user authentication and authorization.

## Technology Stack
### Frontend (Client)
- **Framework**: React (via Vite).
- **UI Library**: Material-UI (MUI) with Dark Mode and a MS Teams-like chat layout (messages aligned left/right based on sender).
- **State/Requests**: Axios (with interceptors for auth tokens) and polling (`setInterval`) for real-time updates.

### Backend (API)
- **Framework**: Django & Django REST Framework (DRF).
- **Architecture**: Microservices approach (`users-service` and `chat-service`).
- **Database**: PostgreSQL (Locally via Docker, Production via AWS RDS).
- **Current Auth**: JWT (`djangorestframework-simplejwt`). *Note: Migration to AWS Cognito is planned.*

## Copilot Guidelines & Rules
When generating code, proposing architectural changes, or refactoring, please follow these rules:

1. **Think Cloud-First**: Always consider how the code will run in AWS Elastic Beanstalk and how it interacts with managed services (RDS, S3, Cognito).
2. **File Handling**: When working with chat messages containing files, assume the use of `multipart/form-data` and prepare the backend to upload these files directly to AWS S3 using `boto3`.
3. **Security & Auth**: Prepare the frontend and backend for AWS Cognito integration. JWT tokens will eventually be issued by Cognito, not the local database.
4. **Terraform Generation**: When asked to write `.tf` files, adhere strictly to best practices. Always separate environments (frontend vs backend) and ensure least-privilege IAM roles for CloudWatch, S3, and Beanstalk.
5. **Code Style**:
   - Python: Strictly follow PEP-8. Keep views light; move logic to serializers or services.
   - React: Use Functional Components and Hooks. Avoid class components.
6. **No Breaking Changes**: Do not break the current local Docker-Compose setup while adding Terraform/AWS configurations. Local development must remain functional.

## Current Project Phase
- [x] Local Frontend (React) development.
- [x] Local Backend (Django) development (GET/POST endpoints, file handling).
- [x] Local Dockerization.
- [ ] Terraform infrastructure setup (`main.tf`).
- [ ] AWS Cognito integration.
- [ ] AWS S3 integration for media files.
- [ ] Cloud Deployment & Verification.