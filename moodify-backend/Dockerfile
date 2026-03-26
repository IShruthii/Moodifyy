# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -q
COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S moodify && adduser -S moodify -G moodify

COPY --from=builder /app/target/moodify-backend.jar app.jar
COPY start.sh start.sh

RUN chmod +x start.sh && chown -R moodify:moodify /app

USER moodify
EXPOSE 8080

ENTRYPOINT ["/app/start.sh"]
