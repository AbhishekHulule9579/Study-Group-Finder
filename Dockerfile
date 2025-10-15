# Stage 1: Build the application using a Maven image that has JDK 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
# Copy only the backend project into the build container
COPY infosys/ .
# Now the pom.xml is in /app, so the mvn command works
RUN mvn clean package -DskipTests

# Stage 2: Create the final, smaller image using a JRE 21 image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copy the built jar from the correct location in the build stage
COPY --from=build /app/target/infosys-0.0.1-SNAPSHOT.jar ./app.jar
EXPOSE 8145
ENTRYPOINT ["java", "-jar", "app.jar"]