import React from 'react';
import { DriveFile } from '../../api/drive-api';
import { List, Pagination } from 'antd';

const VISIBLE_PER_PAGE = 20; // number of files visible per page, for perf

interface FileListProps {
  files: DriveFile[];
  renderFileItem: (file: DriveFile) => React.ReactNode;
  header: React.ReactNode;
  isSearching: boolean;
  page: number;
  setPage: (page: number) => void;
}

export default function FileList({ files, page, isSearching, ...props }: FileListProps) {

  const showPagination = false; // files.length > 20;
  const pagination = (
    <Pagination
      current={page}
      onChange={props.setPage}
      total={files.length}
      pageSize={20}
    />
  );
  
  const visibleFiles = files.slice((page - 1) * VISIBLE_PER_PAGE, page * VISIBLE_PER_PAGE);

  return (
    <List
      header={props.header}
      dataSource={visibleFiles}
      renderItem={props.renderFileItem}
      bordered
      locale={{ emptyText: isSearching ? 'No results' : 'No files' }}
      footer={showPagination && pagination}
    />
  );
}