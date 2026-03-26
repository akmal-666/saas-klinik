import { SupabaseClient } from '@supabase/supabase-js';
import { Appointment, AppointmentStatus, AppointmentWithRelations, PaginationMeta } from '@klinik/shared-types';
import { CreateAppointmentDto, UpdateAppointmentDto, UpdateAppointmentStatusDto, AppointmentQueryDto, RescheduleAppointmentDto } from './dto/appointment.dto';
export declare class AppointmentsService {
    private readonly supabase;
    private readonly logger;
    constructor(supabase: SupabaseClient);
    findAll(clinic_id: string, query: AppointmentQueryDto): Promise<{
        data: AppointmentWithRelations[];
        meta: PaginationMeta;
    }>;
    findOne(clinic_id: string, id: string): Promise<AppointmentWithRelations>;
    create(clinic_id: string, dto: CreateAppointmentDto, created_by: string): Promise<Appointment>;
    update(clinic_id: string, id: string, dto: UpdateAppointmentDto): Promise<Appointment>;
    updateStatus(clinic_id: string, id: string, dto: UpdateAppointmentStatusDto): Promise<Appointment>;
    reschedule(clinic_id: string, id: string, dto: RescheduleAppointmentDto, updated_by: string): Promise<Appointment>;
    remove(clinic_id: string, id: string): Promise<{
        message: string;
    }>;
    getTodaySummary(clinic_id: string): Promise<Record<AppointmentStatus, number>>;
    private checkConflict;
}
