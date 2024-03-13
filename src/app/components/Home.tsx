import React from 'react';
import TopNav from './TopNav';

const Home = () => {
  return (
    <>
      <TopNav />
      <div>
        This is the home page
        Server side rendered
      </div>
    </>
  );
};

export default Home;