import { Box, Button, Modal, Text } from '@mantine/core';
import React, { useState } from 'react';

import TextForm from '../forms/generic-text-form';

export type RowProps = {
  id: string;
  type: string;
  name: string;
  label: string;
  url: string;
  text: string;
  icon: React.ReactNode;
  required: boolean;
};

type CardRowProps = {
  row: RowProps;
  onSubmit?: (contents: { [x: string]: string }) => void;
  withButton?: boolean;
  isButtonClicked?: boolean;
  modalTitle?: string;
};

export default function GenericCardRow({
  row,
  onSubmit,
  withButton,
  isButtonClicked,
  modalTitle,
}: CardRowProps) {
  const [openPopover, setOpenPopover] = useState<boolean>(false);

  const handleOpenPopover = () => {
    setOpenPopover(true);
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
  };

  const TextFormModal = () => {
    return (
      <Modal
        opened={openPopover}
        onClose={handleClosePopover}
        size="xl"
        className="max-w-screen-xl"
        centered
      >
        <TextForm
          onCancel={handleClosePopover}
          collection={[
            {
              name: row.name,
              label: row.label,
              contents: row.text,
              rows: 10,
              required: row.required,
            },
          ]}
          onSubmit={(text) => onSubmit?.({ id: row.id, text: text[row.name] })}
          buttonText="Save"
          isLoading={isButtonClicked}
          mainTitle={modalTitle}
        />
      </Modal>
    );
  };

  return (
    <>
      <div
        className={`
        flex flex-row justify-between gap-4
        p-4 border-b border-gray-200 hover:bg-gray-50`}
      >
        <div className="items-left">{row.icon}</div>

        <Box>
          <Box className="flex flex-col items-left">
            <Text className="font-bold">{row.label}</Text>
            <Text className="font-gre">{row.url}</Text>
          </Box>
        </Box>

        {withButton && (
          <>
            <Button
              variant="outline"
              color="orange"
              onClick={handleOpenPopover}
              className="hover:bg-orange-30"
            >
              Edit text
            </Button>
            <TextFormModal />
          </>
        )}
      </div>
    </>
  );
}
