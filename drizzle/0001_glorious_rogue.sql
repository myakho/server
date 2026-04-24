CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`motive` text NOT NULL,
	`name` varchar(100) NOT NULL,
	`age` int NOT NULL,
	`gender` varchar(20) NOT NULL,
	`reason` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
