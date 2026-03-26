import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, UpdateAppointmentStatusDto, AppointmentQueryDto, RescheduleAppointmentDto } from './dto/appointment.dto';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
export declare class AppointmentsController {
    private readonly svc;
    constructor(svc: AppointmentsService);
    findAll(clinicId: string, query: AppointmentQueryDto): Promise<{
        data: import("@klinik/shared-types").AppointmentWithRelations[];
        meta: import("@klinik/shared-types").PaginationMeta;
    }>;
    getTodaySummary(clinicId: string): Promise<Record<import("@klinik/shared-types").AppointmentStatus, number>>;
    findOne(clinicId: string, id: string): Promise<import("@klinik/shared-types").AppointmentWithRelations>;
    create(clinicId: string, dto: CreateAppointmentDto, user: JwtPayload): Promise<import("@klinik/shared-types").Appointment>;
    update(clinicId: string, id: string, dto: UpdateAppointmentDto): Promise<import("@klinik/shared-types").Appointment>;
    updateStatus(clinicId: string, id: string, dto: UpdateAppointmentStatusDto): Promise<import("@klinik/shared-types").Appointment>;
    reschedule(clinicId: string, id: string, dto: RescheduleAppointmentDto, user: JwtPayload): Promise<import("@klinik/shared-types").Appointment>;
    remove(clinicId: string, id: string): Promise<{
        message: string;
    }>;
}
