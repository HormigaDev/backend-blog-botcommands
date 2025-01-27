export class CustomError extends Error {
    constructor({ functionOrMethod, error }: { functionOrMethod: string; error: any }) {
        const message = `Method or Function: ${functionOrMethod}\n\nError: ${error.message}`;
        super(message);
        this.name = 'CustomError';
    }
}
