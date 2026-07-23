#!/usr/bin/env bash
set -euo pipefail

# Seek of Truth / Bible Project - Full Deploy + Update + Hardening Script
# This script is intended to live/run from the Next.js app folder, but it uses the repository root correctly.

REPO_DIR="/var/www/la-biblia-de-jerusalen-project"
APP_SUBDIR="La Biblia/bible-front-end"
APP_DIR="$REPO_DIR/$APP_SUBDIR"

# For a completely fresh server where REPO_DIR does not exist, set REPO_URL before running.
# Example: REPO_URL="https://github.com/your-user/your-repo.git" sudo -E ./deploy-and-harden-seekoftruth.sh
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-master}"

APP_NAME="bible-front-end"
APP_HOST="127.0.0.1"
APP_PORT="3003"

DOMAIN="seekoftruth.com"
DOMAIN_WWW="www.seekoftruth.com"
CONTACT_EMAIL="admin@seekoftruth.com"

DB_PORT="15432"
TYPESENSE_PORT="18108"

log() {
  echo ""
  echo "============================================================"
  echo "$1"
  echo "============================================================"
}

fail() {
  echo "ERROR: $1" >&2
  exit 1
}

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"

  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

wait_for_http() {
  local url="$1"
  local tries="${2:-30}"
  local i

  for i in $(seq 1 "$tries"); do
    if curl -fsSI "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  return 1
}

if [ "$(id -u)" -ne 0 ]; then
  fail "Run with sudo: sudo ./deploy-and-harden-seekoftruth.sh"
fi

log "Seek of Truth - Full Deploy + Update + Hardening"
echo "Repository root: $REPO_DIR"
echo "App subfolder:    $APP_SUBDIR"
echo "App folder:       $APP_DIR"
echo "PM2 app:          $APP_NAME"
echo "Internal bind:    $APP_HOST:$APP_PORT"
echo "Domain:           $DOMAIN $DOMAIN_WWW"
echo "Branch:           $BRANCH"

log "1/16 - Installing required VPS packages"
apt-get update

# Do not force-install Docker packages here. Some VPS images already have Docker
# from the official Docker repository, where containerd.io conflicts with Ubuntu's
# containerd package. Installing Docker again can break apt resolution.
apt-get install -y nginx ufw fail2ban curl openssl git perl certbot python3-certbot-nginx

if command -v docker >/dev/null 2>&1; then
  systemctl enable --now docker >/dev/null 2>&1 || true
else
  echo "Docker is not installed. Installing Ubuntu docker.io only because docker is missing..."
  apt-get install -y docker.io
  systemctl enable --now docker >/dev/null 2>&1 || true
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: Docker exists, but 'docker compose' is not available."
  echo "Install the Compose plugin manually for your Docker installation, then re-run this script."
  exit 1
fi

log "2/16 - Preparing repository root"
mkdir -p "$(dirname "$REPO_DIR")"

if [ ! -d "$REPO_DIR/.git" ]; then
  if [ -n "$REPO_URL" ]; then
    rm -rf "$REPO_DIR"
    git clone --branch "$BRANCH" "$REPO_URL" "$REPO_DIR"
  elif [ -d "$REPO_DIR" ]; then
    echo "Repository folder exists but is not a Git repo. Continuing with local files."
  else
    fail "Repository not found. Set REPO_URL for a fresh deploy."
  fi
else
  cd "$REPO_DIR"
  git fetch origin
  git reset --hard "origin/$BRANCH"
fi

[ -d "$APP_DIR" ] || fail "App folder not found: $APP_DIR"
[ -f "$APP_DIR/package.json" ] || fail "package.json not found in app folder: $APP_DIR"

log "3/16 - Creating backup"
BACKUP_DIR="/root/backups/seekoftruth-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
tar --exclude=node_modules --exclude=.next -czf "$BACKUP_DIR/app-before-deploy.tar.gz" -C "$APP_DIR" .

if [ -f /etc/nginx/sites-available/seekoftruth ]; then
  cp /etc/nginx/sites-available/seekoftruth "$BACKUP_DIR/nginx-seekoftruth.bak"
fi

