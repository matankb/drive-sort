import React from 'react';

import { Spin } from 'antd';

interface LoadingPageProps {
  message?: string;
  submessage?: string;
}

export default function LoadingPage({ message, submessage }: LoadingPageProps) {
  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <Spin size="large" />
      <div style={{ marginTop: 10 }}>
        { message }
      </div>
      <div style={{ marginTop: 10, color: 'gray' }}>
        { submessage }
      </div>
    </div>
  )
}