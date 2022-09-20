declare namespace Express {
    export interface Request {
        query: Record<string, string>;
        params: Record<string, string>;
    }
}
