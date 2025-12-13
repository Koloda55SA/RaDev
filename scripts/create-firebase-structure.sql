-- ============================================
-- Создание структуры БД как в Firebase
-- Адаптировано для PostgreSQL на VPS
-- ============================================

-- Таблица для маппинга Firebase UID -> UUID
CREATE TABLE IF NOT EXISTS uid_mapping (
    firebase_uid TEXT PRIMARY KEY,
    uuid UUID NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uid_mapping_uuid ON uid_mapping(uuid);

-- ============================================
-- USERS (расширение существующей таблицы)
-- ============================================
-- Добавляем поля которых нет в текущей таблице Users
DO $$ 
BEGIN
    -- Добавляем nickname если нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Users' AND column_name = 'nickname') THEN
        ALTER TABLE "Users" ADD COLUMN nickname TEXT;
    END IF;
    
    -- Добавляем achievements (JSONB для массива строк)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Users' AND column_name = 'achievements') THEN
        ALTER TABLE "Users" ADD COLUMN achievements JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- Добавляем privacy (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Users' AND column_name = 'privacy') THEN
        ALTER TABLE "Users" ADD COLUMN privacy JSONB DEFAULT '{"showActivity":true,"showAchievements":true,"showProfile":true}'::jsonb;
    END IF;
    
    -- Добавляем stats (JSONB)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Users' AND column_name = 'stats') THEN
        ALTER TABLE "Users" ADD COLUMN stats JSONB DEFAULT '{"projectsViewed":0,"blogPostsRead":0,"codeRuns":0,"messagesSent":0,"loginCount":0}'::jsonb;
    END IF;
    
    -- Добавляем bio если нет
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Users' AND column_name = 'bio') THEN
        ALTER TABLE "Users" ADD COLUMN bio TEXT;
    END IF;
END $$;

-- ============================================
-- SUBSCRIPTIONS (подписки)
-- ============================================
CREATE TABLE IF NOT EXISTS "Subscriptions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    following JSONB DEFAULT '[]'::jsonb, -- Массив UUID пользователей на которых подписан
    followers JSONB DEFAULT '[]'::jsonb, -- Массив UUID пользователей которые подписаны
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON "Subscriptions"(user_id);

-- ============================================
-- MESSAGES (приватные сообщения и глобальный чат)
-- ============================================
-- Используем receiver_id = NULL для глобального чата
CREATE TABLE IF NOT EXISTS "Messages" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES "Users"(id) ON DELETE CASCADE, -- NULL для глобального чата
    content TEXT NOT NULL, -- Текст сообщения (может быть зашифрован)
    encrypted_content TEXT, -- Зашифрованное сообщение
    image_url TEXT, -- URL изображения
    file_url TEXT, -- URL файла
    file_hash TEXT, -- SHA256 хеш файла
    message_type TEXT DEFAULT 'text', -- text, image, code, file
    is_scanned BOOLEAN DEFAULT false, -- Проверен ли файл на вирусы
    read BOOLEAN DEFAULT false, -- Прочитано ли сообщение (для приватных)
    is_deleted BOOLEAN DEFAULT false,
    participants JSONB, -- Массив UUID участников (для индексации)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON "Messages"(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON "Messages"(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON "Messages"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_participants ON "Messages" USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_messages_global ON "Messages"(receiver_id) WHERE receiver_id IS NULL;

-- ============================================
-- PROFILE_LIKES (лайки профилей)
-- ============================================
CREATE TABLE IF NOT EXISTS "ProfileLikes" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE, -- Профиль который лайкнули
    liked_by JSONB DEFAULT '[]'::jsonb, -- Массив UUID пользователей которые лайкнули
    count INTEGER DEFAULT 0, -- Количество лайков
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_likes_user_id ON "ProfileLikes"(user_id);

-- ============================================
-- BLOG_POSTS (блог посты)
-- ============================================
CREATE TABLE IF NOT EXISTS "BlogPosts" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    author_name TEXT,
    cover_image TEXT,
    published BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON "BlogPosts"(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON "BlogPosts"(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON "BlogPosts"(author_id);

-- ============================================
-- PROJECTS (портфолио проекты)
-- ============================================
CREATE TABLE IF NOT EXISTS "Projects" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    full_description TEXT,
    type TEXT, -- web, mobile, desktop, diploma
    author TEXT, -- syyimyk, abdykadyr, both
    technologies JSONB DEFAULT '[]'::jsonb, -- Массив технологий
    images JSONB DEFAULT '[]'::jsonb, -- Массив URL изображений
    cover_image TEXT,
    github_url TEXT,
    demo_url TEXT,
    featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON "Projects"(slug);
CREATE INDEX IF NOT EXISTS idx_projects_type ON "Projects"(type);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON "Projects"(featured, created_at DESC);

-- ============================================
-- REVIEWS (отзывы)
-- ============================================
CREATE TABLE IF NOT EXISTS "Reviews" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    author TEXT NOT NULL,
    email TEXT,
    project TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    photo_url TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON "Reviews"(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON "Reviews"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON "Reviews"(rating);

-- ============================================
-- PROJECT_REQUESTS (заявки на проекты)
-- ============================================
CREATE TABLE IF NOT EXISTS "ProjectRequests" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    project_type TEXT,
    description TEXT,
    budget TEXT,
    deadline TEXT,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_requests_email ON "ProjectRequests"(email);
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON "ProjectRequests"(status);
CREATE INDEX IF NOT EXISTS idx_project_requests_created_at ON "ProjectRequests"(created_at DESC);

-- ============================================
-- CHAT_HISTORY (история AI чата)
-- ============================================
CREATE TABLE IF NOT EXISTS "ChatHistory" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    user_email TEXT,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON "ChatHistory"(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON "ChatHistory"(created_at DESC);

-- ============================================
-- PROJECT_COMMENTS (комментарии к проектам)
-- ============================================
CREATE TABLE IF NOT EXISTS "ProjectComments" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES "Projects"(id) ON DELETE CASCADE,
    user_id UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    user_name TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON "ProjectComments"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON "ProjectComments"(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON "ProjectComments"(created_at DESC);

-- ============================================
-- EMAIL_SUBSCRIPTIONS (подписки на email)
-- ============================================
CREATE TABLE IF NOT EXISTS "EmailSubscriptions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    subscribed BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_subscriptions_email ON "EmailSubscriptions"(email);

-- ============================================
-- PROMO_CODES (промокоды)
-- ============================================
CREATE TABLE IF NOT EXISTS "PromoCodes" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_percent INTEGER,
    discount_amount DECIMAL(10, 2),
    active BOOLEAN DEFAULT true,
    uses_limit INTEGER,
    uses_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON "PromoCodes"(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON "PromoCodes"(active);

-- ============================================
-- USER_PROFILES (расширенный профиль пользователя)
-- ============================================
-- Если таблица UserProfiles не существует, создаем её
CREATE TABLE IF NOT EXISTS "UserProfiles" (
    user_id UUID PRIMARY KEY REFERENCES "Users"(id) ON DELETE CASCADE,
    nickname TEXT,
    bio TEXT,
    avatar_url TEXT,
    selected_achievements JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Функции для обновления updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON "Subscriptions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON "Messages"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_likes_updated_at BEFORE UPDATE ON "ProfileLikes"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON "BlogPosts"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON "Projects"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON "Reviews"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_requests_updated_at BEFORE UPDATE ON "ProjectRequests"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_comments_updated_at BEFORE UPDATE ON "ProjectComments"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_subscriptions_updated_at BEFORE UPDATE ON "EmailSubscriptions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON "PromoCodes"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON "UserProfiles"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Комментарии к таблицам
-- ============================================
COMMENT ON TABLE "Subscriptions" IS 'Подписки пользователей (following/followers)';
COMMENT ON TABLE "Messages" IS 'Приватные сообщения и глобальный чат (receiver_id = NULL для глобального)';
COMMENT ON TABLE "ProfileLikes" IS 'Лайки профилей пользователей';
COMMENT ON TABLE "BlogPosts" IS 'Блог посты';
COMMENT ON TABLE "Projects" IS 'Портфолио проекты';
COMMENT ON TABLE "Reviews" IS 'Отзывы о проектах';
COMMENT ON TABLE "ProjectRequests" IS 'Заявки на создание проектов';
COMMENT ON TABLE "ChatHistory" IS 'История AI чата';
COMMENT ON TABLE "ProjectComments" IS 'Комментарии к проектам';
COMMENT ON TABLE "EmailSubscriptions" IS 'Подписки на email рассылку';
COMMENT ON TABLE "PromoCodes" IS 'Промокоды';
COMMENT ON TABLE "UserProfiles" IS 'Расширенный профиль пользователя';
COMMENT ON TABLE uid_mapping IS 'Маппинг Firebase UID -> PostgreSQL UUID';

-- ============================================
-- Готово!
-- ============================================
SELECT 'Database structure created successfully!' AS status;





