// src/index.ts
import {PrismaClient} from '@prisma/client'
import {PrismaD1} from '@prisma/adapter-d1'

const prismaClients = {
    async fetch(db: D1Database) {
        const adapter = new PrismaD1(db)
        const prisma = new PrismaClient({adapter})
        return prisma
    },
}

async function users(c) {
    const prisma = await prismaClients.fetch(c.env.DB)
    const users = await prisma.user.findMany()
    console.log('users', users)
    return c.json(users)
}


export default users