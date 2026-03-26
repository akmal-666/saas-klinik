export declare class HealthController {
    private readonly startTime;
    check(): {
        ok: boolean;
        data: {
            status: string;
            version: any;
            env: any;
            uptime: number;
            ts: string;
        };
    };
}
