PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE user (
	id INTEGER NOT NULL, 
	username VARCHAR(80) NOT NULL, 
	email VARCHAR(120) NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (username), 
	UNIQUE (email)
);
INSERT INTO user VALUES(1,'asdf','asdfasdf');
CREATE TABLE sport (
	id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	icon VARCHAR(255), 
	is_active BOOLEAN, 
	PRIMARY KEY (id)
);
INSERT INTO sport VALUES(1,'Football','⚽',1);
INSERT INTO sport VALUES(2,'Basketball','🏀',1);
INSERT INTO sport VALUES(3,'Tennis','🎾',1);
INSERT INTO sport VALUES(4,'Baseball','⚾',1);
INSERT INTO sport VALUES(5,'Hockey','🏒',1);
INSERT INTO sport VALUES(6,'Boxing','🥊',1);
INSERT INTO sport VALUES(7,'MMA','🥋',1);
INSERT INTO sport VALUES(8,'Cricket','🏏',1);
CREATE TABLE IF NOT EXISTS "transaction" (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	transaction_type VARCHAR(20) NOT NULL, 
	amount FLOAT NOT NULL, 
	description VARCHAR(255), 
	created_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES user (id)
);
CREATE TABLE event (
	id INTEGER NOT NULL, 
	sport_id INTEGER NOT NULL, 
	home_team VARCHAR(100) NOT NULL, 
	away_team VARCHAR(100) NOT NULL, 
	start_time DATETIME NOT NULL, 
	status VARCHAR(20), 
	home_score INTEGER, 
	away_score INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(sport_id) REFERENCES sport (id)
);
INSERT INTO event VALUES(1,1,'Manchester United','Liverpool','2025-06-28 04:19:11.118184','upcoming',0,0);
INSERT INTO event VALUES(2,1,'Barcelona','Real Madrid','2025-06-28 07:19:11.118184','upcoming',0,0);
INSERT INTO event VALUES(3,1,'Chelsea','Arsenal','2025-06-28 02:49:11.118184','live',0,0);
INSERT INTO event VALUES(4,2,'Lakers','Warriors','2025-06-28 05:19:11.118184','upcoming',0,0);
INSERT INTO event VALUES(5,2,'Bulls','Celtics','2025-06-28 08:19:11.118184','upcoming',0,0);
INSERT INTO event VALUES(6,3,'Novak Djokovic','Rafael Nadal','2025-06-28 06:19:11.118184','upcoming',0,0);
INSERT INTO event VALUES(7,3,'Serena Williams','Naomi Osaka','2025-06-28 09:19:11.118184','upcoming',0,0);
INSERT INTO event VALUES(8,4,'Yankees','Red Sox','2025-06-28 10:19:11.118184','upcoming',0,0);
CREATE TABLE betting_option (
	id INTEGER NOT NULL, 
	event_id INTEGER NOT NULL, 
	option_type VARCHAR(50) NOT NULL, 
	option_value VARCHAR(100) NOT NULL, 
	odds FLOAT NOT NULL, 
	is_active BOOLEAN, 
	PRIMARY KEY (id), 
	FOREIGN KEY(event_id) REFERENCES event (id)
);
INSERT INTO betting_option VALUES(1,1,'win','home',2.1000000000000000888,1);
INSERT INTO betting_option VALUES(2,1,'win','away',3.2000000000000001776,1);
INSERT INTO betting_option VALUES(3,1,'win','draw',3.5,1);
INSERT INTO betting_option VALUES(4,1,'total_goals','over_2.5',1.8000000000000000444,1);
INSERT INTO betting_option VALUES(5,1,'total_goals','under_2.5',2.0,1);
INSERT INTO betting_option VALUES(6,2,'win','home',2.1000000000000000888,1);
INSERT INTO betting_option VALUES(7,2,'win','away',3.2000000000000001776,1);
INSERT INTO betting_option VALUES(8,2,'win','draw',3.5,1);
INSERT INTO betting_option VALUES(9,2,'total_goals','over_2.5',1.8000000000000000444,1);
INSERT INTO betting_option VALUES(10,2,'total_goals','under_2.5',2.0,1);
INSERT INTO betting_option VALUES(11,3,'win','home',2.1000000000000000888,1);
INSERT INTO betting_option VALUES(12,3,'win','away',3.2000000000000001776,1);
INSERT INTO betting_option VALUES(13,3,'win','draw',3.5,1);
INSERT INTO betting_option VALUES(14,3,'total_goals','over_2.5',1.8000000000000000444,1);
INSERT INTO betting_option VALUES(15,3,'total_goals','under_2.5',2.0,1);
INSERT INTO betting_option VALUES(16,4,'win','home',1.8999999999999999111,1);
INSERT INTO betting_option VALUES(17,4,'win','away',1.8999999999999999111,1);
INSERT INTO betting_option VALUES(18,4,'total_points','over_200',1.8500000000000000888,1);
INSERT INTO betting_option VALUES(19,4,'total_points','under_200',1.9499999999999999555,1);
INSERT INTO betting_option VALUES(20,5,'win','home',1.8999999999999999111,1);
INSERT INTO betting_option VALUES(21,5,'win','away',1.8999999999999999111,1);
INSERT INTO betting_option VALUES(22,5,'total_points','over_200',1.8500000000000000888,1);
INSERT INTO betting_option VALUES(23,5,'total_points','under_200',1.9499999999999999555,1);
INSERT INTO betting_option VALUES(24,6,'win','home',1.6999999999999999555,1);
INSERT INTO betting_option VALUES(25,6,'win','away',2.1000000000000000888,1);
INSERT INTO betting_option VALUES(26,6,'sets','over_3.5',2.2000000000000001776,1);
INSERT INTO betting_option VALUES(27,6,'sets','under_3.5',1.6000000000000000888,1);
INSERT INTO betting_option VALUES(28,7,'win','home',1.6999999999999999555,1);
INSERT INTO betting_option VALUES(29,7,'win','away',2.1000000000000000888,1);
INSERT INTO betting_option VALUES(30,7,'sets','over_3.5',2.2000000000000001776,1);
INSERT INTO betting_option VALUES(31,7,'sets','under_3.5',1.6000000000000000888,1);
INSERT INTO betting_option VALUES(32,8,'win','home',1.8999999999999999111,1);
INSERT INTO betting_option VALUES(33,8,'win','away',1.8999999999999999111,1);
INSERT INTO betting_option VALUES(34,8,'total_points','over_200',1.8500000000000000888,1);
INSERT INTO betting_option VALUES(35,8,'total_points','under_200',1.9499999999999999555,1);
CREATE TABLE bet (
	id INTEGER NOT NULL, 
	user_id INTEGER NOT NULL, 
	betting_option_id INTEGER NOT NULL, 
	amount FLOAT NOT NULL, 
	odds FLOAT NOT NULL, 
	potential_payout FLOAT NOT NULL, 
	status VARCHAR(20), 
	placed_at DATETIME, 
	settled_at DATETIME, 
	PRIMARY KEY (id), 
	FOREIGN KEY(user_id) REFERENCES user (id), 
	FOREIGN KEY(betting_option_id) REFERENCES betting_option (id)
);
COMMIT;
