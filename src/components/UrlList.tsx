import React from 'react';
import { Button, Input, Space } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useFieldArray, Control } from 'react-hook-form';
import { BugFormData, BugUrl } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface UrlListProps {
  control: Control<BugFormData>;
}

const UrlList: React.FC<UrlListProps> = ({ control }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'urls',
  });

  return (
    <div>
      {fields.map((field, index) => (
        <Space key={field.id} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
          <Input
            placeholder="https://example.com/page-with-bug"
            {...control.register(`urls.${index}.url`)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => remove(index)}
            danger
          />
        </Space>
      ))}
      <Button
        type="dashed"
        onClick={() => append({ id: uuidv4(), url: '' })}
        icon={<PlusOutlined />}
      >
        Add URL
      </Button>
    </div>
  );
};

export default UrlList;