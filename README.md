# School Management System

A comprehensive school management system with a mobile application and Python backend. This project is currently under development as part of a Final Year Project.

## Project Structure

- `backend/`: Python backend server (FastAPI)
  - Contains API endpoints, database models, and business logic
  - Uses SQLAlchemy for database operations
  - Implements user authentication and authorization

- `myschool/`: React Native mobile application
  - Cross-platform mobile app for iOS and Android
  - Built with React Native and Expo

## Features (Planned/In Development)

### Backend (Python/FastAPI)
- [ ] User authentication (login/register)
- [ ] Student management
- [ ] Teacher management
- [ ] Course management
- [ ] Grade tracking
- [ ] Secure API endpoints

### Mobile App (React Native)
- [ ] User authentication
- [ ] Student and teacher dashboards
- [ ] Course enrollment
- [ ] Grade viewing
- [ ] Assignment submission
- [ ] Notifications

## Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL (or your preferred database)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the database connection string and other settings

5. Run migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the development server:
   ```bash
   uvicorn main:app --reload
   ```

### Mobile App Setup

1. Navigate to the myschool directory:
   ```bash
   cd myschool
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   expo start
   ```

## API Documentation

Once the backend server is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Future Improvements

- Implement mobile app frontend with React Native
- Add more administrative features
- Enhance security measures
- Improve documentation
- Add automated testing

## Acknowledgments

- Built as part of a Final Year Project
- Special thanks to all contributors and mentors
