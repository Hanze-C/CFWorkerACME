-- noinspection SqlNoDataSourceInspectionForFile


CREATE TABLE Users
(
    mail TEXT NOT NULL
        PRIMARY KEY
        UNIQUE,
    flag TEXT (1) DEFAULT (0)
                  NOT NULL,
    code TEXT (8),
    keys TEXT,
    pass TEXT,
    apis TEXT,
    time INTEGER
);


CREATE TABLE Apply
(
    uuid INTEGER NOT NULL
        PRIMARY KEY AUTOINCREMENT,
    user INTEGER NOT NULL,
    flag INTEGER NOT NULL,
    time TEXT    NOT NULL,
    main TEXT    NOT NULL,
    list TEXT    NOT NULL,
    keys TEXT    NOT NULL,
    cert TEXT    NOT NULL
);


CREATE TABLE Authy
(
    user INTEGER NOT NULL,
    type INTEGER NOT NULL,
    hash TEXT    NOT NULL,
    time TEXT    NOT NULL,
    name TEXT    NOT NULL,
    data TEXT    NOT NULL
);


-- CreateIndex
CREATE UNIQUE INDEX "Users_mail_key" ON "Users" ("mail");

-- CreateIndex
CREATE UNIQUE INDEX "Authy_hash_key" ON "Authy" ("hash");
