// 'use client';
// import dynamic from 'next/dynamic';
import Home from './components/Home';

// const Canvas = dynamic(() => import('./components/canvas'), {
//   ssr: false,
// });

export default function Page() {
  return <Home />;
}