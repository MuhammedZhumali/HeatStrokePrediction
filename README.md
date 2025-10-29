# HeatStroke - Risk Prediction System

A full-stack app for monitoring and predicting heatstroke risk. The backend is a Spring Boot API using a PMML model for predictions; the frontend is a React app built with MUI.

## Features
- Dashboard with total/low/medium/high risk counts (admin uses full dataset)
- Create new risk predictions via a form
- Predictions history with pagination and risk badges
- User management (admin)
- User profile page (view/edit own info with BMI auto-calculation)

## Tech Stack
- Backend: Java 17, Spring Boot 2.7, Spring Security, JPA/Hibernate, PostgreSQL, Liquibase, JPMML
- Frontend: React (CRA), React Router, React Query, Material UI

## Project Structure
```
frontend/            # React app (port 3000)
src/main/java/      # Spring Boot application
src/main/resources/ # App config, Liquibase changelogs, PMML model
model/              # PMML model copy
```

## Prerequisites
- Java 17
- Maven 3.8+
- Node.js 18+ and npm
- PostgreSQL (local) listening on port 5433 with database/schema/user:
  - DB: heatstr
  - User: heatstr / heatstr

You can start a local Postgres using Docker:
```bash
docker run --name heatstr-db -e POSTGRES_DB=heatstr -e POSTGRES_USER=heatstr -e POSTGRES_PASSWORD=heatstr -p 5433:5432 -d postgres:14
```

## Backend Setup (Spring Boot)
1. Configure DB in `src/main/resources/application.yml` (defaults already set):
   - `jdbc:postgresql://localhost:5433/heatstr`
   - username/password: `heatstr/heatstr`
2. (Optional) Apply Liquibase changelogs if you want automatic schema creation. In `application.yml` Liquibase is disabled by default (`liquibase.enabled: false`). To create the schema:
   ```bash
   mvn liquibase:update
   ```
3. Build and run the API:
   ```bash
   mvn clean spring-boot:run
   # API runs at http://localhost:8080
   ```

### Useful Backend Endpoints
- Auth
  - POST `/auth/login` - basic username/email + password
  - POST `/auth/sign_up` - register new user (BMI is calculated on server)
- Predictions
  - POST `/api/predictions` (ADMIN)
  - GET `/api/predictions/user/{userId}` - paged user predictions
  - GET `/api/predictions/all` (ADMIN) - paged predictions for dashboard/history
- Users
  - GET `/user/all` (ADMIN)
  - GET `/user/profile/{email}` - get own profile by email
  - GET `/user/profile/id/{id}` - get own profile by id
  - PUT `/user/profile/{id}` - update own profile (recalculates BMI when height/weight change)

## Frontend Setup (React)
1. Move into the frontend directory and install deps:
   ```bash
   cd frontend
   npm install
   ```
2. Environment (optional): create `.env` in `frontend/` if your API differs:
   ```env
   REACT_APP_API_URL=http://localhost:8080
   ```
3. Start the app:
   ```bash
   npm start
   # App runs at http://localhost:3000
   ```

### Login Notes
- The frontend uses basic auth for admin endpoints (temporary) and calls `/auth/login`.
- After login, the client fetches the profile via `/user/profile/{email}` to get the user id for profile operations.

## Profile Page
- Route: `/profile`
- Edit: name, email, phone, gender, height (cm), weight (kg). BMI auto-calculates client-side and persists server-side.

## Common Troubleshooting
- DB connection refused: ensure Docker container is up and port `5433` is free.
- Liquibase not applying: either enable in `application.yml` or run `mvn liquibase:update`.
- CORS/API URL issues: set `REACT_APP_API_URL` to your backend host/port.

## Building Artifacts
```bash
# Backend JAR
mvn clean package
# JAR will be in target/HeatStroke-1.0-SNAPSHOT.jar
```

## License
This project is for educational/demo purposes.
