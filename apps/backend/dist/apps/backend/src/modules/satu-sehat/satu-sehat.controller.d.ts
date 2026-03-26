import { SatuSehatService } from './satu-sehat.service';
export declare class SatuSehatController {
    private readonly svc;
    constructor(svc: SatuSehatService);
    syncEmr(cid: string, id: string): Promise<void>;
    syncBatch(): Promise<{
        synced: number;
        failed: number;
    }>;
}
