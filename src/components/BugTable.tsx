import React, { useState } from 'react';
import { Table, Button, Modal, Tag, Space, Tooltip, Image } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Bug } from '../types';
import BugForm from './BugForm';
import { useCreateBug, useDeleteBug, useUpdateBug } from '../hooks/useBugs';

interface BugTableProps {
  bugs: Bug[];
  isLoading: boolean;
}

const BugTable: React.FC<BugTableProps> = ({ bugs, isLoading }) => {
    const [editBug, setEditBug] = useState<Bug | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
  
    const createBugMutation = useCreateBug();
    const updateBugMutation = useUpdateBug(editBug?.id || '');
    const deleteBugMutation = useDeleteBug();
  
    const handleDelete = (id: string) => {
      Modal.confirm({
        title: 'Are you sure you want to delete this bug report?',
        content: 'This action cannot be undone',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: () => {
          deleteBugMutation.mutate(id);
        },
      });
    };
  
    const statusColors = {
      'Open': 'red',
      'In Progress': 'blue',
      'Fixed': 'green',
      'Won\'t Fix': 'gray',
      'Duplicate': 'orange',
    };
  
    const responsibleColors = {
      'Frontend': 'cyan',
      'Backend': 'purple',
      'PM': 'magenta',
      'Design': 'gold',
      'QA': 'geekblue',
    };
  
    const columns = [
      {
        title: 'Description & URLs',
        dataIndex: 'description',
        key: 'description',
        width: '40%',
        render: (text: string, record: Bug) => (
          <div>
            <div style={{ marginBottom: 8 }}>{text}</div>
            {record.urls.length > 0 && (
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {record.urls.map((url) => (
                  <li key={url.id}>
                    <a href={url.url} target="_blank" rel="noopener noreferrer">
                      {url.url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ),
      },
      {
        title: 'Screenshot',
        dataIndex: 'imageUrl',
        key: 'imageUrl',
        width: '20%',
        render: (imageUrl: string) => (
          imageUrl ? (
            <div onClick={() => setPreviewImage(imageUrl)} style={{ cursor: 'pointer' }}>
              <img 
                src={imageUrl} 
                alt="Bug screenshot" 
                style={{ maxWidth: '100px', maxHeight: '60px', objectFit: 'cover' }} 
              />
            </div>
          ) : (
            <span>No image</span>
          )
        ),
      },
      {
        title: 'Status & Details',
        dataIndex: 'status',
        key: 'status',
        width: '30%',
        render: (status: string, record: Bug) => (
          <div>
            <Tag color={statusColors[status as keyof typeof statusColors]}>
              {status}
            </Tag>
            <Tooltip title="Responsible Party">
              <Tag color={responsibleColors[record.responsible as keyof typeof responsibleColors]}>
                {record.responsible}
              </Tag>
            </Tooltip>
            {record.comment && (
              <div style={{ marginTop: 8 }}>
                <strong>Comment:</strong> {record.comment}
              </div>
            )}
          </div>
        ),
      },
      {
        title: 'Actions',
        key: 'actions',
        width: '10%',
        render: (_ : string, record: Bug) => (
          <Space>
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => {
                setEditBug(record);
                setIsModalVisible(true);
              }}
            />
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={() => handleDelete(record.id)}
            />
          </Space>
        ),
      },
    ];
  
    return (
      <div>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <h1>Bug Reports</h1>
          <Button 
            type="primary" 
            onClick={() => setIsCreateModalVisible(true)}
          >
            Add New Bug
          </Button>
        </div>
  
        <Table 
          columns={columns} 
          dataSource={bugs} 
          rowKey="id" 
          loading={isLoading} 
          pagination={{ pageSize: 10 }}
        />
  
        {/* Edit Bug Modal */}
        <Modal
          title="Edit Bug Report"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          {editBug && (
            <BugForm 
              initialData={editBug} 
              onSubmit={(data) => {
                updateBugMutation.mutate(data, {
                  onSuccess: () => setIsModalVisible(false),
                });
              }}
              isSubmitting={updateBugMutation.isPending}
            />
          )}
        </Modal>
  
        {/* Create Bug Modal */}
        <Modal
          title="Add New Bug Report"
          open={isCreateModalVisible}
          onCancel={() => setIsCreateModalVisible(false)}
          footer={null}
          width={800}
        >
          <BugForm 
            onSubmit={(data) => {
              createBugMutation.mutate(data, {
                onSuccess: () => setIsCreateModalVisible(false),
              });
            }}
            isSubmitting={createBugMutation.isPending}
          />
        </Modal>
  
        {/* Image Preview */}
        <Image
          width={200}
          style={{ display: 'none' }}
          src={previewImage || ''}
          preview={{
            visible: !!previewImage,
            src: previewImage || '',
            onVisibleChange: (visible) => {
              if (!visible) setPreviewImage(null);
            },
          }}
        />
      </div>
    );
  };
  
  export default BugTable;
  