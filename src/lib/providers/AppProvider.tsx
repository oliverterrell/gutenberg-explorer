'use client';

import { apiClient } from '@/lib/clients/apiClient';
import { LSMessageKey } from '@/shared/types';
import { ZUser } from '@/shared/zPrismaTypes';
import { AiModel } from '@prisma/client';
import { createContext, useContext, useLayoutEffect, useState } from 'react';
import { Toast, useToast } from '@/lib/hooks/useToast';
import { modViewport } from '@/lib/util';

const AppContext = createContext<AppContext>(null);
export const useApp = () => useContext<AppContext>(AppContext);

type AppContext = {
  user?: ZUser;
  aiModels?: AiModel[];
  setUser?: (user: ZUser) => void;
  toast?: Toast;
  setToast?: (message: Toast, localStorageKey?: LSMessageKey) => void;
};

export const AppProvider = ({ children }) => {
  const { Toast, setToast, toast } = useToast();

  const [user, setUser] = useState<ZUser>(null);
  const [aiModels, setAiModels] = useState<AiModel[]>([]);

  useLayoutEffect(() => {
    const getInitialAppData = async () => {
      const [user, aiModels] = await Promise.all([
        apiClient.get(`/current-user`).then((res) => res.data.user),
        apiClient.get('/ai-model').then((res) => res.data.aiModels),
      ]);

      setUser(user);
      setAiModels(aiModels);
    };

    getInitialAppData();

    const clearMods: VoidFunction = modViewport();
    return () => clearMods();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        aiModels,
        toast,
        setToast,
      }}
    >
      <Toast />
      {children}
    </AppContext.Provider>
  );
};
