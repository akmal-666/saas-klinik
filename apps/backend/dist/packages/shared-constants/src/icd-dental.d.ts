export interface Icd10Item {
    code: string;
    description: string;
    category: string;
    chapter: string;
    billable: boolean;
    notes?: string;
}
export declare const ICD10_DENTAL: Icd10Item[];
export interface Icd9Item {
    code: string;
    description: string;
    category: string;
    billable: boolean;
}
export declare const ICD9_DENTAL: Icd9Item[];
export declare function searchIcd10(query: string, limit?: number): Icd10Item[];
export declare function searchIcd9(query: string, limit?: number): Icd9Item[];
export declare const ICD10_CATEGORIES: string[];
export declare const ICD9_CATEGORIES: string[];
