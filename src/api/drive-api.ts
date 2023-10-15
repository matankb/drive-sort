const CLIENT_ID = process.env.REACT_APP_GCLIENT_ID;
const API_KEY = process.env.REACT_APP_GAPI_KEY;

const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive';

export interface DriveFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parent?: DriveFile;
  parentId: string;
  icon: string; // link to icon
  children: DriveFile[];
  ownedByMe: boolean;
}

export default class DriveApi {

  static init() {
    return new Promise((res, rej) => {
      gapi.load('client:auth2', async () => {
        gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES
        }).then(() => res(null)).catch((e: any) => rej(e));
      });
    })
  }

  /* SIGN IN/OUT */

  static isSignedIn() {
    return gapi.auth2.getAuthInstance().isSignedIn.get();
  }

  static signIn() {
    return gapi.auth2.getAuthInstance().signIn();
  }

  static signOut() {
    gapi.auth2.getAuthInstance().signOut();
  }
  
  // Listen for sign-in state changes.
  static addSigninListener(callback: (isSignedIn: boolean) => void) {
    gapi.auth2.getAuthInstance().isSignedIn.listen(callback);
  }

  static getUserEmail() {
    const user = gapi.auth2.getAuthInstance().currentUser.get();
    return user?.getBasicProfile()?.getEmail();
  }
  
  /** DRIVE FILES */

  private static async fetchRawFiles(onPartialLoaded: (count: number) => void) {
    const files = [];
    let nextPageToken;
    do {

      const baseConfig = {
        pageSize: 1000,
        q: 'trashed != true and ("me" in owners)',
        fields: 'nextPageToken, files(id, name, parents, mimeType, iconLink)'
      }

      const config: gapi.client.drive.ListParameters = !nextPageToken
        ? baseConfig
        : {
            ...baseConfig,
            pageToken: nextPageToken
          }

      const response = await gapi.client.drive.files.list(config);
      const result = response.result;
      nextPageToken = result.nextPageToken;
      files.push(...result.files); // @ts-ignore
      onPartialLoaded(files.length);
    } while (nextPageToken);
    return files;
  }

  private static filterParentlessRawFiles(files: any) {
    return files.filter((file: any) => file.parents);
  }

  private static transformRawFiles(files: any[]): DriveFile[] {
    return files
      .map((file: any) => {
        return {
          id: file.id,
          name: file.name,
          icon: file.iconLink,
          type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
          parentId: file.parents[0],
          children: [],
          ownedByMe: file.ownedByMe,
        }
      })
  }

  private static constructFileTree(files: DriveFile[], root: DriveFile) {
    const children = files.filter(file => file.parentId === root.id);
    if (children) {
      root.children = children.map(child => this.constructFileTree(files, child));
    }
    if (root.parentId) {
      root.parent = files.find(file => file.id === root.parentId);
    }
    return root;
  }

  // TODO: handle multiple folders named "My Drive"
  static async findRoot(files: DriveFile[]): Promise<DriveFile | undefined> {
    const scannedIds: string[] = [];
    const unparentedFiles = files
      .filter(f => f.parentId)
      .filter(f => !files.find(p => f.parentId === p.id));

    console.log(unparentedFiles);
    
    for (const file of unparentedFiles) {
      if (!scannedIds.includes(file.parentId)) {
        const parent = await gapi.client.drive.files.get({
          fileId: file.parentId
        });
        const parentName = parent.result.name;
        console.log(file.name, parentName, file.ownedByMe);
        if (parentName === 'My Drive') {
          const file = parent.result;
          return {
            id: file.id,
            name: 'My Drive',
            type: 'folder',
            parentId: '',
            icon: '', // icon will never be displayed
            children: [],
            ownedByMe: true,
          }
        }
        scannedIds.push(file.parentId);
      }
    }
  }

  // getFiles will call onPartialLoaded every time a new batch of files is loaded
  static async getFiles(onPartialLoaded: (loadedCount: number) => void) {
    const USE_CACHE = false;
    const SIMULATE_DELAY = false;

    if (USE_CACHE) {
      console.info('Reading from development cache...');
      if (SIMULATE_DELAY) {
        for (let i = 0; i < 10; i++) {
          await new Promise(res => setTimeout(res, 400));
          console.log(1);
          
          onPartialLoaded(i * 10);
        }
      }
    }

    const storedRawFiles = USE_CACHE ? localStorage.getItem('rawFiles') : null;
    const rawFiles = storedRawFiles
      ? JSON.parse(storedRawFiles)
      : await this.fetchRawFiles(onPartialLoaded);
    localStorage.setItem('rawFiles', JSON.stringify(rawFiles));
    const files = this.transformRawFiles(this.filterParentlessRawFiles(rawFiles));
    
    return files;
  }

  static createFileTree(files: DriveFile[], root?: DriveFile) {
    if (!root) {
      throw new Error('Cannot find root'); // TODO: UI error handling
    }
    const fileTree = this.constructFileTree([...files, root], root);
    return fileTree;
  }

  static moveFile(file: DriveFile, folder: DriveFile) {
    return gapi.client.drive.files.update({
      fileId: file.id,
      removeParents: file.parentId,
      addParents: folder.id
    });
  }

  static deleteFile(file: DriveFile) {
    return gapi.client.drive.files.update({ 
      fileId: file.id, 
      requestBody: { 
        trashed: true 
      } 
    });

  }

  static undeleteFile(file: DriveFile) {
    return gapi.client.drive.files.untrash({
      fileId: file.id,
    })
  }

}