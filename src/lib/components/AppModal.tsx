import { AnimatePresence, motion } from 'framer-motion';
import { Fragment, ReactNode, useLayoutEffect, useRef } from 'react';
import { zustandFactory } from '@/lib/stores/zustandFactory';

export type AppModalUpdateProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  body?: ReactNode;
  dismissible?: boolean;
};

const createAppModalStore = (set: any, get: any) => {
  return {
    dismissible: true,
    appModalVisible: false,
    setAppModalVisible: (appModalVisible: boolean) => set({ appModalVisible }),
    title: undefined as ReactNode,
    subtitle: undefined as ReactNode,
    body: undefined as ReactNode,
    updateAppModal: ({ title, subtitle, body, dismissible = true }: AppModalUpdateProps) => {
      set({ title, subtitle, body, appModalVisible: true, dismissible });
    },
  };
};

export type AppModalStore = ReturnType<typeof createAppModalStore>;
export const useAppModal: (...args: (keyof AppModalStore)[]) => AppModalStore =
  zustandFactory<AppModalStore>(createAppModalStore);

export const AppModal = () => {
  const { appModalVisible, setAppModalVisible, dismissible, title, subtitle, body }: Partial<AppModalStore> =
    useAppModal('appModalVisible', 'setAppModalVisible', 'dismissible', 'subtitle', 'title', 'body');
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!dismissible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAppModalVisible(false);
      }
    };

    if (appModalVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dismissible, appModalVisible, setAppModalVisible]);

  if (!appModalVisible) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 z-[1100] h-full w-full flex-1 cursor-default flex-col justify-end bg-gray-600 bg-opacity-30">
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: 'linear' }}
          exit={{ scale: 0 }}
          className="relative top-20 z-[1111] m-auto flex w-[330px] flex-col rounded-xl bg-white p-6 text-black md:w-[600px]"
        >
          <div
            className={'absolute right-5 top-4 scale-x-150 cursor-pointer text-xl'}
            onClick={() => setAppModalVisible(false)}
          >
            X
          </div>
          <div>
            {title && <div className="mb-1 w-full text-start text-3xl">{title}</div>}
            {subtitle && (
              <Fragment>
                <div className="w-full text-end font-bold text-base text-gray-400">{subtitle}</div>
                <hr className={'mb-2'} />
              </Fragment>
            )}
            {body && <div className="w-full">{body}</div>}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
