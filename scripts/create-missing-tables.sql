-- Создание недостающих таблиц

-- Subscriptions
CREATE TABLE IF NOT EXISTS "Subscriptions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    following JSONB DEFAULT '[]'::jsonb,
    followers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON "Subscriptions"(user_id);

-- Messages
CREATE TABLE IF NOT EXISTS "Messages" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    receiver_id UUID REFERENCES "Users"("Id") ON DELETE CASCADE,
    content TEXT NOT NULL,
    encrypted_content TEXT,
    image_url TEXT,
    file_url TEXT,
    file_hash TEXT,
    message_type TEXT DEFAULT 'text',
    is_scanned BOOLEAN DEFAULT false,
    read BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    participants JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON "Messages"(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON "Messages"(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON "Messages"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_participants ON "Messages" USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_messages_global ON "Messages"(receiver_id) WHERE receiver_id IS NULL;

-- ProfileLikes
CREATE TABLE IF NOT EXISTS "ProfileLikes" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    liked_by JSONB DEFAULT '[]'::jsonb,
    count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_likes_user_id ON "ProfileLikes"(user_id);

-- BlogPosts
CREATE TABLE IF NOT EXISTS "BlogPosts" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES "Users"("Id") ON DELETE SET NULL,
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

-- Reviews
CREATE TABLE IF NOT EXISTS "Reviews" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "Users"("Id") ON DELETE SET NULL,
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

-- ChatHistory
CREATE TABLE IF NOT EXISTS "ChatHistory" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "Users"("Id") ON DELETE CASCADE,
    user_email TEXT,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON "ChatHistory"(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON "ChatHistory"(created_at DESC);

-- ProjectComments
CREATE TABLE IF NOT EXISTS "ProjectComments" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES "Projects"(id) ON DELETE CASCADE,
    user_id UUID REFERENCES "Users"("Id") ON DELETE SET NULL,
    user_name TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON "ProjectComments"(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON "ProjectComments"(user_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_created_at ON "ProjectComments"(created_at DESC);

-- UserProfiles
CREATE TABLE IF NOT EXISTS "UserProfiles" (
    user_id UUID PRIMARY KEY REFERENCES "Users"("Id") ON DELETE CASCADE,
    nickname TEXT,
    bio TEXT,
    avatar_url TEXT,
    selected_achievements JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON "Subscriptions";
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON "Subscriptions"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_messages_updated_at ON "Messages";
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON "Messages"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profile_likes_updated_at ON "ProfileLikes";
CREATE TRIGGER update_profile_likes_updated_at BEFORE UPDATE ON "ProfileLikes"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON "BlogPosts";
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON "BlogPosts"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON "Reviews";
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON "Reviews"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_comments_updated_at ON "ProjectComments";
CREATE TRIGGER update_project_comments_updated_at BEFORE UPDATE ON "ProjectComments"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON "UserProfiles";
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON "UserProfiles"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Missing tables created successfully!' AS status;

