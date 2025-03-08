import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { Control, Controller } from 'react-hook-form';
import { BugFormData } from '../types';

interface ImageUploadProps {
  control: Control<BugFormData>;
  defaultImageUrl?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ control, defaultImageUrl }) => {
  const [fileList, setFileList] = useState<UploadFile[]>(() => {
    if (defaultImageUrl) {
      return [
        {
          uid: '-1',
          name: 'Current Image',
          status: 'done',
          url: defaultImageUrl,
        },
      ];
    }
    return [];
  });

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
      }
      return isImage && isLt2M ? false : Upload.LIST_IGNORE;
    },
    fileList,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    listType: 'picture',
  };

  return (
    <Controller
      name="image"
      control={control}
      render={({ field }) => (
        <Upload 
          {...uploadProps}
          customRequest={({ file, onSuccess }) => {
            // Update the form value with the file
            field.onChange(file);
            // Manually mark the upload as success for UI feedback
            onSuccess?.('ok');
          }}
        >
          <div className="upload-button">
            <UploadOutlined /> Upload Screenshot
          </div>
        </Upload>
      )}
    />
  );
};

export default ImageUpload;