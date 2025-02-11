'use client';

import { apiClient } from '@/lib/clients/apiClient';
import { useAppModal } from '@/lib/components/AppModal';
import { useApp } from '@/lib/providers/AppProvider';
import { useBookStore } from '@/lib/stores/BookStore';
import { usePressEnterFor } from '@/lib/util';
import { UtilActionType } from '@/shared';
import { AiModel } from '@prisma/client';
import { Fragment, useEffect, useState } from 'react';
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
  const { user, setUser, aiModels, setToast, toast } = useApp();

  const {
    gutenbergId,
    setGutenbergId,
    getBook,
    book,
    setBookIsLoading,
    setBook,
    explorerMenuVisible,
    setExplorerMenuVisible,
  } = useBookStore(
    'getBook',
    'gutenbergId',
    'setGutenbergId',
    'book',
    'setBookIsLoading',
    'setBook',
    'explorerMenuVisible',
    'setExplorerMenuVisible'
  );
  const { updateAppModal } = useAppModal('updateAppModal');

  const [model, setModel] = useState<AiModel['name']>(user?.preference?.llmChoice ?? 'gemini-1.5-flash');
  const [modelUpdateProcessing, setModelUpdateProcessing] = useState(false);
  const [big5Processing, setBig5Processing] = useState(false);
  const [colorPaletteProcessing, setColorPaletteProcessing] = useState(false);
  const [musicalTheatreProcessing, setMusicalTheatreProcessing] = useState(false);

  useEffect(() => {
    let processingTimeout: NodeJS.Timeout;
    let stillProcessingTimeout: NodeJS.Timeout;
    let longProcessingTimeout: NodeJS.Timeout;

    if (big5Processing || colorPaletteProcessing || musicalTheatreProcessing) {
      processingTimeout = setTimeout(() => {
        setToast({ type: 'info', message: 'Processing... Please wait!' });
      }, 5000);
      stillProcessingTimeout = setTimeout(() => {
        setToast({ type: 'info', message: 'Still Processing... One moment please!' });
      }, 18000);
      longProcessingTimeout = setTimeout(() => {
        setToast({ type: 'info', message: `This will be complete soon. How's your day going?` });
      }, 30000);
    } else if (toast?.type === 'info') {
      setToast(null);
    }

    return () => {
      clearTimeout(processingTimeout);
      clearTimeout(stillProcessingTimeout);
      clearTimeout(longProcessingTimeout);
    };
  }, [big5Processing, colorPaletteProcessing, musicalTheatreProcessing]);

  const updateUserLlmChoice = async (llmChoice: string) => {
    if (llmChoice === user.preference?.llmChoice) return;

    setToast(null);
    setModel(llmChoice);
    setModelUpdateProcessing(true);
    apiClient
      .patch('/current-user', { preference: { llmChoice } })
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
      .catch((err: any) => {
        setToast({ type: 'info', message: "Couldn't find that book" });
        setBookIsLoading(false);
        console.log(err);
      });
  };

  /**
   * Big 5 Personality Traits
   */
  const handleBig5 = async () => {
    if (!book) {
      setToast({ type: 'info', message: 'Please open a book first!' });
      return;
    }

    setBig5Processing(true);

    const [authorResponse, big5Response] = await Promise.all([
      apiClient.post('/util', { book, action: UtilActionType.PARSE_AUTHOR }),
      apiClient.post('/big-5', { book }),
    ]);

    updateAppModal({
      title: (
        <span>
          {book.title}
          {authorResponse?.data?.author ? (
            <Fragment>
              <br />
              <span className={'text-lg'}>By {authorResponse.data.author}</span>
            </Fragment>
          ) : null}
        </span>
      ),
      subtitle: 'Big 5 Personality Traits 📊',
      body: (
        <Fragment>
          <div
            className={
              'relative mx-auto my-6 flex w-[60%] flex-col gap-y-2 rounded-md border-2 border-orange-400 px-5 py-3 drop-shadow-md'
            }
          >
            {Object.entries(big5Response.data.big5).map(([aspect, score]: any, i: number) => {
              return (
                <div
                  key={`big-5-${i}`}
                  className={`flex flex-row justify-between drop-shadow-none ${score <= 25 ? 'text-rose-600' : score <= 50 ? 'text-yellow-500' : score <= 75 ? 'text-teal-400' : 'text-emerald-500'}`}
                >
                  <div className={'font-bold text-lg'}>{aspect}</div>
                  <div className={'font-jetbrains'}>{score}%</div>
                </div>
              );
            })}
          </div>
          <div className={'mx-auto mb-2 mt-3 w-[90%] text-lg'}>{big5Response.data.summary}</div>
          <div className={'my-4 w-[97%] text-right text-base italic text-gray-400'}>
            –{' '}
            {
              aiModels.find((aiModel) => aiModel.model === (user?.preference?.llmChoice ?? 'gemini-1.5-flash'))
                .name
            }
          </div>
        </Fragment>
      ),
    });
    setBig5Processing(false);
  };

  /**
   * Color Palette
   */
  const handleColorPalette = async () => {
    if (!book) {
      setToast({ type: 'info', message: 'Please open a book first!' });
      return;
    }

    setColorPaletteProcessing(true);

    const [authorResponse, colorPaletteResponse] = await Promise.all([
      apiClient.post('/util', { book, action: UtilActionType.PARSE_AUTHOR }),
      apiClient.post('/color-palette', { book }),
    ]);

    updateAppModal({
      title: (
        <span>
          {book.title}
          {authorResponse?.data?.author ? (
            <Fragment>
              <br />
              <span className={'text-lg'}>By {authorResponse.data.author}</span>
            </Fragment>
          ) : null}
        </span>
      ),
      subtitle: `Color Palette ✨`,
      body: (
        <Fragment>
          <div
            className={'relative mx-auto my-6 flex w-[60%] flex-col gap-y-2 rounded-md px-5 py-3 drop-shadow-md'}
          >
            {colorPaletteResponse.data.colorPalette.slice(0, 5).map((colorObj: any, i: number) => {
              const { color, hexCode } = colorObj;

              return (
                <div
                  key={`color-palette-${i}`}
                  className={`flex flex-row justify-between drop-shadow-none`}
                  // style={{ color: hexCode }}
                >
                  <div className={'pt-3 font-bold text-lg'}>{color}</div>
                  <div className={'h-12 w-12'} style={{ backgroundColor: hexCode }} />
                </div>
              );
            })}
          </div>
          <div className={'mx-auto mb-2 mt-3 w-[90%] text-lg'}>{colorPaletteResponse.data.summary}</div>
          <div className={'my-4 w-[90%] text-right text-base italic text-gray-400'}>
            –{' '}
            {
              aiModels.find((aiModel) => aiModel.model === (user?.preference?.llmChoice ?? 'gemini-1.5-flash'))
                .name
            }
          </div>
        </Fragment>
      ),
    });
    setColorPaletteProcessing(false);
  };

  /**
   * Musical Theatre
   */
  const handleMusicalTheatre = async () => {
    if (!book) {
      setToast({ type: 'info', message: 'Please open a book first!' });
      return;
    }

    setMusicalTheatreProcessing(true);

    const [authorResponse, musicalGenreResponse] = await Promise.all([
      apiClient.post('/util', { book, action: UtilActionType.PARSE_AUTHOR }),
      apiClient.post('/musical-theatre', { book }),
    ]);

    updateAppModal({
      title: (
        <span>
          {book.title}
          {authorResponse?.data?.author ? (
            <Fragment>
              <br />
              <span className={'text-lg'}>By {authorResponse.data.author}</span>
            </Fragment>
          ) : null}
        </span>
      ),
      subtitle: `Musical Theatre 🎭`,
      body: (
        <Fragment>
          <div className={'mx-auto mb-2 mt-5 w-full text-center font-bold text-4xl'}>
            {musicalGenreResponse.data.genre}
          </div>
          <div
            className={'relative mx-auto my-6 flex w-[80%] flex-col gap-y-2 rounded-md px-5 py-3 drop-shadow-md'}
          >
            {musicalGenreResponse.data.celebrityRoles.map((celebrityRole: any, i: number) => {
              const { celebrity, role } = celebrityRole;

              return (
                <div
                  key={`color-palette-${i}`}
                  className={`flex flex-row justify-between text-lg drop-shadow-none`}
                >
                  <div className={'font-bold'}>{celebrity}</div>
                  <div className={'italic'}>{role}</div>
                </div>
              );
            })}
          </div>
          <div className={'mx-auto mb-2 mt-3 w-[90%] text-lg'}>{musicalGenreResponse.data.summary}</div>
          <div className={'my-4 w-[90%] text-right text-base italic text-gray-400'}>
            –{' '}
            {
              aiModels.find((aiModel) => aiModel.model === (user?.preference?.llmChoice ?? 'gemini-1.5-flash'))
                .name
            }
          </div>
        </Fragment>
      ),
    });
    setMusicalTheatreProcessing(false);
  };

  usePressEnterFor(handleGetBook, !Number.isNaN(gutenbergId));

  return (
    <Fragment>
      <div
        className={`fixed inset-0 z-[9000] ${big5Processing || colorPaletteProcessing || musicalTheatreProcessing ? '' : 'hidden'}`}
      />
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
                {book ? (
                  <div
                    onClick={() => {
                      setBook(null);
                      setExplorerMenuVisible(false);
                    }}
                    className={'mt-2 w-full cursor-pointer pr-4 text-end underline underline-offset-2'}
                  >
                    Close current book
                  </div>
                ) : null}
              </div>

              {/** AI Analysis */}
              <div className={`my-5 flex flex-col items-start text-left text-gray-200`}>
                <div
                  className={`flex w-[90%] flex-row gap-x-1 border-b border-gray-200 pb-0.5 pl-3 pt-1.5 text-left font-bold`}
                >
                  Run Analysis <Stars className={`translate-y-0.5`} />
                </div>
                <MenuOption
                  name={'Big 5 Personality Traits'}
                  onClick={handleBig5}
                  isProcessing={big5Processing}
                />
                <MenuOption
                  name={'Color Palette'}
                  onClick={handleColorPalette}
                  isProcessing={colorPaletteProcessing}
                />
                <MenuOption
                  name={'Musical Theatre'}
                  onClick={handleMusicalTheatre}
                  isProcessing={musicalTheatreProcessing}
                />
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
