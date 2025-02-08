'use client';

import { useBookStore } from '@/lib/stores/BookStore';
import { Fragment, useState } from 'react';
import { CheckCircleFill, ChevronLeft, Search, Stars } from 'react-bootstrap-icons';
import { AnimatePresence, motion } from 'framer-motion';

const SelectIcon = ({ selected }: { selected: boolean }) => {
  if (selected) {
    return <CheckCircleFill className="mt-1" />;
  }
  return <Fragment />;
};

type AnalysisOption = 'big-5';
type AIModel = 'gemini' | 'chat-gpt';

const MenuOption = ({ selected, setSelected, value, name }: any) => {
  return (
    <div
      onClick={() => setSelected(value)}
      className={`flex w-full cursor-pointer flex-row justify-between p-3 hover:bg-gray-600`}
    >
      {name} <SelectIcon selected={selected === value} />
    </div>
  );
};

export const ExplorerMenu = () => {
  const { gutenbergId, setGutenbergId, getBook } = useBookStore('gutenbergId', 'setGutenbergId', 'getBook');

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AnalysisOption>('big-5');
  const [model, setModel] = useState<AIModel>('gemini');

  return (
    <Fragment>
      <div
        className={`absolute left-5 mt-0 flex cursor-pointer flex-row gap-x-3 text-3xl`}
        onClick={() => setOpen(true)}
      >
        <Search /> Explore
      </div>
      <AnimatePresence>
        {open ? (
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240, transition: { ease: 'linear', duration: '0.1' } }}
            transition={{ ease: 'linear', duration: '0.1' }}
            className={`fixed left-0 top-0 h-screen w-[240px] border-r border-gray-900 bg-gray-700`}
          >
            <div className={`flex flex-col`}>
              <div
                onClick={() => setOpen(false)}
                className={`flex cursor-pointer flex-row justify-between gap-x-6 bg-accent bg-opacity-90 px-3 py-4 text-gray-800`}
              >
                <ChevronLeft className={'cursor-pointer text-xl'} />
                <div className={`font-bold text-xl leading-tight`}>Explorer Menu</div>
                <div className={'h-5 w-5'} />
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
                    onClick={getBook}
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
                <MenuOption
                  selected={false}
                  setSelected={setSelected}
                  value={'big-5'}
                  name={'Big 5 Personality'}
                />
              </div>

              {/** AI Model Choice */}
              <div className={`my-5 flex flex-col items-start text-left text-gray-200`}>
                <div className={`w-[90%] border-b border-gray-200 pb-0.5 pl-3 pt-1.5 text-left font-bold`}>
                  AI Model Choice
                </div>
                <MenuOption selected={model} setSelected={setModel} value={'gemini'} name={'Gemini'} />
                <MenuOption selected={model} setSelected={setModel} value={'chat-gpt'} name={'ChatGPT'} />
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </Fragment>
  );
};
