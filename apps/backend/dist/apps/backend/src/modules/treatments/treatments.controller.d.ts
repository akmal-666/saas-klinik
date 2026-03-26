import { TreatmentsService } from './treatments.service';
export declare class TreatmentsController {
    private readonly svc;
    constructor(svc: TreatmentsService);
    findAll(cid: string, cat?: string, all?: string): Promise<any>;
    categories(cid: string): Promise<unknown[]>;
    create(cid: string, dto: any): Promise<any>;
    update(cid: string, id: string, dto: any): Promise<any>;
}
