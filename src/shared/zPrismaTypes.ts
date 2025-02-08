import { Prisma, PrismaClient } from '@prisma/client';

/** User.preference JSONB type */
export type UserPreference = {
  llmChoice?: string;
};

/** __User__ prisma type with JSONB typing */
export type ZUser = Omit<Prisma.UserGetPayload<any>, 'preference'> & {
  preference?: UserPreference;
};

/** __UserCreateInput__ prisma type with JSONB typing */
export type ZUserCreateInput = Omit<Prisma.UserCreateInput, 'preference'> & {
  preference?: UserPreference;
};

/** __UserUpdateInput__ prisma type with JSONB typing */
export type ZUserUpdateInput = Omit<Prisma.UserUpdateInput, 'preference'> & {
  preference?: UserPreference;
};

/** __PrismaClient__ prisma type with zod typing */
export type ZPrismaClient = Omit<PrismaClient, 'user'> & {
  user: Omit<PrismaClient['user'], 'findUnique' | 'findFirst' | 'findMany' | 'create' | 'update'> & {
    findUnique(args: Prisma.UserFindUniqueArgs): Promise<ZUser | null>;
    findFirst(args?: Prisma.UserFindFirstArgs): Promise<ZUser | null>;
    findMany(args?: Prisma.UserFindManyArgs): Promise<ZUser[]>;
    create(args: Omit<Prisma.UserCreateArgs, 'data'> & { data: ZUserCreateInput }): Promise<ZUser>;
    update(args: Omit<Prisma.UserUpdateArgs, 'data'> & { data: ZUserUpdateInput }): Promise<ZUser>;
  };
};
