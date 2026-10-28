-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "link_kind" AS ENUM ('GITHUB', 'LINKEDIN', 'TELEGRAM', 'WEBSITE', 'OTHER');

-- CreateEnum
CREATE TYPE "skill_category" AS ENUM ('LANGUAGE', 'FRAMEWORK', 'DATABASE', 'PLATFORM', 'PRACTICE');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(64) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "description" VARCHAR(2000) NOT NULL,
    "content_hash" VARCHAR(64) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_links" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "kind" "link_kind" NOT NULL,
    "label" VARCHAR(80) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "profile_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "category" "skill_category" NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "company" VARCHAR(160) NOT NULL,
    "position" VARCHAR(160) NOT NULL,
    "start_date" VARCHAR(10) NOT NULL,
    "end_date" VARCHAR(10),
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" UUID NOT NULL,
    "experience_id" UUID NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "summary" VARCHAR(500),
    "sort_order" INTEGER NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_skills" (
    "project_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,

    CONSTRAINT "project_skills_pkey" PRIMARY KEY ("project_id","skill_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_slug_key" ON "profiles"("slug");

-- CreateIndex
CREATE INDEX "profile_links_profile_id_idx" ON "profile_links"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_links_profile_id_kind_url_key" ON "profile_links"("profile_id", "kind", "url");

-- CreateIndex
CREATE UNIQUE INDEX "profile_links_profile_id_sort_order_key" ON "profile_links"("profile_id", "sort_order");

-- CreateIndex
CREATE INDEX "skills_profile_id_idx" ON "skills"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_profile_id_name_key" ON "skills"("profile_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_profile_id_sort_order_key" ON "skills"("profile_id", "sort_order");

-- CreateIndex
CREATE INDEX "experiences_profile_id_start_date_idx" ON "experiences"("profile_id", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "experiences_profile_id_company_position_start_date_key" ON "experiences"("profile_id", "company", "position", "start_date");

-- CreateIndex
CREATE UNIQUE INDEX "experiences_profile_id_sort_order_key" ON "experiences"("profile_id", "sort_order");

-- CreateIndex
CREATE INDEX "achievements_experience_id_idx" ON "achievements"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_experience_id_sort_order_key" ON "achievements"("experience_id", "sort_order");

-- CreateIndex
CREATE INDEX "projects_profile_id_idx" ON "projects"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_profile_id_name_key" ON "projects"("profile_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "projects_profile_id_url_key" ON "projects"("profile_id", "url");

-- CreateIndex
CREATE UNIQUE INDEX "projects_profile_id_sort_order_key" ON "projects"("profile_id", "sort_order");

-- CreateIndex
CREATE INDEX "project_skills_skill_id_idx" ON "project_skills"("skill_id");

-- AddForeignKey
ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- One open-ended role per profile. A row lock cannot protect the insert of the first row,
-- so the partial unique index is the backstop for concurrent catalog writes.
CREATE UNIQUE INDEX "experiences_one_open_period" ON "experiences" ("profile_id") WHERE "end_date" IS NULL;

CREATE UNIQUE INDEX "skills_profile_id_name_lower_idx" ON "skills" ("profile_id", lower("name"));
CREATE UNIQUE INDEX "projects_profile_id_name_lower_idx" ON "projects" ("profile_id", lower("name"));

ALTER TABLE "profiles" ADD CONSTRAINT "profiles_slug_chk" CHECK ("slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$');
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_name_chk" CHECK (char_length(btrim("name")) > 0);
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_description_chk" CHECK (char_length(btrim("description")) > 0);
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_version_chk" CHECK ("version" >= 1);

ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_url_chk" CHECK ("url" ~ '^https://');
ALTER TABLE "profile_links" ADD CONSTRAINT "profile_links_label_chk" CHECK (char_length(btrim("label")) > 0);

ALTER TABLE "skills" ADD CONSTRAINT "skills_name_chk" CHECK (char_length(btrim("name")) > 0);

ALTER TABLE "experiences" ADD CONSTRAINT "experiences_company_chk" CHECK (char_length(btrim("company")) > 0);
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_position_chk" CHECK (char_length(btrim("position")) > 0);
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_start_date_chk" CHECK ("start_date" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_end_date_chk" CHECK ("end_date" IS NULL OR "end_date" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_period_chk" CHECK ("end_date" IS NULL OR "end_date" >= "start_date");

ALTER TABLE "achievements" ADD CONSTRAINT "achievements_text_chk" CHECK (char_length(btrim("text")) > 0);

ALTER TABLE "projects" ADD CONSTRAINT "projects_name_chk" CHECK (char_length(btrim("name")) > 0);
ALTER TABLE "projects" ADD CONSTRAINT "projects_url_chk" CHECK ("url" ~ '^https://');


