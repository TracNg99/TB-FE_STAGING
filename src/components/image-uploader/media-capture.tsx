import { Button, Modal } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import React, { useState } from 'react';
// import { IoCameraSharp } from 'react-icons/io5';
import { IoCameraOutline } from 'react-icons/io5';

interface MediaCaptureProps {
  selectedImages: Array<{ image: string | null; name: string | null }>;
  setSelectedImages: (
    images: Array<{ image: string | null; name: string | null }>,
  ) => void;
  children?: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

const MediaCapture: React.FC<MediaCaptureProps> = ({
  selectedImages,
  setSelectedImages,
  children,
  className,
  iconClassName,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  // const [videoRecorder, setVideoRecorder] = useState<HTMLVideoElement | null>(null);
  const videoRecorder = React.useRef<HTMLVideoElement | null>(null);

  const handleCameraOpen = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      setMediaStream(stream);
      videoRecorder.current!.srcObject = stream;
      videoRecorder.current!.play();
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error?.message || 'Failed to open camera',
        color: 'red',
      });
    }
  };

  const handleCameraClose = () => {
    setIsCapturing(false);
    mediaStream?.getTracks().forEach((track) => track.stop());
    setMediaStream(null);
    videoRecorder.current = null;
  };

  const handleCapture = async () => {
    if (!videoRecorder.current) {
      notifications.show({
        title: 'Error',
        message: 'Failed to capture image',
        color: 'red',
      });
      return;
    }
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1080;
      const context = canvas.getContext('2d');
      if (!context || !videoRecorder.current) {
        throw new Error('Failed to get canvas context or video recorder');
      }
      context.drawImage(
        videoRecorder.current,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const image = canvas.toDataURL('image/jpeg');
      const name = 'capture.jpg';
      setSelectedImages([...selectedImages, { image, name }]);
      mediaStream?.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      videoRecorder.current = null;
      setIsCapturing(false);
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error || 'Failed to capture image',
        color: 'red',
      });
    }
  };

  return (
    <div className={className ?? ''}>
      <Modal
        opened={isCapturing}
        onClose={handleCameraClose}
        title="Capture Image"
        size="xl"
        className={`absolute w-full h-full flex flex-col items-center justify-center`}
      >
        <div className="flex justify-center items-center">
          <video ref={videoRecorder} autoPlay muted />
        </div>
        <Button
          variant="outline"
          className="bg-transparent rounded-full transition items-center justify-center cursor-pointer"
          onClick={handleCapture}
        >
          Capture
        </Button>
      </Modal>
      <button
        className={'bg-transparent rounded-full transition cursor-pointer'}
        onClick={handleCameraOpen}
      >
        {children || (
          <IoCameraOutline className={`${iconClassName} text-white`} />
        )}
      </button>
    </div>
  );
};

export default MediaCapture;
