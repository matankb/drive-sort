import React from 'react';
import classNames from 'classnames'

import { List, Button } from 'antd';
import { FolderFilled, FileOutlined, CheckOutlined, EyeOutlined } from '@ant-design/icons';

import { DriveFile } from '../../api/drive-api';
import style from './file-browser.module.css';

interface FileItemProps {
  file: DriveFile;
  selected: boolean;
  showParent: boolean;
  onSelect: () => void;
  onClick: () => void;
  onMove: () => void;
  onPreview: () => void;
  role: 'source' | 'target';
}

export default function FileItem({ file, selected, onSelect, onClick, role, showParent, ...props }: FileItemProps) {
  const isSourceFile = file.type === 'file' && role === 'source';

  return (
    <List.Item
      className={classNames(
        style['file-item'],
        selected && style['file-item--selected'],
        role === 'source' && style['file-item--source'],
        file.type === 'folder' && style['file-item--folder'],
        file.type === 'file' && style['file-item--file']
      )}
      actions={isSourceFile ? [
        isSourceFile && <Button type="link" onClick={props.onMove}>Move</Button>,
        isSourceFile && <Button className={style['file-item-preview-button']} shape="circle" icon={<EyeOutlined />} onClick={props.onPreview} />
      ] : []}
      onClick={onClick}
    >
      <div className={style['file-item-icon-wrap']}>
        {
          isSourceFile &&
            (
              <Button
                shape="circle"
                className={style['file-item-select-icon']}
                size="small"
                onClick={onSelect}
              >
                <CheckOutlined />
              </Button>
            )
        }
        {
          file.type === 'folder'
            ? <FolderFilled color="#1890ff" />
            : file.icon
              ? <img src={file.icon} alt="File Icon" />
              : <FileOutlined />
        }
        <div style={{ marginLeft: 10, display: 'inline-block' }}>
          {
            showParent &&
            <span style={{ opacity: 0.8 }}>{file.parent?.name} / </span>
          }
          {file.name}
        </div>
      </div>
    </List.Item>
  )
}