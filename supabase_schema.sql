-- ============================================================
-- GOTOH - Supabase PostgreSQL Schema
-- Generated from Sequelize migrations
-- Run this script in Supabase SQL Editor (in order)
-- ============================================================

-- Enable UUID extension (optional, kita pakai SERIAL/BIGSERIAL)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

CREATE TYPE health_target_enum AS ENUM (
  'menurunkan_berat_badan',
  'gaya_hidup_sehat',
  'membangun_otot'
);

CREATE TYPE user_role_enum AS ENUM ('user', 'admin');

CREATE TYPE community_type_enum AS ENUM ('public', 'private');

CREATE TYPE post_type_enum AS ENUM ('public', 'private');

CREATE TYPE community_member_role_enum AS ENUM ('admin', 'member');

-- ============================================================
-- 2. TABLE: Users
-- ============================================================

CREATE TABLE "Users" (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(255)        NOT NULL,
  email         VARCHAR(255)        NOT NULL UNIQUE,
  password      VARCHAR(255)        NOT NULL,
  health_target health_target_enum,
  avatar        VARCHAR(255),
  role          user_role_enum      NOT NULL DEFAULT 'user',
  "createdAt"   TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. TABLE: Communities
-- ============================================================

CREATE TABLE "Communities" (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255),
  description VARCHAR(255),
  category    VARCHAR(255),
  type        community_type_enum,
  cover_image VARCHAR(255),
  created_by  INTEGER REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  location    VARCHAR(255),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. TABLE: Community_Members
-- ============================================================

CREATE TABLE "Community_Members" (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  community_id INTEGER REFERENCES "Communities"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  joined_at    TIMESTAMPTZ,
  role         community_member_role_enum NOT NULL DEFAULT 'member',
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. TABLE: Posts
-- ============================================================

CREATE TABLE "Posts" (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  type        post_type_enum,
  content     VARCHAR(255),
  image       VARCHAR(255),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. TABLE: Comments
-- ============================================================

CREATE TABLE "Comments" (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  post_id     INTEGER REFERENCES "Posts"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  content     VARCHAR(255),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 7. TABLE: Likes
-- ============================================================

CREATE TABLE "Likes" (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  post_id     INTEGER REFERENCES "Posts"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. TABLE: Chat_Messages
-- ============================================================

CREATE TABLE "Chat_Messages" (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  community_id  INTEGER REFERENCES "Communities"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  message       TEXT,
  image_message VARCHAR(255),
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 9. TABLE: exercise_recommendations
-- ============================================================

CREATE TABLE "exercise_recommendations" (
  id             SERIAL PRIMARY KEY,
  bmi_category   VARCHAR(255),
  recommendation TEXT,
  duration       INTEGER,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 10. TABLE: medical_checkups
-- ============================================================

CREATE TABLE "medical_checkups" (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES "Users"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  date           TIMESTAMPTZ,
  blood_pressure VARCHAR(255),
  heart_rate     INTEGER,
  blood_sugar    FLOAT,
  cholesterol    FLOAT,
  weight         FLOAT,
  height         FLOAT,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 11. INDEXES (opsional, untuk performa query)
-- ============================================================

CREATE INDEX idx_communities_created_by     ON "Communities"(created_by);
CREATE INDEX idx_community_members_user_id  ON "Community_Members"(user_id);
CREATE INDEX idx_community_members_comm_id  ON "Community_Members"(community_id);
CREATE INDEX idx_posts_user_id              ON "Posts"(user_id);
CREATE INDEX idx_comments_user_id           ON "Comments"(user_id);
CREATE INDEX idx_comments_post_id           ON "Comments"(post_id);
CREATE INDEX idx_likes_user_id              ON "Likes"(user_id);
CREATE INDEX idx_likes_post_id              ON "Likes"(post_id);
CREATE INDEX idx_chat_messages_user_id      ON "Chat_Messages"(user_id);
CREATE INDEX idx_chat_messages_community_id ON "Chat_Messages"(community_id);
CREATE INDEX idx_medical_checkups_user_id   ON "medical_checkups"(user_id);

-- ============================================================
-- 12. Row Level Security (RLS) - Aktifkan sesuai kebutuhan
-- ============================================================
-- Uncomment jika ingin menggunakan RLS Supabase

-- ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Communities" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Community_Members" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Posts" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Comments" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Likes" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Chat_Messages" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "exercise_recommendations" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "medical_checkups" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SELESAI
-- ============================================================
