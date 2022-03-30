import { createSignal, createEffect, createMemo, Accessor } from 'solid-js';

export type useFileUploadHook = {
  files: Accessor<File[]>;
  fileNames: Accessor<string[]>;
  fileTypes: Accessor<string[]>;
  totalSize: Accessor<string>;
  totalSizeInBytes: Accessor<number>;
  clearAllFiles: () => void;
  // createFormData: () => FormData;
  handleDragDropEvent: (e: Event) => void;
  removeFile: (file: number | string) => void;
  setFiles: (e: Event) => void;
};

const formatBytes = (bytes: number, decimals = 2): string => {
  if (typeof bytes !== 'number') return 'n/a';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getTotalSizeInBytes = (files: File[]): number => {
  return files.reduce((acc, file: File) => (acc += file.size), 0);
};

const handleDragDropEvent = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
};

export default function useFileUpload(): useFileUploadHook {
  const [files, setFilesState] = createSignal<File[]>([]);
  const [fileNames, setFileNames] = createSignal<string[]>([]);
  const [fileTypes, setFileTypes] = createSignal<string[]>([]);
  const [totalSize, setTotalSize] = createSignal('');
  const [totalSizeInBytes, setTotalSizeInBytes] = createSignal(0);

  createEffect(() => {
    setFileNames(files().map((file) => file.name));
    setFileTypes(files().map((file) => file.type));
    handleSizes(files());
  });

  const setFiles = (e: any, mode = 'w'): void => {
    let filesArr: File[] = [];

    if (e.currentTarget?.files) {
      filesArr = Array.from(e.currentTarget.files);
    } else if (e?.dataTransfer.files) {
      filesArr = Array.from(e.dataTransfer.files);
    } else {
      console.error('Argument not recognized. Are you sure your passing setFiles an event object?');
    }

    if (mode === 'w') {
      setFilesState(filesArr);
    } else if (mode === 'a') {
      setFilesState([...files(), ...filesArr]);
    }
  };

  const handleSizes = (files: File[]): void => {
    const sizeInBytes = getTotalSizeInBytes(files);
    const prettySize = formatBytes(sizeInBytes);
    setTotalSizeInBytes(sizeInBytes);
    setTotalSize(prettySize);
  };

  const removeFile = (file: number | string): void => {
    if (typeof file !== 'number' && typeof file !== 'string') {
      console.error('Argument supplied to removeFile must be of type number or string.');
      return;
    }

    if (typeof file === 'string') {
      setFilesState(files().filter((_file: File) => _file.name !== file));
    } else {
      setFilesState(files().filter((_file: File, i) => i !== file));
    }
  };

  const clearAllFiles = (): void => {
    setFilesState([]);
  };

  const createFormData = (): FormData => {
    const formData = new FormData();

    for (const file of files()) {
      formData.append(file.name, file);
    }

    return formData;
  };

  return {
    files,
    fileNames,
    fileTypes,
    totalSize,
    totalSizeInBytes,
    clearAllFiles,
    // createFormData,
    handleDragDropEvent,
    removeFile,
    setFiles,
  };
}
