#!/bin/sh
set -e

# Replace environment variables in the template
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

# Start nginx
exec "$@"
