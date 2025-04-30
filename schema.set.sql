CREATE TABLE Users
(
    mail TEXT NOT NULL PRIMARY KEY UNIQUE,
    flag TEXT (1) DEFAULT (0) NOT NULL,
    code TEXT (8),
    keys TEXT,
    pass TEXT,
    apis TEXT,
    time INTEGER
);


CREATE TABLE Apply
(
    uuid TEXT    NOT NULL PRIMARY KEY UNIQUE,
    mail TEXT    NOT NULL,
    sign INTEGER (1),
    type INTEGER (1),
    auto INTEGER (1) NOT NULL DEFAULT (0),
    flag INTEGER (1) NOT NULL DEFAULT (0),
    time INTEGER DEFAULT (0),
    next INTEGER DEFAULT (0),
    main TEXT    NOT NULL,
    list TEXT    NOT NULL,
    keys TEXT,
    cert TEXT,
    data TEXT,
    text TEXT
);
