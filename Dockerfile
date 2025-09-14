# ==========================
# Stage 1: Build the JAR
# ==========================
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Copy Maven files first (for dependency caching)
COPY mvnw pom.xml ./
COPY .mvn .mvn

# ✅ Fix permissions for mvnw
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy project source
COPY src ./src

# Package application (skip tests for faster builds)
RUN ./mvnw clean package -DskipTests

# ==========================
# Stage 2: Run the JAR
# ==========================
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose Spring Boot default port
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
