---
inclusion: always
---

# LOCKED FILES — DO NOT MODIFY

The following files are locked and must NEVER be modified unless the user explicitly says "update application.properties" or "change the locked file":

- `moodify-backend/src/main/resources/application.properties`

This file contains production database credentials and deployment configuration that is finalized. Any change to this file breaks deployment.
