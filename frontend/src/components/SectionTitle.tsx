import React from 'react';

interface SectionTitleProps {
  title: string;
}

export default function SectionTitle({ title }: SectionTitleProps) {
  const words = title.split(' ').filter(w => w.trim() !== '');
  
  if (words.length === 0) return null;

  return (
    <>
      {words.map((word, i) => {
        let colorClass = 'text-heading-light'; // default white
        
        if (i === 0) {
          colorClass = 'text-orange-500'; // first word is orange
        } else if (i === words.length - 1) {
          colorClass = 'text-blue-500'; // last word is blue
        }
        
        return (
          <span key={i} className={colorClass}>
            {word}{' '}
          </span>
        );
      })}
    </>
  );
}
