CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS dblink;


--UPDATE ROOM appending page
CREATE TABLE rooms (
    room_uid UUID NOT NULL PRIMARY KEY,
    title VARCHAR(100),
    page_order UUID[] 
);

--UPDATE page within room appending block

--insert into pages(page_uid, title, room_uid, block_order) values (uuid_generate_v4(), 'Hello', '', ARRAY[]::UUID[]);
CREATE TABLE pages (
    page_uid UUID NOT NULL PRIMARY KEY,
    title VARCHAR(100),
    room_uid UUID NOT NULL REFERENCES rooms(room_uid),
    block_order UUID[]
);
CREATE TABLE blocks (
    block_uid UUID NOT NULL PRIMARY KEY,
    content JSONB,
    page_uid UUID NOT NULL REFERENCES pages(page_uid)
);
/*
CREATE TYPE block AS (
   page_uid UUID,
   content JSONB
);


CREATE TABLE pages (
    page_uid UUID NOT NULL PRIMARY KEY,
    title VARCHAR(100),
    room_uid UUID NOT NULL REFERENCES rooms(room_uid),
    blocks block[]
);
*/






--insert into rooms(room_uid, title, pages) values (uuid_generate_v4(), '', ARRAY[]::UUID[]);
CREATE TABLE users (
    user_id UUID NOT NULL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(128) NOT NULL,
    page_uid UUID, 
    room_uid UUID
);

CREATE TABLE roles (
    role_id INT PRIMARY KEY,
    role_name VARCHAR(100)
    -- Add more columns as needed for role attributes and permissions
);

insert into roles(role_id, role_name) values(1, 'Owner');
insert into roles(role_id, role_name) values(2, 'Member');

--insert into roles(role_id, role_name) values (, '');
CREATE TABLE workspace_roles (
    workspace_role_id UUID NOT NULL PRIMARY KEY,
    user_uid UUID NOT NULL REFERENCES users(user_id),
    room_uid UUID NOT NULL REFERENCES rooms(room_uid),
    role_id INT REFERENCES roles(role_id)
);
--insert into workspace_roles(workspace_role_id, user_uid, room_uid, role_id) values (uuid_generate_v4(), '', '', '')

