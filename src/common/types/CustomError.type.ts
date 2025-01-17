export class CustomError extends Error {
    constructor({ functionOrMethod, error }: { functionOrMethod: string; error: string }) {
        const message = `Method or Function: ${functionOrMethod}\n\nError: ${error}`;
        super(message);
        this.name = 'CustomError';
    }
}
