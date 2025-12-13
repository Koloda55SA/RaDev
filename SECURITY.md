# 🔒 Security Policy

## ⚠️ Важно: Секреты и API ключи

**НИКОГДА не коммитьте следующие файлы и данные:**

### Файлы, которые НЕ должны быть в репозитории:

- `.env` - все файлы с переменными окружения
- `.env.local`, `.env.production`, `.env.development`
- `client_secret_*.json` - Google OAuth credentials
- `*.key`, `*.pem` - приватные ключи
- `credentials.json` - любые файлы с credentials

### Переменные окружения, которые нужно настроить:

#### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
OPENAI_API_KEY=your_openai_key_here
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

#### Backend (backend/.env):
```env
POSTGRES_PASSWORD=your_secure_password
JWT_SECRET=your_32_char_secret_minimum
Google__ClientId=your_google_client_id
Google__ClientSecret=your_google_client_secret
Email__SmtpPassword=your_email_password
```

### Firebase Config

Firebase API ключи являются **публичными** и безопасны для коммита в репозиторий. Они используются только на клиенте и защищены правилами безопасности Firebase.

### Что делать если случайно закоммитили секрет:

1. **Немедленно** отзовите/пересоздайте секрет в сервисе (Google Cloud, OpenAI, etc.)
2. Удалите секрет из истории Git:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/secret/file" \
     --prune-empty --tag-name-filter cat -- --all
   ```
3. Или используйте [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)

### Безопасность API

- Все API ключи должны быть в переменных окружения
- Никогда не используйте хардкодные секреты в коде
- Используйте `.env.example` файлы как шаблоны
- Проверяйте `.gitignore` перед коммитом


