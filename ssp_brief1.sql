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



select * from audioLinks;
select * from users;
select* from playlists;


