DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS Recipes;
DROP TABLE IF EXISTS EnglishWords;

CREATE TABLE Items (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    handle  TEXT    NOT NULL
                    UNIQUE,
    emoji   TEXT    DEFAULT NULL,
    is_new  INTEGER NOT NULL
                    DEFAULT 0,
    explore INTEGER NOT NULL
                    DEFAULT 0,
    reward  INTEGER NOT NULL
                    DEFAULT 0,
    mask    INTEGER NOT NULL
                    DEFAULT (0),
    dep     INTEGER,
    freq    INTEGER
);

CREATE UNIQUE INDEX idx_items_handle ON Items(handle);

INSERT INTO Items (handle, emoji) VALUES ('Water', char(128167));
INSERT INTO Items (handle, emoji) VALUES ('Fire', char(128293));
INSERT INTO Items (handle, emoji) VALUES ('Wind', char(127788));
INSERT INTO Items (handle, emoji) VALUES ('Earth', char(127757));
INSERT INTO Items (handle, emoji, mask) VALUES ('Nothing', '', 1);

CREATE TABLE Recipes (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	ingrA_id INTEGER NOT NULL,
	ingrB_id INTEGER NOT NULL,
	result_id INTEGER DEFAULT NULL,
    mask      INTEGER NOT NULL
                      DEFAULT (0),
	FOREIGN KEY (ingrA_id) REFERENCES Items(id),
	FOREIGN KEY (ingrB_id) REFERENCES Items(id),
	FOREIGN KEY (result_id) REFERENCES Items(id)
);

CREATE INDEX idx_recipes_ingrA ON Recipes(ingrA_id);
CREATE INDEX idx_recipes_ingrB ON Recipes(ingrB_id);
CREATE INDEX idx_recipes_res ON Recipes(result_id);

CREATE TABLE EnglishWords (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    lemma TEXT    NOT NULL,
    PoS   TEXT    NOT NULL,
    freq  INTEGER
);

