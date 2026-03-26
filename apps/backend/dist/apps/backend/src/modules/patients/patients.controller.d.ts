import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
export declare class PatientsController {
    private readonly svc;
    constructor(svc: PatientsService);
    findAll(cid: string, q?: string, cursor?: string, limit?: number): Promise<{
        data: any;
        meta: {
            has_more: boolean;
            next_cursor: any;
            total: any;
            limit: number;
        };
    }>;
    searchRm(cid: string, q: string): Promise<any>;
    findOne(cid: string, id: string): Promise<any>;
    create(cid: string, dto: CreatePatientDto): Promise<any>;
    update(cid: string, id: string, dto: UpdatePatientDto): Promise<any>;
    deactivate(cid: string, id: string): Promise<any>;
}
