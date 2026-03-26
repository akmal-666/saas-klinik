import { AppointmentStatus } from '@klinik/shared-types';
export declare class CreateAppointmentDto {
    patient_id: string;
    doctor_id: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes?: number;
    treatment_ids: string[];
    status?: AppointmentStatus;
    notes?: string;
    source?: 'walk_in' | 'online' | 'phone';
}
declare const UpdateAppointmentDto_base: any;
export declare class UpdateAppointmentDto extends UpdateAppointmentDto_base {
}
export declare class UpdateAppointmentStatusDto {
    status: AppointmentStatus;
    notes?: string;
}
export declare class AppointmentQueryDto {
    date?: string;
    doctor_id?: string;
    patient_id?: string;
    status?: AppointmentStatus;
    view?: 'calendar' | 'list';
    cursor?: string;
    limit?: number;
}
export declare class RescheduleAppointmentDto {
    scheduled_date: string;
    scheduled_time: string;
    reason?: string;
}
export {};
