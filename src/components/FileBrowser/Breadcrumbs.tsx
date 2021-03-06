import React from 'react';
import { Breadcrumb, Menu } from 'antd';

import { DriveFile } from '../../api/drive-api';
import style from './file-browser.module.css';

function getParentChain(file: DriveFile): DriveFile[] {
  if (file.parent) {
    return [...getParentChain(file.parent), file];
  }
  return [file];
}

interface BreadcrumbsProps {
  folder: DriveFile;
  onClick: (folder: DriveFile) => void;
}

export default function Breadcrumbs({ folder, onClick }: BreadcrumbsProps) {
  const parentChain = getParentChain(folder);
  const overflow = parentChain.length > 3;

  let overflowMenu;

  if (overflow) {
    const overflowItems = parentChain.splice(1, parentChain.length - 3);
    overflowMenu = (
      <Menu>
        {
          overflowItems.map(folder => (
            <Menu.Item onClick={ () => onClick(folder) } key={folder.id}>
              {folder.name}
            </Menu.Item>
          ))
        }
      </Menu>
    )
  }

  const breadcrumbItems = parentChain.map(folder => {
    return (
      <Breadcrumb.Item onClick={() => onClick(folder)} key={folder.id}>
        <span className={style['breadcrumb-item']}>{folder.name}</span>
      </Breadcrumb.Item>
    )
  });

  if (overflow) {
    const overflowBreadcrumb = (
      <Breadcrumb.Item overlay={overflowMenu} key="overflow">
        <span className={style['breadcrumb-item']}>...</span>
      </Breadcrumb.Item>
    )
    breadcrumbItems.splice(1, 0, overflowBreadcrumb);
  }

  return (
    <Breadcrumb className={style.breadcrumbs}>
      {breadcrumbItems}
    </Breadcrumb>
  )
}