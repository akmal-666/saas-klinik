export declare class CreatePatientDto {
    full_name: string;
    date_of_birth: string;
    gender: 'L' | 'P';
    phone?: string;
    email?: string;
    address?: string;
    blood_type?: string;
    allergy?: string;
    insurance_id?: string;
    insurance_number?: string;
    notes?: string;
}
declare const UpdatePatientDto_base: any;
export declare class UpdatePatientDto extends UpdatePatientDto_base {
}
export {};
