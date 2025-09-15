# ==========================
# Stage 1: Build the JAR
# ==========================
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy Maven wrapper + pom.xml
COPY Backend/email-writer-backend/mvnw .
COPY Backend/email-writer-backend/.mvn .mvn
COPY Backend/email-writer-backend/pom.xml .

# Fix permissions for mvnw
RUN chmod +x mvnw

# Download dependencies (for caching)
RUN ./mvnw dependency:go-offline -B

# Copy project source
COPY Backend/email-writer-backend/src ./src

# Package application (skip tests for faster builds)
RUN ./mvnw clean package -DskipTests

# ==========================
# Stage 2: Run the JAR
# ==========================
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Render/Heroku set $PORT dynamically. Spring Boot must bind to it:
# Ensure you have `server.port=${PORT:8080}` in application.properties
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
