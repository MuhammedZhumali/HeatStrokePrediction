# syntax=docker/dockerfile:1

FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -DskipTests package \
 && cp target/*.jar /build/app.jar

FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=compose \
    JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
RUN useradd -r -u 1001 appuser && chown -R appuser:appuser /app
USER 1001
COPY --from=build /build/app.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
