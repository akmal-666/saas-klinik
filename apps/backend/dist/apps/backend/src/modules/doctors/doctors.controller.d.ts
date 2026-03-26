import { DoctorsService } from './doctors.service';
export declare class DoctorsController {
    private readonly svc;
    constructor(svc: DoctorsService);
    findAll(cid: string, full?: string): Promise<any>;
    findOne(cid: string, id: string): Promise<any>;
    availability(cid: string, id: string, date: string): Promise<{
        appointments: any;
        on_leave: boolean;
    }>;
    create(cid: string, dto: any): Promise<any>;
    update(cid: string, id: string, dto: any): Promise<any>;
}
