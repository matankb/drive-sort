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

const maxBreadcrumbCharacters = 22;

// overflows if character length is too long
function shouldOverflow(parentChain: DriveFile[]) {
  const totalCharacters = parentChain.reduce((a, b) => a + b.name.length, 0);
  return totalCharacters > maxBreadcrumbCharacters;
}

function getOverflowItems(parentChain: DriveFile[]) {
  const items: DriveFile[] = parentChain.slice(1, -1);
  let totalCharacters = parentChain[0].name.length + (parentChain.at(-1)?.name.length || 0);

  for (let i = parentChain.length - 2; i > 0; i--) {
    const folder = parentChain[i];
    const nextTotalCharacters = totalCharacters + folder.name.length;

    if (nextTotalCharacters > maxBreadcrumbCharacters) {
      return items;
    }

    items.pop();
    totalCharacters = nextTotalCharacters;
  }
  
  return items;
}

interface BreadcrumbsProps {
  folder: DriveFile;
  onClick: (folder: DriveFile) => void;
}

export default function Breadcrumbs({ folder, onClick }: BreadcrumbsProps) {
  const parentChain = getParentChain(folder);
  const overflow = shouldOverflow(parentChain);

  let overflowMenu;

  if (overflow) {
    const overflowItems = getOverflowItems(parentChain);
    parentChain.splice(1, overflowItems.length); // remove overflow items from parentChain
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