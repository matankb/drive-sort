declare namespace gapi.client {
  export module drive {
    const files: {
      get: (parameters: GetParameters) => HttpRequest<FileResource>;
      patch: (parameters: PatchParameters) => HttpRequest<FileResource>;
      copy: (parameters: CopyParameters) => HttpRequest<FileResource>;
      delete: (parameters: DeleteParameters) => HttpRequest<any>;
      emptyTrash: () => HttpRequest<any>;
      export: (parameters: ExportParameters) => HttpRequest<FileResource>;
      generateIds: (parameters: GenerateIdsParameters) => HttpRequest<IdsResource>;
      insert: (parameters: InsertParameters) => HttpRequest<FileResource>;
      list: (parameters: ListParameters) => HttpRequest<FileListResource>;
      touch: (parameters: TouchParameters) => HttpRequest<FileResource>;
      trash: (parameters: TrashParameters) => HttpRequest<FileResource>;
      untrash: (parameters: UntrashParameters) => HttpRequest<FileResource>;
      watch: (parameters: WatchParameters) => HttpRequest<ChannelResource>;
      update: (parameters: PatchParameters) => HttpRequest<FileResource>;
    }
    interface FileListResource {
      files: FileResource[];
    }
    interface FileResource {
      name: string;
    }
    interface PatchParameters {
      // addParents: string; 
    }
    const changes: any;
  }
}