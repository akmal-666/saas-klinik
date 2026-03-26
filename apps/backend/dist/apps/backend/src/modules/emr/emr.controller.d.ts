import { EmrService } from './emr.service';
import { CreateEmrDto, UpdateEmrDto, EmrQueryDto, SignConsentDto } from './dto/emr.dto';
import { JwtPayload } from '../../common/guards/jwt-auth.guard';
export declare class EmrController {
    private readonly svc;
    constructor(svc: EmrService);
    findAll(clinicId: string, query: EmrQueryDto, user: JwtPayload): Promise<{
        data: any;
        meta: {
            cursor: string;
            next_cursor: any;
            total: any;
            limit: number;
            has_more: boolean;
        };
    }>;
    searchIcd10(q?: string, category?: string, _clinicId?: string): Promise<any>;
    searchIcd9(q?: string, category?: string, _clinicId?: string): Promise<any>;
    getPatientHistory(clinicId: string, patientId: string): Promise<{
        patient: any;
        visits: any;
        deposit_balance: any;
        total_visits: any;
    }>;
    findOne(clinicId: string, id: string, user: JwtPayload): Promise<any>;
    create(clinicId: string, dto: CreateEmrDto, user: JwtPayload): Promise<any>;
    update(clinicId: string, id: string, dto: UpdateEmrDto, user: JwtPayload): Promise<any>;
    signConsent(clinicId: string, id: string, dto: SignConsentDto, user: JwtPayload): Promise<any>;
}
