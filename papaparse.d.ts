// papaparse.d.ts
declare module 'papaparse' {
    interface ParseConfig {
      header?: boolean;
      dynamicTyping?: boolean;
      complete?: (results: any, file?: File) => void;
      error?: (error: any, file?: File) => void;
    }
  
    export function parse(data: string | File, config?: ParseConfig): any;
  }
  