import { createSignal, createEffect, createMemo } from 'solid-js';
import { useFileUploadHook } from './types';

/**
 * @function formatBytes
 */
const formatBytes = (bytes: number, decimals = 2): string => {
  if (typeof bytes !== 'number') return 'n/a';
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * @function getTotalSizeInBytes
 */
const getTotalSizeInBytes = (files: File[]): number => {
  return files.reduce((acc, file: File) => (acc += file.size), 0);
};

/**
 * @function handleDragDropEvent
 */
const handleDragDropEvent = (e: Event) => {
  e.stopPropagation();
  e.preventDefault();
};

// /**
//  * @SolidHook
//  */
export const useFileUpload = (): useFileUploadHook => {
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

    /** @function setFiles */
    const setFiles = 
      (e: any, mode = 'w'): void => {
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
      }

    /** @function handleSizes */
    const handleSizes = (files: File[]): void => {
      const sizeInBytes = getTotalSizeInBytes(files);
      const prettySize = formatBytes(sizeInBytes);
      setTotalSizeInBytes(sizeInBytes);
      setTotalSize(prettySize);
    }

    /** @function removeFile */
    const removeFile = 
      (file: number | string): void => {
        if (typeof file !== 'number' && typeof file !== 'string') {
          console.error('Argument supplied to removeFile must be of type number or string.');
          return;
        }

        if (typeof file === 'string') {
          setFilesState(files().filter((_file: File) => _file.name !== file));
        } else {
          setFilesState(files().filter((_file: File, i) => i !== file));
        }
      }

    /** @function clearAllFiles */
    const clearAllFiles = (): void => {
      setFilesState([]);
    }

    /** @function createFormData */
    const createFormData = (): FormData => {
      const formData = new FormData();

      for (const file of files()) {
        formData.append(file.name, file);
      }

      return formData;
    }

  return {
    files: files(),
    fileNames: fileNames(),
    fileTypes: fileTypes(),
    totalSize: totalSize(),
    totalSizeInBytes: totalSizeInBytes(),
    clearAllFiles,
    // createFormData,
    handleDragDropEvent,
    removeFile,
    setFiles,
  };
};