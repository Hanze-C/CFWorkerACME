-- CreateTable
CREATE TABLE "Users" (
    "uuid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" INTEGER NOT NULL,
    "mail" TEXT NOT NULL,
    "keys" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Apply" (
    "uuid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user" INTEGER NOT NULL,
    "flag" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "main" TEXT NOT NULL,
    "list" TEXT NOT NULL,
    "keys" TEXT NOT NULL,
    "cert" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Authy" (
    "user" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "hash" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "data" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_mail_key" ON "Users"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "Users_keys_key" ON "Users"("keys");

-- CreateIndex
CREATE UNIQUE INDEX "Authy_hash_key" ON "Authy"("hash");
