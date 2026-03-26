export declare class SoapDto {
    S: string;
    O: string;
    A: string;
    P: string;
}
export declare class VitalsDto {
    blood_pressure?: string;
    pulse?: number;
    respiratory_rate?: number;
    temperature?: number;
}
export declare class CreateEmrDto {
    appointment_id?: string;
    patient_id: string;
    doctor_id: string;
    visit_date: string;
    soap: SoapDto;
    vitals?: VitalsDto;
    icd10_codes?: string[];
    icd9_codes?: string[];
    treatment_ids?: string[];
    notes?: string;
    consent_signed?: boolean;
}
declare const UpdateEmrDto_base: any;
export declare class UpdateEmrDto extends UpdateEmrDto_base {
}
export declare class EmrQueryDto {
    patient_id?: string;
    doctor_id?: string;
    date_from?: string;
    date_to?: string;
    q?: string;
    cursor?: string;
    limit?: number;
}
export declare class SignConsentDto {
    signature_data: string;
    signer_name?: string;
    signer_relation?: string;
}
export {};
