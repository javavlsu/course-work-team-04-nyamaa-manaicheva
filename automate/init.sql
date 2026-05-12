CREATE TYPE role_type AS ENUM ('Admin', 'Client');
CREATE TYPE note_type AS ENUM ('Empty', 'List', 'Table', 'Kanban', 'Calendar');
CREATE TYPE permission_type AS ENUM ('View', 'Edit');

CREATE TABLE "User" (
    id              UUID PRIMARY KEY,
    name            VARCHAR(75),
    surname         VARCHAR(75),
    email           VARCHAR(150),
    birthday_date   DATE,
    registration_date TIMESTAMP,
    password        VARCHAR(100),
    role            role_type
);

CREATE TABLE admin (
    user_id UUID PRIMARY KEY,
    code    UUID NOT NULL,
    CONSTRAINT fk_admin_user
        FOREIGN KEY (user_id) REFERENCES "User"(id)
);

CREATE TABLE directory (
    id           UUID PRIMARY KEY,
    title        VARCHAR(75),
    created_date TIMESTAMP,
    owner_id     UUID NOT NULL,
    CONSTRAINT fk_directory_owner
        FOREIGN KEY (owner_id) REFERENCES "User"(id)
);

CREATE TABLE note (
    id            UUID PRIMARY KEY,
    title         VARCHAR(150),
    content       VARCHAR(1000),
    create_date   TIMESTAMP,
    note_type     note_type,
    is_favourite  BOOLEAN,
    directory     UUID,
    owner_id      UUID NOT NULL,
    CONSTRAINT fk_note_owner
        FOREIGN KEY (owner_id) REFERENCES "User"(id),
    CONSTRAINT fk_note_directory
        FOREIGN KEY (directory) REFERENCES Directory(id)
);

CREATE TABLE directory_note (
    note_id      UUID NOT NULL,
    directory_id UUID NOT NULL,
    PRIMARY KEY (note_id, directory_id),
    CONSTRAINT fk_directorynote_note
        FOREIGN KEY (note_id) REFERENCES Note(id),
    CONSTRAINT fk_directorynote_directory
        FOREIGN KEY (directory_id) REFERENCES Directory(id)
);

CREATE TABLE permission_access (
    id           UUID PRIMARY KEY,
    type         permission_type,
    note_id      UUID,
    user_granted UUID,
    directory_id UUID,
    CONSTRAINT fk_perm_note
        FOREIGN KEY (note_id) REFERENCES Note(id),
    CONSTRAINT fk_perm_directory
        FOREIGN KEY (directory_id) REFERENCES Directory(id),
    CONSTRAINT fk_perm_user
        FOREIGN KEY (user_granted) REFERENCES "User"(id)
);
