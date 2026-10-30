import type { PrismaClient } from '../../../../generated/prisma/client';

export type DbClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;
