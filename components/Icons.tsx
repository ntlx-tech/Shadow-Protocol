
import React from 'react';

// Fixed strokeJoin to strokeLinejoin as per React SVG property requirements
export const MafiaIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 11h16v2H4zM16 13l2 7h-4l-2-7M6 13l-2 7h4l2-7" strokeLinecap="round" />
    <path d="M12 4v7M9 7l3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="1" fill="currentColor" />
  </svg>
);

// Fixed strokeJoin to strokeLinejoin
export const DoctorIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 8h16v12H4zM8 8V6a4 4 0 018 0v2M12 11v6M9 14h6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Fixed strokeJoin to strokeLinejoin
export const DetectiveIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35M11 7v8M7 11h8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Fixed strokeJoin to strokeLinejoin
export const CitizenIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2v20M8 22h8M12 6a4 4 0 014 4v2H8v-2a4 4 0 014-4z" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="1" fill="currentColor" />
    <path d="M10 22l1-4h2l1 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const RoleIcon = ({ role, className }: { role: string, className?: string }) => {
    switch (role) {
        case 'MAFIA': return <MafiaIcon className={className} />;
        case 'DOCTOR': return <DoctorIcon className={className} />;
        case 'DETECTIVE': return <DetectiveIcon className={className} />;
        default: return <CitizenIcon className={className} />;
    }
};
