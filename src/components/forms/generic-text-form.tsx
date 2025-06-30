'use client';

import {
  Box,
  Button,
  Card,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import useFormPersist from 'react-hook-form-persist';

export interface SingleTextFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  contents?: string;
  rows?: number;
  required: boolean;
}

interface SingleSelectionProps {
  name: string;
  icon: any;
}

interface EditorFormProps {
  onCancel?: () => void;
  mainTitle?: string;
  storageVarName?: string;
  collection: SingleTextFieldProps[];
  onSubmit: (data: { [x: string]: string }) => void;
  isLoading?: boolean;
  buttonText?: string;
  selections?: SingleSelectionProps[];
  buttonColor?: any;
  className?: string;
}

const TextForm: React.FC<EditorFormProps> = ({
  onCancel,
  collection,
  mainTitle,
  storageVarName,
  onSubmit,
  selections,
  isLoading,
  buttonText,
  buttonColor,
  className,
}) => {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    register,
  } = useForm<{ [x: string]: string }>();

  useFormPersist(storageVarName ?? 'formValues', {
    watch,
    setValue,
  });

  const [mapping, setMapping] = useState<SingleTextFieldProps[]>([]);

  const [availableTypes, setAvailableTypes] = useState<
    {
      name: string;
      icon: any;
    }[]
  >([]);

  const [type, setType] = useState<string>('');

  useEffect(() => {
    const subscription = watch((value) => {
      setType(value?.['channel_type'] as string);
    });

    return () => subscription.unsubscribe();
  }, [type, watch('channel_type')]);

  useEffect(() => {
    if (collection && collection.length > 0) {
      setMapping(collection);
    }
  }, [collection]);

  useEffect(() => {
    if (selections) {
      setAvailableTypes(selections || []);
    }
  }, [selections]);

  return (
    <Paper className={className ?? 'p-3 rounded-lg w-full overflow-y-auto'}>
      {mainTitle && (
        <Title order={2} className="font-bold mb-6">
          {mainTitle}
        </Title>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          {mapping.map((field) => (
            <Box key={field.name}>
              <Text size="sm" className="mb-2 font-bold">
                {field.label}
                {field.required && (
                  <Text component="span" className="ml-1 text-red-500">
                    *
                  </Text>
                )}
              </Text>
              {field.rows && field.rows > 1 ? (
                <Textarea
                  {...register(field.name)}
                  defaultValue={field.contents}
                  // id={field.name}
                  resize="vertical"
                  classNames={{
                    input: 'pb-20 pt-4',
                  }}
                  error={errors.name?.message}
                />
              ) : (
                <TextInput
                  {...register(field.name)}
                  // id={field.name}
                  placeholder={field.placeholder}
                  defaultValue={field.contents}
                  error={errors.name?.message}
                />
              )}
            </Box>
          ))}

          {availableTypes.length > 0 ? (
            <Box>
              <Group>
                <Text className="font-bold">Channel type </Text>
                <Text className="text-red-500">*</Text>
              </Group>

              <Group className="mt-2">
                {availableTypes.map((card, index) => (
                  <Card
                    key={index}
                    onClick={() => setValue('channel_type', card.name)}
                    className={`
                      cursor-pointer p-4 border-2 border-orange-200 hover:bg-orange-100
                      ${type === card.name ? 'bg-orange-200' : ''}
                    `}
                  >
                    <Group>
                      {card.icon}
                      <Text className="text-orange-400 font-bold">
                        {card.name}
                      </Text>
                    </Group>
                  </Card>
                ))}
              </Group>
            </Box>
          ) : (
            <></>
          )}

          <Group className="mt-6 justify-end">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                color={buttonColor || 'gray'}
              >
                Cancel
              </Button>
            )}

            <Button
              type="submit"
              fullWidth={!onCancel}
              className={`
                  text-lg py-2 px-4
                  ${isLoading ? 'bg-gray-500' : 'bg-orange'}
                `}
              disabled={isLoading}
            >
              {isLoading ? <Loader size="sm" /> : (buttonText ?? 'Confirm')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};

export default TextForm;
