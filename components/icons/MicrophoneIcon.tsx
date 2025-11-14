
import React from 'react';

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6V7.5a6 6 0 0 0-12 0v5.25a6 6 0 0 0 6 6Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 18.75v.008l.011.111a.75.75 0 0 1-1.258.604L12 20.25l-2.503 1.221a.75.75 0 0 1-1.258-.605l.011-.11v-.008" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 0 1-3-3V7.5a3 3 0 0 1 6 0v4.5a3 3 0 0 1-3 3Z" />
  </svg>
);

export default MicrophoneIcon;
