import React from 'react'
import classNames from 'classnames';

import style from './file-browser.module.css';
import Breadcrumbs from './Breadcrumbs';
import { DriveFile } from '../../api/drive-api';
import { Button, Badge, Tooltip, Input, Tag } from 'antd';
import { SwapOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface FileBrowserHeaderProps {
  isSearching: boolean;
  query: string;
  setQuery: (query: string) => void;
  currentFolder: DriveFile;
  setCurrentFolder: (folder: DriveFile) => void;
  role: string;
  handleSwapClick?: () => void;
  selected: number;
  handleMove: () => void;
}

export default function FileBrowserHeader(props: FileBrowserHeaderProps) {

  const roleLabel = (
    <Tag color="success">
      {props.role === 'source' ? 'From' : 'To'}
    </Tag>
  );

  return (
    <div className={style['file-browser-header']}>
      {
        props.isSearching
          ? <b>{roleLabel}Search results for "{props.query.trim()}"</b>
          : (
            <b>
              {roleLabel}
              <Breadcrumbs
                folder={props.currentFolder}
                onClick={folder => props.setCurrentFolder(folder)}
              />
            </b>
          )
      }
      <div>
        {
          props.role === 'source' &&
          <Button
            icon={<SwapOutlined />}
            onClick={props.handleSwapClick}
            className={style['file-browser-swap']}
          ></Button>
        }
        {
          props.role === 'source' &&
          <Badge count={props.selected}>
            <Button
              type={props.selected ? 'primary' : 'default'}
              disabled={!props.selected}
              onClick={props.handleMove}
            >
              Move Selected
            </Button>
          </Badge>
        }
        <Input
          placeholder="Search"
          onChange={e => props.setQuery(e.target.value)}
          value={props.query}
          suffix={
            <Tooltip title="Clear Search" mouseEnterDelay={0.5}>
              <CloseCircleOutlined
                className={style['file-browser-search-clear']}
                onClick={() => props.setQuery('')}
              />
            </Tooltip>
          }
          className={classNames(style['file-browser-search'], props.isSearching && style['file-browser-search--searching'])}
        />
      </div>
    </div>
  )
}