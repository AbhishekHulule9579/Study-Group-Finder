# Stage 1: Build the application using Maven
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Create the final, smaller image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/infosys-0.0.1-SNAPSHOT.jar ./app.jar
EXPOSE 8145
ENTRYPOINT ["java", "-jar", "app.jar"]