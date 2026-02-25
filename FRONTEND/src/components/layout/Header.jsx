import React from 'react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full h-28 flex items-center justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {/* Changed text-[26px] to text-[34px] for bigger impact */}
        <h1 className="logo-shine text-[28px] tracking-[0.2em] uppercase cursor-default filter drop-shadow-lg">
          Karuna AI
        </h1>
      </div>
    </header>
  );
};

export default Header;