alter table items
rename column author to user_id;

alter table items
add column author text;
