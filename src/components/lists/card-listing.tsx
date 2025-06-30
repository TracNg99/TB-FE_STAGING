import { Card, Group, Loader, Stack, Text } from '@mantine/core';
import React from 'react';

import GenericCardRow, { RowProps } from '../cards/card-with-button';

interface CardsListProps {
  tableData: RowProps[];
  subject?: string;
  isFetching?: boolean;
  withButton?: boolean;
  isButtonClicked?: boolean;
  onRowSubmit?: (row: { id: string; text: string }) => void;
  modalTitle?: string;
  className?: string;
  classNames?: Partial<Record<any, string>>;
}

const CardsList: React.FC<CardsListProps> = ({
  tableData,
  subject,
  isFetching,
  withButton,
  isButtonClicked,
  onRowSubmit,
  modalTitle,
  className,
  classNames,
}) => {
  const handleSubmit = (row: { id: string; text: string }) => {
    onRowSubmit?.(row);
  };

  return (
    <Card
      className={`w-full rounded-xl overflow-y-auto max-h-[140vh] ${className || ''}`}
      classNames={classNames}
      shadow="sm"
    >
      <Stack className="w-full">
        {isFetching ? (
          <Group className="p-4">
            <Loader color="gray" size="md" />
            <Text>{`Fetching ${subject ?? 'items'}`}</Text>
          </Group>
        ) : tableData.length > 0 ? (
          <Stack>
            {tableData.map((row, index) => (
              <GenericCardRow
                key={index}
                row={row}
                onSubmit={(e) => handleSubmit({ id: row.id, text: e['text'] })}
                withButton={withButton}
                isButtonClicked={isButtonClicked}
                modalTitle={modalTitle}
              />
            ))}
          </Stack>
        ) : (
          <Group className="w-full p-4">
            <Text size="xl" className="font-bold">
              {`No existing ${subject ?? 'item'}`}
            </Text>
          </Group>
        )}
      </Stack>
    </Card>
  );
};

export default CardsList;
