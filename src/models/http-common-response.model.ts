export interface IHttpCommonResponse<T> {
    success: boolean;
    code: string;
    reason: string;
    data: T;
}