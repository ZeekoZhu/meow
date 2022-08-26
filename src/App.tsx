import classnames from 'classnames';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import './App.css';
import useResizeObserver from 'use-resize-observer';

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const imgFetcher = async (width: number, height: number, random: string) => {
  const req = fetch(`https://loremflickr.com/${width}/${height}/kitten?random=${random}`);
  await Promise.all([req, timeout(500)]);
  return URL.createObjectURL(await (await req).blob());
};

function useCatImage(width: number, height: number) {
  const [random, setRandom] = useState(Math.random());
  const {
    data,
    error
  } = useSWR([width, height, random], imgFetcher, { revalidateOnFocus: false });
  return {
    url: data as string,
    isLoading: !error && !data,
    isError: error,
    update: () => {
      if (!error && !data) {
        return;
      }
      setRandom(Math.random());
    },
  };
}

function useElementSize(ref: React.RefObject<HTMLDivElement>) {
  const { width = 320, height = 200 } = useResizeObserver({ ref });
  return { width, height };
}

function App() {
  const imgContainerRef = React.useRef<HTMLDivElement>(null);
  const { width, height } = useElementSize(imgContainerRef);
  const { url, isLoading, update } = useCatImage(width, height);
  const [catUrl, setCatUrl] = useState('');
  useEffect(() => {
    if (url) {
      setCatUrl(url);
    }
  }, [url]);

  const handleClick = async () => {
    await update();
  };

  return (
    <div className='flex flex-col h-full'>
      <div className='h-20 bg-neutral-800 flex justify-center items-center
      shrink-0 shadow-lg'>
        <button className='text-xl px-4 py-2 rounded-xl bg-pink-600 text-pink-100 font-semibold
    hover:bg-pink-500 active:bg-pink-700
   ' onClick={handleClick}>
          Meow ~
        </button>
      </div>
      <div ref={imgContainerRef}
           className='flex-1 bg-neutral-200 relative min-h-0'>
        <img className='w-full' src={catUrl}/>
        <div className={classnames('absolute top-0 left-0 bg-neutral-600/70' +
          ' z-20 w-full h-full flex justify-center items-center' +
          ' pointer-events-none transition-opacity duration-500', {
          'opacity-1': isLoading,
          'opacity-0': !isLoading,
        })}>
          <span className='text-white font-bold text-2xl'>LOADING...</span>
        </div>
      </div>
    </div>
  );
}


export default App;
