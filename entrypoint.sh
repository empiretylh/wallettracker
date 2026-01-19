#!/bin/sh
set -e

# Wait for DB (simple loop) - optional, keeps trying for a short time
if [ -n "$DATABASE_HOST" ]; then
  echo "Waiting for database at $DATABASE_HOST:$DATABASE_PORT..."
  for i in 1 2 3 4 5 6 7 8 9 10; do
    nc -z "$DATABASE_HOST" "$DATABASE_PORT" && break
    echo "Waiting for postgres... ($i)"
    sleep 1
  done
fi

echo "Apply database migrations"
python manage.py migrate --noinput

echo "Collect static files"
python manage.py collectstatic --noinput

exec "$@"
