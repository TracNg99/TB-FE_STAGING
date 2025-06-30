import { IconQrcode } from '@tabler/icons-react';
import React, { useState } from 'react';

import QRModal from '@/components/qr-code/qr-modal';
import { useUpdateExperienceMutation } from '@/store/redux/slices/business/experience';

interface EditableTitleDescProps {
  title: string;
  description: string;
  editable?: boolean; // When false, component is display-only
  experienceId?: string;
}

const EditableTitleDesc: React.FC<EditableTitleDescProps> = ({
  title,
  description,
  editable = true,
  experienceId = '',
}) => {
  // State to track if each field is in edit mode.
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const [modalOpened, setModalOpened] = useState(false);

  // Temporary states for storing changes while editing.
  const [tempTitle, setTempTitle] = useState(title);
  const [tempDesc, setTempDesc] = useState(description);

  const [updateExperience] = useUpdateExperienceMutation();

  // Handlers for Title
  const handleTitleCancel = () => {
    setTempTitle(title); // revert changes
    setIsEditingTitle(false);
  };

  const handleTitleOk = async () => {
    updateExperience({
      id: String(experienceId),
      data: {
        title: tempTitle,
      },
    });
    console.log('Update title API call with:', tempTitle);
    // Update the UI as necessary.
    setIsEditingTitle(false);
  };

  // Handlers for Description
  const handleDescCancel = () => {
    setTempDesc(description); // revert changes
    setIsEditingDesc(false);
  };

  const handleDescOk = async () => {
    updateExperience({
      id: String(experienceId),
      data: {
        description: tempDesc,
      },
    });
    console.log('Update description API call with:', tempDesc);
    // Update the UI as necessary.
    setIsEditingDesc(false);
  };

  return (
    <div className="px-4 py-8 lg:py-14 lg:px-0 bg-white rounded-tr-xl lg:flex-2/3 relative">
      <div className="absolute bg-white top-0 right-full w-lvw h-full" />
      <div className="flex items-center gap-4">
        {editable && isEditingTitle ? (
          <div className="bg-gray-100 p-2 rounded">
            <textarea
              rows={1}
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="text-base-black text-display-sm lg:text-display-lg font-semibold"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleTitleCancel}
                className="px-3 py-1 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleTitleOk}
                className="px-3 py-1 border rounded"
              >
                OK
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group inline-block">
            <h2
              onClick={() => editable && setIsEditingTitle(true)}
              className={`text-base-black text-display-sm lg:text-display-lg font-semibold ${editable ? 'cursor-pointer' : ''}`}
            >
              {title}
            </h2>
            {editable && (
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Click here to edit
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setModalOpened(true)}
          className="group relative p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Show QR code"
        >
          <IconQrcode
            className="text-display-sm lg:text-display-lg text-base-black"
            style={{ fontSize: '1em' }}
          />
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Show QR Code
          </span>
        </button>
        <QRModal
          open={modalOpened}
          onClose={() => setModalOpened(false)}
          contentId={experienceId || ''}
          displayText={title}
        />
      </div>

      {editable && isEditingDesc ? (
        <div className="bg-gray-100 p-2 rounded mt-10">
          <textarea
            value={tempDesc}
            onChange={(e) => setTempDesc(e.target.value)}
            className="border-l-[12px] border-orange-500 pl-8 mt-10 text-md lg:text-display-xs text-base-black/90 w-full"
            rows={3}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleDescCancel}
              className="px-3 py-1 border rounded"
            >
              Cancel
            </button>
            <button onClick={handleDescOk} className="px-3 py-1 border rounded">
              OK
            </button>
          </div>
        </div>
      ) : (
        <div className="relative group inline-block">
          <p
            onClick={() => editable && setIsEditingDesc(true)}
            className={`border-l-[12px] border-orange-500 pl-8 mt-10 text-md lg:text-display-xs text-base-black/90 ${editable ? 'cursor-pointer' : ''}`}
          >
            {description}
          </p>
          {editable && (
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              Click here to edit
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableTitleDesc;