if [ -f "$APP_DIR/docker-compose.yml" ]; then
  cp "$APP_DIR/docker-compose.yml" "$BACKUP_DIR/docker-compose.yml.bak"
fi

echo "Backup saved at: $BACKUP_DIR"

log "4/16 - Cleaning unsafe deployment artifacts"
cd "$APP_DIR"
rm -rf .codex-backups
rm -f next-dev-*.log *.log tsconfig.tsbuildinfo

log "5/16 - Preparing and hardening .env"
if [ ! -f .env ]; then
  if [ -f .env.production ]; then
    cp .env.production .env
  elif [ -f .env.example ]; then
    cp .env.example .env
  else
    touch .env
  fi
fi

chmod 600 .env

set_env_value .env "NODE_ENV" "production"
set_env_value .env "PORT" "$APP_PORT"
set_env_value .env "HOST" "$APP_HOST"
set_env_value .env "HOSTNAME" "$APP_HOST"
set_env_value .env "NEXT_PUBLIC_SITE_URL" "https://$DOMAIN"
set_env_value .env "DATABASE_URL" '"postgresql://bible:bible@localhost:15432/bible?schema=public"'
set_env_value .env "TYPESENSE_HOST" '"localhost"'
set_env_value .env "TYPESENSE_PORT" '"18108"'
set_env_value .env "TYPESENSE_PROTOCOL" '"http"'
set_env_value .env "ALLOW_PUBLIC_ADMIN_REGISTRATION" "false"

if ! grep -q '^TYPESENSE_API_KEY=' .env; then
  echo 'TYPESENSE_API_KEY="xyz"' >> .env
fi

if ! grep -q '^ADMIN_SESSION_SECRET=' .env; then
  echo "ADMIN_SESSION_SECRET=$(openssl rand -hex 48)" >> .env
  echo "Generated ADMIN_SESSION_SECRET."
else
  SECRET_VALUE="$(grep '^ADMIN_SESSION_SECRET=' .env | head -n1 | sed 's/^ADMIN_SESSION_SECRET=//' | tr -d '"')"
  if [ "${#SECRET_VALUE}" -lt 32 ]; then
    fail "ADMIN_SESSION_SECRET exists but is shorter than 32 characters."
  fi
fi

log "6/16 - Hardening docker-compose localhost bindings"
if [ -f docker-compose.yml ]; then
  perl -0pi -e 's/"15432:5432"/"127.0.0.1:15432:5432"/g' docker-compose.yml
  perl -0pi -e 's/"18108:8108"/"127.0.0.1:18108:8108"/g' docker-compose.yml
  perl -0pi -e "s/'15432:5432'/'127.0.0.1:15432:5432'/g" docker-compose.yml
  perl -0pi -e "s/'18108:8108'/'127.0.0.1:18108:8108'/g" docker-compose.yml
  perl -0pi -e 's/- 15432:5432/- 127.0.0.1:15432:5432/g' docker-compose.yml
  perl -0pi -e 's/- 18108:8108/- 127.0.0.1:18108:8108/g' docker-compose.yml

  docker compose up -d
else
  echo "docker-compose.yml not found. Skipping Docker services."
fi

log "7/16 - Installing app dependencies"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

log "8/16 - Applying database migrations"
npx prisma generate
npx prisma migrate deploy

log "9/16 - Building Next.js production app"
npm run build

log "10/16 - Starting/restarting PM2 app on localhost only"
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

pm2 delete "$APP_NAME" >/dev/null 2>&1 || true

cd "$APP_DIR"
HOST="$APP_HOST" HOSTNAME="$APP_HOST" PORT="$APP_PORT" NODE_ENV=production \
pm2 start npm --name "$APP_NAME" -- start -- -p "$APP_PORT" -H "$APP_HOST"

pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

log "11/16 - Waiting for local app response"
if ! wait_for_http "http://$APP_HOST:$APP_PORT" 45; then
  echo "PM2 logs:"
  pm2 logs "$APP_NAME" --lines 80 --nostream || true
  fail "App did not respond on http://$APP_HOST:$APP_PORT"
fi

