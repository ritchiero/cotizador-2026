export interface TermTemplate {
    id: string;
    name: string;
    content: string;
    userId: string;
    createdAt?: any;
    type: 'GENERAL' | 'SPECIFIC' | 'POLICY';
}
