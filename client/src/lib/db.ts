import { PrismaClient } from '@prisma/client'

// Предотвращаем создание множества экземпляров Prisma Client в режиме разработки
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-multiple-instances-in-development

const prismaClientSingleton = () => {
  return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
