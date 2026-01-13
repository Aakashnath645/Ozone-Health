import React from 'react';

interface SkeletonProps {
  className?: string;
}

const SkeletonCard: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div 
      className={`bg-white/20 dark:bg-white/5 backdrop-blur-md border border-white/20 rounded-[2rem] animate-pulse ${className}`} 
      role="status" 
      aria-label="Loading..."
    />
  );
};

export default SkeletonCard;