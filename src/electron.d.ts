export interface ElectronAPI {
  send: (channel: string, data: unknown) => void;
  receive: (channel: string, callback: (data: unknown) => void) => void;
}

declare global {
  interface Window {
    ipcRenderer: ElectronAPI; // This should match how you expose it in the preload script
  }
}
