import { Button, Textarea } from '@mantine/core';
import React, { useState } from 'react';

import { useUpdateExperienceMutation } from '@/store/redux/slices/business/experience';

interface EditableDescriptionProps {
  description: string;
  editable?: boolean;
  experienceId?: string;
  className?: string;
  onUpdate?: (newDescription: string) => Promise<void> | void;
}

const EditableDescription: React.FC<EditableDescriptionProps> = ({
  description,
  editable = true,
  experienceId,
  className = '',
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempDesc, setTempDesc] = useState(description);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateExperience] = useUpdateExperienceMutation();

  const handleCancel = () => {
    setTempDesc(description);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (tempDesc.trim() === description) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      await updateExperience({
        id: String(experienceId),
        data: {
          description: tempDesc,
        },
      });
      // Call the onUpdate callback if provided
      if (onUpdate) {
        await onUpdate(tempDesc);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update description:', error);
      // Optionally show error to user
    } finally {
      setIsUpdating(false);
    }
  };

  if (isEditing) {
    return (
      <div className="relative">
        <Textarea
          value={tempDesc}
          onChange={(e) => setTempDesc(e.target.value)}
          className={`w-full p-2 border rounded ${className}`}
          autosize
          minRows={8}
          maxRows={12}
          disabled={isUpdating}
        />
        <div className="mt-2 flex gap-2">
          <Button
            onClick={handleCancel}
            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group ${editable ? 'cursor-pointer' : ''} ${className}`}
      onClick={() => editable && setIsEditing(true)}
    >
      <div
        className="[&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800"
        dangerouslySetInnerHTML={{
          __html: description.replace(/\n/g, '<br />'),
        }}
      />
      {editable && (
        <span className="absolute top-full left-1/3 transform -translate-x-1/2 mt-1 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          Click here to edit
        </span>
      )}
    </div>
  );
};

export default EditableDescription;
