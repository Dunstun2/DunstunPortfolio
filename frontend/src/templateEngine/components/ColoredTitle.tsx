'use client';

import React from 'react';
import { useInlineEdit } from '../InlineEditContext';
import InlineText from './InlineText';

interface ColoredTitleProps {
  title: string;
  settingKey?: string;
}

export default function ColoredTitle({ title, settingKey }: ColoredTitleProps) {
  const { isInlineEditing, getSettingValue } = useInlineEdit();
  const actualTitle = settingKey ? (getSettingValue(settingKey, title) ?? title) : title;

  if (isInlineEditing && settingKey) {
    return <InlineText settingKey={settingKey} defaultValue={title} />;
  }

  const words = actualTitle.trim().split(/\s+/);
  if (words.length === 2) {
    return (
      <>
        <span className="text-secondary">{words[0]}</span> <span className="text-primary">{words[1]}</span>
      </>
    );
  } else if (words.length > 2) {
    return (
      <>
        <span className="text-secondary">{words[0]}</span>{' '}
        <span className="text-primary">{words[1]}</span>{' '}
        <span className="text-heading-light">{words.slice(2).join(' ')}</span>
      </>
    );
  }
  return <span className="text-primary">{actualTitle}</span>;
}
