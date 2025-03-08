import React from 'react';
import { Form, Input, Select, Button, Space, Divider } from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bug, BugFormData, BugStatus, ResponsibleParty } from '../types';
import ImageUpload from './ImageUpload';
import UrlList from './UrlList';
import { v4 as uuidv4 } from 'uuid';

const { TextArea } = Input;
const { Option } = Select;

// Form validation schema with Zod
const bugSchema = z.object({
    description: z.string().min(1, 'Description is required'),
    urls: z.array(
        z.object({
            id: z.string(),
            url: z.string().url('Must be a valid URL'),
        })
    ),
    image: z.any().optional(),
    status: z.enum(['Open', 'In Progress', 'Fixed', 'Won\'t Fix', 'Duplicate']),
    comment: z.string().optional(),
    responsible: z.enum(['Frontend', 'Backend', 'PM', 'Design', 'QA']),
});

interface BugFormProps {
    initialData?: Bug;
    onSubmit: (data: BugFormData) => void;
    isSubmitting: boolean;
}

const BugForm: React.FC<BugFormProps> = ({ initialData, onSubmit, isSubmitting }) => {
    const defaultValues: BugFormData = initialData
        ? {
            description: initialData.description,
            urls: initialData.urls,
            status: initialData.status,
            comment: initialData.comment,
            responsible: initialData.responsible,
        }
        : {
            description: '',
            urls: [{ id: uuidv4(), url: '' }],
            status: 'Open',
            comment: '',
            responsible: 'Frontend',
        };

    const { control, handleSubmit, formState: { errors }, register } = useForm<BugFormData>({
        resolver: zodResolver(bugSchema),
        defaultValues,
    });

    return (
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            <Form.Item
                label="Bug Description"
                validateStatus={errors.description ? 'error' : undefined}
                help={errors.description?.message}
            >
                <TextArea
                    rows={4}
                    placeholder="Describe the bug in detail..."
                    {...register('description')}
                />
            </Form.Item>

            <Form.Item label="URLs where the bug occurs">
                <UrlList control={control} />
            </Form.Item>

            <Divider />

            <Form.Item label="Bug Screenshot">
                <ImageUpload
                    control={control}
                    defaultImageUrl={initialData?.imageUrl}
                />
            </Form.Item>

            <Divider />

            <Form.Item label="Bug Status">
                <Select {...register('status')}>
                    <Option value="Open">Open</Option>
                    <Option value="In Progress">In Progress</Option>
                    <Option value="Fixed">Fixed</Option>
                    <Option value="Won't Fix">Won't Fix</Option>
                    <Option value="Duplicate">Duplicate</Option>
                </Select>
            </Form.Item>

            <Form.Item label="Comment">
                <Input {...register('comment')} placeholder="Add any additional comments..." />
            </Form.Item>

            <Form.Item label="Responsible Party">
                <Select {...register('responsible')}>
                    <Option value="Frontend">Frontend</Option>
                    <Option value="Backend">Backend</Option>
                    <Option value="PM">Project Manager</Option>
                    <Option value="Design">Design</Option>
                    <Option value="QA">QA</Option>
                </Select>
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit" loading={isSubmitting}>
                        {initialData ? 'Update Bug' : 'Add Bug'}
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default BugForm;