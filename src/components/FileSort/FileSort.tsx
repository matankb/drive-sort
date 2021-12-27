import React from 'react';
import { message, Button } from 'antd';

import DriveApi, { DriveFile } from '../../api/drive-api';
import FileBrowser from '../FileBrowser/FileBrowser';
import LoadingPage from '../LoadingPage/LoadingPage';

enum LoadingFileTreeStatus {
  NotLoading = 'NotLoading',
  GettingFiles = 'GettingFiles',
  CreatingTree = 'CreatingTree'
}

function findFolderInTree(id = '', tree: DriveFile): DriveFile | undefined {
  if (tree.id === id) {
    return tree;
  }
  for (const child of tree.children) {
    const result = findFolderInTree(id, child);
    if (result) {
      return result;
    }
  }
}

interface FileSortState {
  fileTree?: DriveFile;
  allFiles?: DriveFile[];

  loadingFileTreeStatus: LoadingFileTreeStatus;
  loadedFilesCount: number;
  moving: boolean;

  sourceCurrentFolder?: DriveFile;
  targetCurrentFolder?: DriveFile;
}

export class FileSort extends React.Component<{}, FileSortState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      fileTree: undefined,
      allFiles: undefined,
      loadingFileTreeStatus: LoadingFileTreeStatus.NotLoading,
      loadedFilesCount: 0,
      moving: false
    }
  }

  async componentDidMount() {
    this.setState({ loadingFileTreeStatus: LoadingFileTreeStatus.GettingFiles })
    const files = await DriveApi.getFiles(count => this.setState({ loadedFilesCount: count }));
    this.setState({ loadingFileTreeStatus: LoadingFileTreeStatus.CreatingTree, allFiles: files });
    const fileTree = await DriveApi.createFileTree(files);
    this.setState({
      fileTree,
      loadingFileTreeStatus: LoadingFileTreeStatus.NotLoading,
      sourceCurrentFolder: fileTree,
      targetCurrentFolder: fileTree,
    });
  }

  getLoadingMessage() {
    const { loadingFileTreeStatus } = this.state;

    switch (loadingFileTreeStatus) {
      case LoadingFileTreeStatus.GettingFiles:
        return `Loading files`;
        case LoadingFileTreeStatus.CreatingTree:
        return 'Finishing up...';
      default:
        return 'Loading...';
    }
  }

  getLoadingSubmessage() {
    const { loadingFileTreeStatus, loadedFilesCount } = this.state;
    if (loadingFileTreeStatus == LoadingFileTreeStatus.GettingFiles) {
      return `${loadedFilesCount} files loaded`;
    }
  }

  async moveFiles(files: DriveFile[], source?: DriveFile, target?: DriveFile) {
    if (!target || !source) {
      return { newSourceFolder: source, newTargetFolder: target };
    }
    this.setState({ moving: true });
    const newParent = target;
    for (const file of files) {
      await DriveApi.moveFile(file, target);
    }

    const newFiles = [...(this.state.allFiles || [])].map(file => {
      if (files.find(f => f.id === file.id)) { // selected file
        return {
          ...file,
          parentId: newParent.id,
          parent: newParent
        }
      } else if (file.id === newParent.id) { // target folder
        return {
          ...file,
          children: [
            ...file.children,
            ...files
          ]
        }
      } else if (files.find(f => f.children.find(c => c.id === file.id))) { // parent of selected file
        return {
          ...file,
          children: file.children.filter(c => !files.find(f => f.id === c.id))
        }
      } else {
        return file;
      }
    });
    const newFileTree = await DriveApi.createFileTree(newFiles);
    const newSourceFolder = findFolderInTree(source.id, newFileTree);
    const newTargetFolder = findFolderInTree(newParent.id, newFileTree);
    this.setState({
      allFiles: newFiles,
      fileTree: newFileTree,
      moving: false
    });
    return {
      newSourceFolder,
      newTargetFolder,
    }
  }

  handleMoveClick = async (files: DriveFile[]) => {
    if (!this.state.targetCurrentFolder || !this.state.sourceCurrentFolder || !this.state.allFiles) {
      return;
    }

    if (files.length === 1 && files[0].parentId === this.state.targetCurrentFolder.id) {
      message.info(`"${files[0].name.trim()}" is already in "${this.state.targetCurrentFolder.name}"`)
      return;
    }

    const newFolders = await this.moveFiles(files, this.state.sourceCurrentFolder, this.state.targetCurrentFolder)
    this.setState({
      sourceCurrentFolder: newFolders.newSourceFolder,
      targetCurrentFolder: newFolders.newTargetFolder,
    })

    const sourceId = this.state.sourceCurrentFolder.id;
    const targetId = this.state.targetCurrentFolder.id;

    const handleUndo = async () => {
      message.destroy();
      if (!this.state.fileTree) {
        return;
      }
      const originalSource = findFolderInTree(sourceId, this.state.fileTree);
      const originalTarget = findFolderInTree(targetId, this.state.fileTree);
      const newUndoFolders = await this.moveFiles(files, originalTarget, originalSource);
      this.setState({
        sourceCurrentFolder: newUndoFolders.newTargetFolder,
        targetCurrentFolder: newUndoFolders.newSourceFolder
      });
      message.success('Undo complete!');
    }

    message.success(
      <span>
        Moved {files.length} file{files.length > 1 ? 's' : ''}!
        <Button type="link" onClick={handleUndo}>Undo</Button>
      </span>
    );
  }

  handleFileBrowserSwap = () => {
    this.setState(state => ({
      sourceCurrentFolder: state.targetCurrentFolder,
      targetCurrentFolder: state.sourceCurrentFolder,
    }))
  }

  render() {

    const loading = this.state.loadingFileTreeStatus !== LoadingFileTreeStatus.NotLoading && !this.state.fileTree;

    return (
      <div>
        {
          this.state.fileTree &&
          this.state.sourceCurrentFolder &&
          this.state.targetCurrentFolder &&
          (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 10 }}>
              <FileBrowser
                tree={this.state.fileTree}
                role="source"
                handleMove={this.handleMoveClick}
                handleSwapClick={this.handleFileBrowserSwap}
                showSpinner={this.state.moving}
                currentFolder={this.state.sourceCurrentFolder}
                setCurrentFolder={folder => this.setState({ sourceCurrentFolder: folder }) }
              />
              <FileBrowser
                tree={this.state.fileTree}
                role="target"
                showSpinner={this.state.moving}
                currentFolder={this.state.targetCurrentFolder}
                setCurrentFolder={folder => this.setState({ targetCurrentFolder: folder }) }
              />
            </div>
          )
        }
        {
          loading &&
          <LoadingPage message={ this.getLoadingMessage() } submessage={ this.getLoadingSubmessage() }/>
        }

      </div>
    )
  }

}