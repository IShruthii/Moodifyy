#!/bin/sh
# Convert Render's postgres:// connectionString to JDBC format
if [ -n "$SPRING_DATASOURCE_URL" ]; then
  case "$SPRING_DATASOURCE_URL" in
    postgres://*)
      export SPRING_DATASOURCE_URL="jdbc:postgresql://${SPRING_DATASOURCE_URL#postgres://}"
      ;;
    postgresql://*)
      export SPRING_DATASOURCE_URL="jdbc:postgresql://${SPRING_DATASOURCE_URL#postgresql://}"
      ;;
  esac
fi

exec java \
  -XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -Djava.security.egd=file:/dev/./urandom \
  -jar /app/app.jar
