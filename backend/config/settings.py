import os
import secrets
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Lightweight local configuration loader; deployment platforms should supply real env vars.
for env_file in (BASE_DIR / '.env', BASE_DIR.parent / '.env'):
    if env_file.exists():
        for line in env_file.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY') or secrets.token_urlsafe(50)
DEBUG = os.getenv('DJANGO_DEBUG', '').lower() == 'true'
ALLOWED_HOSTS = [host for host in os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if host]
INSTALLED_APPS = ['django.contrib.admin', 'django.contrib.auth', 'django.contrib.contenttypes', 'django.contrib.sessions', 'django.contrib.messages', 'django.contrib.staticfiles', 'jirani_core']
MIDDLEWARE = ['django.middleware.security.SecurityMiddleware', 'django.contrib.sessions.middleware.SessionMiddleware', 'django.middleware.common.CommonMiddleware', 'django.middleware.csrf.CsrfViewMiddleware', 'django.contrib.auth.middleware.AuthenticationMiddleware', 'django.contrib.messages.middleware.MessageMiddleware']
ROOT_URLCONF = 'config.urls'
TEMPLATES = [{'BACKEND': 'django.template.backends.django.DjangoTemplates', 'DIRS': [], 'APP_DIRS': True, 'OPTIONS': {'context_processors': ['django.template.context_processors.request', 'django.contrib.auth.context_processors.auth', 'django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION = 'config.wsgi.application'
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': BASE_DIR / 'db.sqlite3'}}
if os.getenv('DATABASE_URL'):
    # PostgreSQL deployment config is intentionally explicit; install psycopg and configure DATABASE_URL parser in deployment.
    raise RuntimeError('DATABASE_URL is set but no database URL parser is configured. Configure DATABASES for your PostgreSQL deployment.')
AUTH_PASSWORD_VALIDATORS = []
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
JIRANI_HOTSPOT_MIN_CONCERNS = int(os.getenv('JIRANI_HOTSPOT_MIN_CONCERNS', '3'))
