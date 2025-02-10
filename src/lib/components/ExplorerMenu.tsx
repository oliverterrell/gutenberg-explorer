'use client';

import { apiClient } from '@/lib/clients/apiClient';
import { useAppModal } from '@/lib/components/AppModal';
import { useApp } from '@/lib/providers/AppProvider';
import { useBookStore } from '@/lib/stores/BookStore';
import { usePressEnterFor } from '@/lib/util';
import { AiModel } from '@prisma/client';
import { Fragment, memo, useState } from 'react';
import { BrightnessLow, CheckCircleFill, ChevronLeft, Search, Stars, X, XLg } from 'react-bootstrap-icons';
import { AnimatePresence, motion } from 'framer-motion';

const SelectIcon = ({ selected }: { selected: boolean }) => {
  if (selected) {
    return <CheckCircleFill className="mt-1" />;
  }
  return <Fragment />;
};

const MenuOption = ({ selected, onClick, name, isProcessing }: any) => {
  return (
    <div
      onClick={typeof onClick === 'function' ? onClick : undefined}
      className={`flex w-full cursor-pointer flex-row justify-between p-3 hover:bg-gray-600`}
    >
      {name}{' '}
      {isProcessing ? (
        <BrightnessLow className={'animate-spin text-lg duration-300'} />
      ) : (
        <SelectIcon selected={selected} />
      )}
    </div>
  );
};

export const ExplorerMenu = () => {
  const { user, setUser, aiModels, setToast } = useApp();

  const { gutenbergId, setGutenbergId, getBook, book } = useBookStore(
    'getBook',
    'gutenbergId',
    'setGutenbergId',
    'book'
  );
  const { updateAppModal } = useAppModal('updateAppModal');

  const [explorerMenuVisible, setExplorerMenuVisible] = useState(false);
  const [model, setModel] = useState<AiModel['name']>(user?.preference?.llmChoice ?? 'gemini-1.5-flash');
  const [modelUpdateProcessing, setModelUpdateProcessing] = useState(false);
  const [alterSeedProcessing, setAlterSeedProcessing] = useState(false);

  const updateUserLlmChoice = async (llmChoice: string) => {
    if (llmChoice === user.preference?.llmChoice) return;

    setToast(null);
    setModel(llmChoice);
    setModelUpdateProcessing(true);
    apiClient
      .patch('/current-user', { user, preference: { llmChoice } })
      .then((res) => {
        setUser(res.data.user);
        setModel(res.data.user.preference?.llmChoice ?? 'gemini-1.5-flash');
      })
      .finally(() => {
        setToast({ type: 'success', message: 'Updated User Preference' });
        setModelUpdateProcessing(false);
      });
  };

  const handleGetBook = () => {
    getBook()
      .then(() => {
        setExplorerMenuVisible(false);
      })
      .catch((err: any) => console.log(err));
  };

  const handleAlterSeed = async () => {
    if (!book) {
      setToast({ type: 'info', message: 'Please open a book first!' });
      return;
    }

    setAlterSeedProcessing(true);

    const seed =
      'Hello and welcome to the Project Gutenberg Explorer! I am your host, Mariah Carey. How may I assist you today?';

    const { data } = await apiClient.post('/alter-seed', {
      seed,
      llmChoice: user.preference?.llmChoice ?? 'gpt-4o',
    });

    console.log(data.text);

    updateAppModal({ title: 'Alter Seed', body: data.text });
    setAlterSeedProcessing(false);
    return data.text;
  };

  usePressEnterFor(handleGetBook, !Number.isNaN(gutenbergId));

  return (
    <Fragment>
      <div
        className={`absolute left-5 mt-0 flex cursor-pointer flex-row gap-x-3 text-3xl`}
        onClick={() => setExplorerMenuVisible(true)}
      >
        <Search /> Explore
      </div>
      <AnimatePresence>
        {explorerMenuVisible ? (
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240, transition: { ease: 'linear', duration: '0.1' } }}
            transition={{ ease: 'linear', duration: '0.1' }}
            className={`fixed left-0 top-0 z-[1000] h-screen w-[240px] border-r border-gray-900 bg-gray-700`}
          >
            <div className={`flex flex-col`}>
              <div
                onClick={() => setExplorerMenuVisible(false)}
                className={`flex cursor-pointer flex-row justify-between gap-x-6 bg-accent bg-opacity-90 px-3 py-4 text-gray-800`}
              >
                <ChevronLeft className={'text-xl'} />
                <div className={`font-bold text-xl leading-tight`}>Explorer Menu</div>
                <XLg className={'pt-0.5 text-xl'} />
              </div>

              {/** Book Finder */}
              <div className={`my-5 flex flex-col items-start text-left text-gray-200`}>
                <div className={`w-[90%] border-b border-gray-200 pb-0.5 pl-3 pt-1.5 text-left font-bold`}>
                  Book Finder
                </div>
                <div className={'ml-2 mt-1 flex flex-row gap-x-3'}>
                  <input
                    type={'number'}
                    value={gutenbergId || ''}
                    onChange={(e) => setGutenbergId(parseInt(e.target.value))}
                    placeholder={'Gutenberg ID #'}
                    className={'rounded-lg border border-gray-800 pl-1.5 pt-1 text-black'}
                  />
                  <button
                    onClick={handleGetBook}
                    className={`rounded-lg bg-gray-800 px-3 py-1.5 leading-snug text-accent ${gutenbergId === null ? 'text-gray-200 opacity-30' : '!bg-accent text-gray-800'}`}
                    disabled={typeof gutenbergId !== 'number'}
                  >
                    Get book
                  </button>
                </div>
              </div>

              {/** AI Analysis */}
              <div className={`my-5 flex flex-col items-start text-left text-gray-200`}>
                <div
                  className={`flex w-[90%] flex-row gap-x-1 border-b border-gray-200 pb-0.5 pl-3 pt-1.5 text-left font-bold`}
                >
                  Run Analysis <Stars className={`translate-y-0.5`} />
                </div>
                <MenuOption name={'Big 5 Personality Traits'} />
                <MenuOption name={'Alter Seed'} onClick={handleAlterSeed} isProcessing={alterSeedProcessing} />
              </div>

              {/** AI Model Choice */}
              <div className={`my-5 flex flex-col items-start text-left text-gray-200`}>
                <div className={`w-[90%] border-b border-gray-200 pb-0.5 pl-3 pt-1.5 text-left font-bold`}>
                  AI Model Choice
                </div>
                {aiModels.map((aiModel, i) => {
                  return (
                    <MenuOption
                      isProcessing={aiModel.model === model && modelUpdateProcessing}
                      key={`ai-model-menu-option-${i}`}
                      selected={(user?.preference?.llmChoice ?? 'gemini-1.5-flash') === aiModel.model}
                      onClick={() => updateUserLlmChoice(aiModel.model)}
                      name={aiModel.name}
                    />
                  );
                })}
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </Fragment>
  );
};