log "12/16 - Writing hardened Nginx config"
cat > /etc/nginx/conf.d/seekoftruth-rate-limits.conf <<'EOF_NGINX_LIMITS'
limit_req_zone $binary_remote_addr zone=seek_auth:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=seek_api:10m rate=60r/m;
limit_req_zone $binary_remote_addr zone=seek_search:10m rate=120r/m;
EOF_NGINX_LIMITS

mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

write_http_config() {
cat > /etc/nginx/sites-available/seekoftruth <<EOF_NGINX_HTTP
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${DOMAIN_WWW};

    client_max_body_size 3m;

    location ~ /\\.(?!well-known) {
        deny all;
        return 404;
    }

    location ~* \\.(env|log|bak|sql|ini|conf|old|orig|save|swp)$ {
        deny all;
        return 404;
    }

    location / {
        proxy_pass http://${APP_HOST}:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \\$host;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF_NGINX_HTTP
}

write_ssl_config() {
cat > /etc/nginx/sites-available/seekoftruth <<EOF_NGINX_SSL
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${DOMAIN_WWW};
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} ${DOMAIN_WWW};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    client_max_body_size 3m;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    location ~ /\\.(?!well-known) {
        deny all;
        return 404;
    }

    location ~* \\.(env|log|bak|sql|ini|conf|old|orig|save|swp)$ {
        deny all;
        return 404;
    }

    location = /api/auth/admin {
        limit_req zone=seek_auth burst=5 nodelay;
        proxy_pass http://${APP_HOST}:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location = /api/site-pages/upload {
        limit_req zone=seek_api burst=10 nodelay;
        client_max_body_size 3m;
        proxy_pass http://${APP_HOST}:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location = /api/search {
        limit_req zone=seek_search burst=30 nodelay;
        proxy_pass http://${APP_HOST}:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        proxy_pass http://${APP_HOST}:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF_NGINX_SSL
}

ln -sf /etc/nginx/sites-available/seekoftruth /etc/nginx/sites-enabled/seekoftruth

CERT_FILE="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"
CERT_KEY="/etc/letsencrypt/live/${DOMAIN}/privkey.pem"

if [ -f "$CERT_FILE" ] && [ -f "$CERT_KEY" ]; then
  write_ssl_config
else
  write_http_config
fi

nginx -t
systemctl reload nginx

log "13/16 - Obtaining SSL certificate if needed"
if [ ! -f "$CERT_FILE" ] || [ ! -f "$CERT_KEY" ]; then
  certbot --nginx -d "$DOMAIN" -d "$DOMAIN_WWW" --redirect --non-interactive --agree-tos -m "$CONTACT_EMAIL"
fi

write_ssl_config
nginx -t
systemctl reload nginx

log "14/16 - Enabling firewall and fail2ban"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
systemctl enable --now fail2ban >/dev/null 2>&1 || true

log "15/16 - Final verification"
sleep 2

echo "---- PM2 ----"
pm2 list

echo "---- Listening ports ----"
ss -tulpn | grep -E ":${APP_PORT}|:${DB_PORT}|:${TYPESENSE_PORT}|:80|:443" || true

echo "---- Local app response ----"
curl -fsSI "http://$APP_HOST:$APP_PORT"

echo "---- Public HTTPS response ----"
curl -fsSI "https://$DOMAIN"

log "16/16 - Validating that internal ports are not public"
PORT_LINES="$(ss -tulpn | grep -E ":${APP_PORT}|:${DB_PORT}|:${TYPESENSE_PORT}" || true)"
echo "$PORT_LINES"

if echo "$PORT_LINES" | grep -qE "0\.0\.0\.0:(${APP_PORT}|${DB_PORT}|${TYPESENSE_PORT})|\*:(${APP_PORT}|${DB_PORT}|${TYPESENSE_PORT})|\[::\]:(${APP_PORT}|${DB_PORT}|${TYPESENSE_PORT})"; then
  fail "One or more internal ports are still publicly exposed. Review the listening ports above."
fi

echo ""
echo "============================================================"
echo "Deployment + hardening completed successfully."
echo "Backup saved at: $BACKUP_DIR"
echo "Website: https://$DOMAIN"
echo "Internal app: http://$APP_HOST:$APP_PORT"
echo "============================================================"
