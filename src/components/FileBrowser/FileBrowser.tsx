import React, { useState } from 'react';
import { Spin } from 'antd';

import { DriveFile } from '../../api/drive-api';

import FileItem from './FileItem';
import FileList from './FileList';
import FilePreview from './FilePreview';
import FileBrowserHeader from './FileBrowserHeader';

import style from './file-browser.module.css';

function searchFiles(root: DriveFile, query: string): DriveFile[] {
  const results = [];
  if (root.name.toLowerCase().includes(query)) {
    results.push(root);
  }
  if (root.children) {
    for (const child of root.children) {
      results.push(...searchFiles(child, query));
    }
  }
  return results;
}

// Sorts folders in front of files
function sortFiles(files: DriveFile[]) {
  return files.sort((a, b) => {
    if (a.type === b.type) {
      return 0;
    }
    if (a.type === 'folder' && b.type === 'file') {
      return -1;
    }
    return 1;
  })
}

interface FileBrowserProps {
  tree: DriveFile;
  role: 'source' | 'target';
  currentFolder: DriveFile;
  showSpinner: boolean;
  handleMove?: (files: DriveFile[]) => void;
  handleDelete?: (file: DriveFile) => void;
  handleSwapClick?: () => void;
  setCurrentFolder: (folder: DriveFile) => void;
}

export default function FileBrowser({ tree, role, ...props }: FileBrowserProps) {

  const { currentFolder, setCurrentFolder } = props;
  const [selected, setSelected] = useState<DriveFile[]>([]);
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<DriveFile>();

  const isSearching = !!query.trim();

  const header = <FileBrowserHeader
    isSearching={isSearching}
    query={query}
    setQuery={setQuery}
    currentFolder={currentFolder}
    setCurrentFolder={setCurrentFolder}
    role={role}
    handleSwapClick={props.handleSwapClick}
    selected={selected.length}
    handleMove={() => {
      if (props.handleMove) {
        props.handleMove(selected)
      }
      setSelected([]);
    }}
  />;

  const fileItems = !isSearching
    ? sortFiles(currentFolder.children)
    : sortFiles(searchFiles(tree, query.trim().toLowerCase()));

  const renderFileItem = (file: DriveFile) => {

    let isUniqueFileName;

    if (isSearching) {
      const duplicateFileNames = fileItems.filter(f => {
        return file.name.trim() === f.name.trim();
      });
      isUniqueFileName = duplicateFileNames.length === 1;
    }

    return (
      <FileItem
        file={file}
        selected={selected.includes(file)}
        role={role}
        onClick={() => {
          if (file.type === 'folder') {
            setCurrentFolder(file);
            setQuery('')
          }
        }}
        showParent={isSearching && !isUniqueFileName}
        onSelect={() => {
          if (file.type === 'file' && role === 'source') {
            if (selected.includes(file)) {
              setSelected(selected.filter(f => f !== file));
            } else {
              setSelected([...selected, file]);
            }
          }
        }}
        onMove={() => {
          if (props.handleMove) {
            props.handleMove([file])
          }
        }}
        onPreview={() => {
          setPreview(file)
        }}
        onDelete={() => {
          if (props.handleDelete) {
            props.handleDelete(file);
          }
        }}
      />
    )
  }

  const fileList = <FileList
    files={fileItems} 
    renderFileItem={renderFileItem} 
    header={header} 
    isSearching={isSearching}
    page={1}
    setPage={() => {}}
  />

  return (
    <div className={style['file-browser-wrap']}>
      {
        props.showSpinner
          ? <Spin>{fileList}</Spin>
          : fileList
      }
      <FilePreview
        visible={!!preview}
        handleClose={() => setPreview(undefined)}
        file={preview}
      />
    </div>

  )
}