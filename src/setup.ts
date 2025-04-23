import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'


async function setup(c) {
    try {
        await c.env.DB.exec(
            "CREATE TABLE IF NOT EXISTS users (" +
            "uuid INTEGER PRIMARY KEY AUTOINCREMENT," +
            "code INTEGER" +
            "mail TEXT" +
            "keys TEXT" +
            ");")
        await c.env.DB.exec(
            "CREATE TABLE IF NOT EXISTS apply (" +
            "uuid INTEGER  PRIMARY KEY AUTOINCREMENT," +
            "time INTEGER  NOT NULL" +
            "user INTEGER  NOT NULL," +
            "flag INTEGER  NOT NULL," +
            "list TEXT     ," +
            "keys TEXT     ," +
            "cert TEXT     ," +
            ");")
        await c.env.DB.exec(
            "CREATE TABLE IF NOT EXISTS authy (" +
            "hash TEXT     NOT NULL PRIMARY KEY," +
            "time INTEGER  NOT NULL" +
            "user INTEGER  NOT NULL," +
            "type INTEGER  NOT NULL," +
            "name TEXT     ," +
            "data TEXT     ," +
            ");")
        return c.json({message: 'Table created successfully'})
    } catch (e) {
        return c.json({error: e.message}, 500)
    }
}
export default setup;
