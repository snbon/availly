# myfreeslots

## Quickstart

### 1) Connect Git
```bash
git remote -v
# if missing:
git remote add origin https://github.com/snbon/myfreeslots.git
git push -u origin dev
```

### 2) Backend (Laravel)
```bash
cd apps/api
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

### 3) Frontend (React + Vite)
```bash
cd apps/web
cp .env.example .env
npm install
npm run dev
```

### 4) Supabase (local)

Ensure Postgres is running and credentials match `apps/api/.env`.

### 5) Env notes

Configure OAuth secrets when enabling Google/Microsoft sync.

For Apple ICS, add private ICS URLs into `APPLE_ICS_URLS` (comma-separated).
