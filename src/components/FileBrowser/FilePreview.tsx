import React, { useState } from 'react';
import { Modal, Spin } from 'antd';
import className from 'classnames';

import { DriveFile } from '../../api/drive-api';

import style from './file-browser.module.css';

interface FilePreviewProps {
  visible: boolean;
  file?: DriveFile;
  handleClose: () => void;
}

export default function FilePreview(props: FilePreviewProps) {
  const [loading, setLoading] = useState(true);

  const frame = (
    <iframe
      src={`https://drive.google.com/file/d/${props.file?.id}/preview`}
      title="File Preview"
      className={className(style['file-preview-frame'], loading && style['file-preview-frame--loading'])}
      onLoad={() => setLoading(false)}
    />
  )

  const loadingPreview = (
    <div style={{ textAlign: 'center', position: 'relative', top: 50 }}>
      <Spin size="large" />
    </div>
  )

  return (
    <Modal
      title={props.file?.name}
      visible={props.visible}
      footer={null}
      destroyOnClose={true}
      onCancel={() => { props.handleClose(); setLoading(true) }}
      className={style['file-preview-modal']}
    >
      {loading && loadingPreview }
      { frame }
    </Modal>
  )
}