import React from 'react';

export const Header: React.FC = () => (
  <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
        <img
          src="https://i.postimg.cc/rR8XF9Cb/logo.png" 
          alt="ABODA AI Logo"
          className="w-12 h-12 rgb-glow-effect"
        />
        ABODA AI
      </h1>
      <p className="mt-2 font-semibold text-md sm:text-lg tagline-effect">
        Image Enhancement Ai Tool Created By AbdelRahman Yasser
      </p>
    </div>
  </header>
);