import { prisma } from '@/server/clients/prismaClient';
import { aiModelServiceFactory } from '@/server/services/AiModelServiceFactory';
import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

export const RequestHelper = {
  getCurrentUser: async (req: NextRequest) => {
    const authHeader = req.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);

      const {
        payload: { userId },
      } = await jwtVerify(token, secret);

      return await prisma.user.findUnique({ where: { id: userId as string } });
    } catch (_) {
      const guestSecret = new TextEncoder().encode(process.env.GUEST_JWT_SECRET);

      const {
        payload: { guestId },
      } = await jwtVerify(token, guestSecret);

      if (guestId) {
        return {
          id: 'guest',
          firstName: 'Guest',
          lastName: 'Visitor',
          email: null,
          preference: {
            llmChoice: 'gemini-1.5-flash',
          },
        };
      }
    }
  },

  getAiModelService: async (req: NextRequest) => {
    const user = await RequestHelper.getCurrentUser(req);

    const llmChoice = user?.preference?.llmChoice ?? 'gemini-1.5-flash';

    return aiModelServiceFactory(llmChoice);
  },
};
