'use client';

import { Modal } from '@mantine/core';

import AuthLayout from '@/app/auth/(account)/layout';

import LoginForm from '../forms/login';

interface LoginModalProps {
  redirectUrl: string;
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LoginModal({
  opened,
  onClose,
  onSuccess,
  redirectUrl,
}: LoginModalProps) {
  return (
    <div className="flex flex-col items-center justify-start gap-4 px-5 py-10 sm:justify-center">
      <Modal
        opened={opened}
        onClose={onClose}
        title="Login to Continue"
        centered
        size="md"
        classNames={{
          root: '',
          body: 'py-3 px-4',
          header: 'p-3 border-b border-gray-200',
          title: 'text-lg font-semibold',
          close: 'text-gray-500 hover:text-gray-700',
        }}
        styles={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      >
        <AuthLayout>
          <LoginForm redirectUrl={redirectUrl} onSuccess={onSuccess} />
        </AuthLayout>
      </Modal>
    </div>
  );
}
