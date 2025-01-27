create table if not exists user_status (
    id serial primary key,
    status varchar(100) not null
);

insert into user_status (id, status)
values
    (1, 'active'),
    (2, 'inactive'),
    (3, 'deleted');

create table if not exists roles (
    id serial primary key,
    name varchar(255) not null unique,
    permissions integer not null
);

insert into roles (id, name, permissions)
values
    (1, 'Create Users', 1),
    (2, 'Read Users', 2),
    (3, 'Update Users', 4),
    (4, 'Delete Users', 8),
    (5, 'Create Roles', 16),
    (6, 'Read Roles', 32),
    (7, 'Update Roles', 64),
    (8, 'Delete Roles', 128),
    (9, 'Create Posts', 256),
    (10, 'Update Posts', 512),
    (11, 'Delete Posts', 1024),
    (12, 'Admin', 2047);

create table if not exists users (
    id serial primary key,
    username varchar(255) not null,
    password text not null,
    email varchar(255) not null unique,
    status_id integer not null default 1,
    created_at timestamp not null default current_timestamp,
    last_update timestamp not null default current_timestamp,
    foreign key (status_id) references user_status(id)
);

create table if not exists user_roles (
    user_id integer not null,
    role_id integer not null,
    primary key (user_id, role_id),
    foreign key (user_id) references users(id),
    foreign key (role_id) references roles(id)
);

create table if not exists post_status (
    id serial primary key,
    status varchar(100) not null
);

insert into post_status (id, status)
values
    (1, 'active'),
    (2, 'inactive'),
    (3, 'deleted'),
    (4, 'draft');

create table if not exists posts (
    id serial primary key,
    title varchar(255) not null,
    short_description varchar(300),
    content text not null,
    user_id integer not null,
    status_id integer not null default 1,
    keywords jsonb default '[]',
    views integer default 0,
    created_at timestamp not null default current_timestamp,
    last_update timestamp not null default current_timestamp,
    foreign key (user_id) references users(id)
);

create table if not exists audit_logs (
    id serial primary key,
    table_name varchar(255) not null,
    row_id integer not null,
    user_id integer not null,
    operation varchar(255) not null,
    log_date timestamp not null default current_timestamp,
    details text not null,
    foreign key (user_id) references users(id)
);

create table if not exists logs (
    id serial primary key,
    content text,
    log_date timestamp not null default current_timestamp
);