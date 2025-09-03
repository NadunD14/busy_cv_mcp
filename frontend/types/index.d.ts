// Type definitions for pdfjs-dist
declare module 'pdfjs-dist' {
    export interface PDFDocumentProxy {
        numPages: number;
        getPage(pageNumber: number): Promise<PDFPageProxy>;
    }

    export interface PDFPageProxy {
        getTextContent(): Promise<{
            items: Array<{
                str: string;
                [key: string]: any;
            }>;
        }>;
    }

    export interface GlobalWorkerOptions {
        workerSrc: string;
    }

    export const GlobalWorkerOptions: GlobalWorkerOptions;
    export const version: string;

    export function getDocument(params: {
        data: ArrayBuffer;
        [key: string]: any;
    }): {
        promise: Promise<PDFDocumentProxy>;
    };
}

declare module 'mammoth' {
    export function extractRawText(options: {
        arrayBuffer: ArrayBuffer;
    }): Promise<{
        value: string;
        messages: any[];
    }>;
}
