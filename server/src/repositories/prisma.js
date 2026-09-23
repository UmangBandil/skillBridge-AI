import { PrismaClient } from '@prisma/client';

let prismaInstance = null;

export function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
  return prismaInstance;
}

export const prisma = getPrismaClient();
export default prisma;
