'use client';

import { Accordion } from '@mantine/core';
import React from 'react';

type AccordionListProps = {
  className?: string;
  list: {
    icon?: React.ReactNode;
    label: string;
    content: string | React.ReactNode;
  }[];
};

const AccordionLists = ({ className, list = [] }: AccordionListProps) => {
  const items = list.map((item, index) => (
    <Accordion.Item key={index} value={item.label}>
      <Accordion.Control icon={item?.icon ?? undefined}>
        {item.label.toUpperCase()}
      </Accordion.Control>
      <Accordion.Panel>{item.content}</Accordion.Panel>
    </Accordion.Item>
  ));

  return (
    <Accordion
      className={className ?? 'w-full'}
      multiple
      value={list.map((e) => e.label)}
      variant="contained"
      chevronPosition="right"
    >
      {items}
    </Accordion>
  );
};

export default AccordionLists;
