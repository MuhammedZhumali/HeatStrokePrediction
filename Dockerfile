# ---------- Build stage ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Кэшируем зависимости
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Исходники и сборка
COPY src ./src
RUN mvn -q -DskipTests package

# ---------- Run stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
# Копируем собранный jar (обычно он один)
COPY --from=build /app/target/*.jar /app/app.jar

# Профиль через ENV не навязываю — мы всё переопределим переменными
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
