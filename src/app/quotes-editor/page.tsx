'use client';
import { Button, Form, type FormProps, Input } from 'antd';
import dynamic from 'next/dynamic';
import TopNav from '../components/TopNav';
import { useState } from 'react';


const Canvas = dynamic(() => import('../components/canvas'), {
  ssr: false,
});

type FieldType = {
  quote?: string;
  author?: string;
};

export default function EditorPage() {

  const [formValues, setFormValues] = useState<FieldType>({ quote: '', author: '' })


  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    setFormValues(values)
  };

  console.log(formValues, 'sdsd')
  return (
    <>
      <TopNav />
      <Form
        layout={'vertical'}
        onFinish={onFinish}
      >
        <Form.Item<FieldType> label="Quote" name="quote" >
          <Input placeholder="Write a quote..." />
        </Form.Item>
        <Form.Item<FieldType> label="Author" name='author'>
          <Input placeholder="Name the author..." />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType='submit'>Submit</Button>
        </Form.Item>
      </Form >

      <Canvas />
    </>)

}