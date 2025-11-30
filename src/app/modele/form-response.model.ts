export interface FormResponse {
    id: number;
    date: Date;
    content: { [key: string]: string };
}