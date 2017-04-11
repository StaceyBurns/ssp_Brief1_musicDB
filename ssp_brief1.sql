drop database if exists SSP;
CREATE DATABASE SSP;
use SSP;

create table users(
userId int not null auto_increment,
email varchar(60) not null,
pword varchar(20) not null,
fName varchar(30) not null,
Primary key (userId, email)
);

create table playlists(
playlistId int not null auto_increment,
playlistName varchar(30) not null,
playlistUserEmail varchar(60),
playlistUserId int,
date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
foreign key (playlistUserEmail) references users(email),
foreign key (playlistUserId) references users(userId),
Primary key (playlistId)
);

create table audioLinks(
audioId int not null auto_increment,
audioName varchar(50) not null,
url varchar(200) not null,
audioLinks_playlistId int,
Primary key (audioId),
foreign key (audioLinks_playlistId) references playlists(playlistId)
);

create table audioLinksInPlaylists(
audioLinksInPlaylists_AudioId int,
audioLinksInPlaylists_playlistId int,
foreign key (audioLinksInPlaylists_AudioId) references audioLinks(audioId)
);

create table jokes(
id int not null auto_increment,
text varchar(50) not null,
date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
Primary key (id)
);

insert into users values('1', 'email@database.com', 'mypassword', 'Stacey');


insert into audioLinks values('1', 'Dance song 1', 'www.staceyburns.net', '1');
insert into audioLinks values('2', 'Pop song 1', 'www.staceyburns.net', '1');
insert into audioLinks values('3', 'Rock song 1', 'www.staceyburns.net', '1');

insert into audioLinks values('4', 'Dance song  2', 'www.staceyburns.net', '2');
insert into audioLinks values('5', 'Pop song 2', 'www.staceyburns.net', '2');
insert into audioLinks values('6', 'Rock song 2', 'www.staceyburns.net', '2');

insert into audioLinksInPlaylists values('1', '15');
insert into audioLinksInPlaylists values('2', '15');
insert into audioLinksInPlaylists values('3', '15');


insert into playlists values('1', 'pop', 'hi');
insert into playlists values('2', 'dance', 'hoi');
insert into playlists values('3', 'rock', 'hai');


select * from audioLinks;
select * from users;


