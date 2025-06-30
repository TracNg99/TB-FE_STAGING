'use client';

import { Accordion } from '@mantine/core';
import React from 'react';

type AccordionListProps = {
  list: {
    icon?: React.ReactNode;
    label: string;
    content: string | React.ReactNode;
  }[];
};

const AccordionLists = ({ list = [] }: AccordionListProps) => {
  return (
    <Accordion multiple value={list.map((e) => e.label)} variant="contained">
      {list.map((item, index) => (
        <Accordion.Item key={index} value={item.label}>
          <Accordion.Control icon={item?.icon ?? undefined}>
            {item.label.toUpperCase()}
          </Accordion.Control>
          <Accordion.Panel>{item.content}</Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default AccordionLists;
