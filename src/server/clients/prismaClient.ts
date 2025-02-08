import { PrismaClient } from '@prisma/client';
import { ZPrismaClient } from '@/shared/zPrismaTypes';

let prismaInstance: ZPrismaClient | any;

if (process.env.NODE_ENV === 'production') {
  prismaInstance = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prismaInstance = global.prisma;
}

export const prisma = prismaInstance as ZPrismaClient;
