export interface ServerErrorResponse {
    name: string;
    message: string;
    details?: any;
}

export class ApiError extends Error {
    public __proto__: Error;
    public readonly code: number;

    constructor(code: number, message?: string) {
        // This includes a trick in order to make the instanceof properly work
        const trueProto = new.target.prototype;
        super(message);
        this.__proto__ = trueProto;

        this.code = code;
        this.name = 'ApiError';
    }

    public getServerResponse(): ServerErrorResponse {
        return {
            name: this.name,
            message: this.message
        };
    }
}
