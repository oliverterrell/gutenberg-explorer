import { BrightnessLowFill } from 'react-bootstrap-icons';

export const PageLoadSpinner = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className={'fixed inset-0 z-[1010] flex flex-col items-center justify-center bg-gray-200 opacity-50'}>
      <BrightnessLowFill className={'animate-spin text-9xl text-accent opacity-100 duration-1000'} />
    </div>
  );
};
