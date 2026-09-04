
-- ENUM TYPES
CREATE TYPE role_type AS ENUM ('Admin', 'Client');
CREATE TYPE note_type AS ENUM ('Empty', 'List', 'Table', 'Kanban', 'Calendar');
CREATE TYPE permission_type AS ENUM ('View', 'Edit');

-- USER
CREATE TABLE "User" (
    id                 UUID PRIMARY KEY,
    name               VARCHAR(75) NOT NULL,
    surname            VARCHAR(75) NOT NULL,
    email              VARCHAR(150) NOT NULL UNIQUE,
    birthday_date      DATE,
    registration_date  TIMESTAMP NOT NULL,
    password           VARCHAR(100) NOT NULL,
    role               role_type NOT NULL,
    password_reset_token_hash  VARCHAR(255),
    password_reset_expires_at  TIMESTAMP
);

-- DIRECTORY
CREATE TABLE directory (
    id           UUID PRIMARY KEY,
    title        VARCHAR(75) NOT NULL,
    created_at   TIMESTAMP NOT NULL,
    updated_at   TIMESTAMP NOT NULL,
    deleted_at   TIMESTAMP NULL,
    owner_id     UUID NOT NULL,
    version      BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_directory_owner
        FOREIGN KEY (owner_id) REFERENCES "User"(id)
);

-- NOTE
CREATE TABLE note (
    id            UUID PRIMARY KEY,
    title         VARCHAR(150) NOT NULL,
    content       JSONB NOT NULL,
    create_date   TIMESTAMP NOT NULL,
    updated_at    TIMESTAMP NOT NULL,
    deleted_at    TIMESTAMP NULL,
    note_type     note_type NOT NULL,
    is_favourite  BOOLEAN NOT NULL,
    owner_id      UUID NOT NULL,
    version       BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_note_owner
        FOREIGN KEY (owner_id) REFERENCES "User"(id)
);

-- DIRECTORY_NOTE
CREATE TABLE directory_note (
    note_id      UUID NOT NULL,
    directory_id UUID NOT NULL,
    added_at     TIMESTAMP NOT NULL,
    PRIMARY KEY (note_id, directory_id),
    CONSTRAINT fk_directorynote_note
        FOREIGN KEY (note_id) REFERENCES note(id),
    CONSTRAINT fk_directorynote_directory
        FOREIGN KEY (directory_id) REFERENCES directory(id)
);

-- PERMISSION_ACCESS
CREATE TABLE permission_access (
    id           UUID PRIMARY KEY,
    type         permission_type NOT NULL,
    user_id      UUID NOT NULL,
    created_by   UUID NOT NULL,
    note_id      UUID,
    directory_id UUID,
    created_at   TIMESTAMP NOT NULL,
    CONSTRAINT fk_perm_user
        FOREIGN KEY (user_id) REFERENCES "User"(id),
    CONSTRAINT fk_perm_created_by
        FOREIGN KEY (created_by) REFERENCES "User"(id),
    CONSTRAINT fk_perm_note
        FOREIGN KEY (note_id) REFERENCES note(id),
    CONSTRAINT fk_perm_directory
        FOREIGN KEY (directory_id) REFERENCES directory(id),
    CONSTRAINT chk_perm_note_xor_directory CHECK (
        (note_id IS NOT NULL AND directory_id IS NULL)
        OR
        (note_id IS NULL AND directory_id IS NOT NULL)
    )
);

-- NOTE_REVISION (история изменений)
CREATE TABLE note_revision (
    id          UUID PRIMARY KEY,
    note_id     UUID NOT NULL,
    title       VARCHAR(150) NOT NULL,
    content     JSONB NOT NULL,
    version     BIGINT NOT NULL,
    created_at  TIMESTAMP NOT NULL,
    created_by  UUID NOT NULL,
    CONSTRAINT fk_noterevision_note
        FOREIGN KEY (note_id) REFERENCES note(id),
    CONSTRAINT fk_noterevision_created_by
        FOREIGN KEY (created_by) REFERENCES "User"(id)
);

-- TAG
CREATE TABLE tag (
    id          UUID PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    owner_id    UUID NOT NULL,
    created_at  TIMESTAMP NOT NULL,
    deleted_at  TIMESTAMP NULL,
    CONSTRAINT fk_tag_owner
        FOREIGN KEY (owner_id) REFERENCES "User"(id),
    CONSTRAINT uq_tag_owner_name UNIQUE (owner_id, name)
);

-- NOTE_TAG
CREATE TABLE note_tag (
    note_id   UUID NOT NULL,
    tag_id    UUID NOT NULL,
    added_at  TIMESTAMP NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    CONSTRAINT fk_notetag_note
        FOREIGN KEY (note_id) REFERENCES note(id),
    CONSTRAINT fk_notetag_tag
        FOREIGN KEY (tag_id) REFERENCES tag(id)
);

-- ATTACHMENT
CREATE TABLE attachment (
    id            UUID PRIMARY KEY,
    note_id       UUID NOT NULL,
    file_name     VARCHAR(255) NOT NULL,
    content_type  VARCHAR(100) NOT NULL,
    file_size     BIGINT NOT NULL,
    storage_key   VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL,
    created_by    UUID NOT NULL,
    CONSTRAINT fk_attachment_note
        FOREIGN KEY (note_id) REFERENCES note(id),
    CONSTRAINT fk_attachment_created_by
        FOREIGN KEY (created_by) REFERENCES "User"(id)
);

-- COMMENT
CREATE TABLE "comment" (
    id          UUID PRIMARY KEY,
    note_id     UUID NOT NULL,
    author_id   UUID NOT NULL,
    content     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL,
    updated_at  TIMESTAMP NOT NULL,
    deleted_at  TIMESTAMP NULL,
    CONSTRAINT fk_comment_note
        FOREIGN KEY (note_id) REFERENCES note(id),
    CONSTRAINT fk_comment_author
        FOREIGN KEY (author_id) REFERENCES "User"(id)
);