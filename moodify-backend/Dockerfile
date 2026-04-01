# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache bust - forces full rebuild
ARG CACHEBUST=2

COPY pom.xml .
RUN mvn dependency:go-offline -q

COPY src ./src
RUN mvn clean package -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S moodify && adduser -S moodify -G moodify

COPY --from=builder /app/target/moodify-backend.jar app.jar
RUN chown -R moodify:moodify /app

USER moodify
EXPOSE 8080
EXPOSE 10000

CMD ["sh", "-c", "\
  if [ -n \"$DB_HOST\" ] && [ -n \"$DB_PORT\" ] && [ -n \"$DB_NAME\" ]; then \
    export SPRING_DATASOURCE_URL=\"jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}\"; \
  fi; \
  case \"$SPRING_DATASOURCE_URL\" in \
    postgres://*) export SPRING_DATASOURCE_URL=\"jdbc:postgresql://${SPRING_DATASOURCE_URL#postgres://}\";; \
    postgresql://*) export SPRING_DATASOURCE_URL=\"jdbc:postgresql://${SPRING_DATASOURCE_URL#postgresql://}\";; \
  esac; \
  exec java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]
