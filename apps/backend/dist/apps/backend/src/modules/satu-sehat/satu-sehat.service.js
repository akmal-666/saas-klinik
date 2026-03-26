"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SatuSehatService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SatuSehatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../../database/supabase.module");
let SatuSehatService = SatuSehatService_1 = class SatuSehatService {
    constructor(sb, config) {
        this.sb = sb;
        this.config = config;
        this.logger = new common_1.Logger(SatuSehatService_1.name);
        this.tokenCache = null;
    }
    async getAccessToken(clientId, clientSecret) {
        if (this.tokenCache && this.tokenCache.expires > Date.now()) {
            return this.tokenCache.token;
        }
        const baseUrl = this.config.get('SATUSEHAT_BASE_URL', 'https://api-satusehat.kemkes.go.id');
        const res = await fetch(`${baseUrl}/oauth2/v1/accesstoken?grant_type=client_credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
        });
        if (!res.ok)
            throw new Error(`SATUSEHAT auth failed: ${res.status}`);
        const data = await res.json();
        this.tokenCache = {
            token: data.access_token,
            expires: Date.now() + (data.expires_in - 60) * 1000,
        };
        return data.access_token;
    }
    async syncEmr(emr_id, clinic_id) {
        const { data: clinic } = await this.sb.from('clinics')
            .select('satusehat_org_id, satusehat_client_id, satusehat_client_secret, satusehat_enabled')
            .eq('id', clinic_id).single();
        if (!clinic?.satusehat_enabled || !clinic.satusehat_org_id) {
            this.logger.warn(`SATUSEHAT not enabled for clinic ${clinic_id}`);
            return;
        }
        const { data: emr } = await this.sb.from('emr_records')
            .select('*, patient:patients(id,full_name,date_of_birth,gender), doctor:doctors(id,name,sip_number)')
            .eq('id', emr_id).single();
        if (!emr) {
            this.logger.warn(`EMR ${emr_id} not found`);
            return;
        }
        try {
            const token = await this.getAccessToken(clinic.satusehat_client_id, clinic.satusehat_client_secret);
            const bundle = this.buildFhirBundle(emr, clinic);
            await this.postBundle(bundle, token, clinic.satusehat_org_id);
            await this.sb.from('emr_records').update({
                satusehat_status: 'synced',
                satusehat_synced_at: new Date().toISOString(),
            }).eq('id', emr_id);
            this.logger.log(`SATUSEHAT sync OK: EMR ${emr_id}`);
        }
        catch (err) {
            this.logger.error(`SATUSEHAT sync FAILED: EMR ${emr_id} — ${err.message}`);
            await this.sb.from('emr_records').update({ satusehat_status: 'failed' }).eq('id', emr_id);
            throw err;
        }
    }
    buildFhirBundle(emr, clinic) {
        const patient = emr.patient;
        const doctor = emr.doctor;
        const visitDate = emr.visit_date;
        const baseUrl = 'https://api-satusehat.kemkes.go.id/fhir-r4/v1';
        const orgId = clinic.satusehat_org_id;
        const encounter = {
            resourceType: 'Encounter',
            id: `encounter-${emr.id}`,
            status: 'finished',
            class: {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                code: 'AMB',
                display: 'Ambulatory',
            },
            subject: {
                reference: `Patient/${patient.id}`,
                display: patient.full_name,
            },
            participant: [{
                    individual: {
                        reference: `Practitioner/${doctor.id}`,
                        display: doctor.name,
                    },
                }],
            period: {
                start: `${visitDate}T00:00:00+07:00`,
                end: `${visitDate}T23:59:59+07:00`,
            },
            serviceProvider: {
                reference: `Organization/${orgId}`,
            },
        };
        const conditions = (emr.icd10_codes || []).map((code, i) => ({
            resourceType: 'Condition',
            id: `condition-${emr.id}-${i}`,
            clinicalStatus: {
                coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
            },
            code: {
                coding: [{
                        system: 'http://hl7.org/fhir/sid/icd-10',
                        code,
                    }],
            },
            subject: { reference: `Patient/${patient.id}` },
            encounter: { reference: `Encounter/encounter-${emr.id}` },
        }));
        const procedures = (emr.icd9_codes || []).map((code, i) => ({
            resourceType: 'Procedure',
            id: `procedure-${emr.id}-${i}`,
            status: 'completed',
            code: {
                coding: [{
                        system: 'http://hl7.org/fhir/sid/icd-9-cm',
                        code,
                    }],
            },
            subject: { reference: `Patient/${patient.id}` },
            encounter: { reference: `Encounter/encounter-${emr.id}` },
        }));
        const observations = [];
        if (emr.vitals?.blood_pressure) {
            observations.push({
                resourceType: 'Observation',
                id: `obs-bp-${emr.id}`,
                status: 'final',
                code: {
                    coding: [{ system: 'http://loinc.org', code: '55284-4', display: 'Blood pressure' }],
                },
                subject: { reference: `Patient/${patient.id}` },
                encounter: { reference: `Encounter/encounter-${emr.id}` },
                valueString: emr.vitals.blood_pressure,
            });
        }
        return {
            resourceType: 'Bundle',
            type: 'transaction',
            entry: [
                { resource: encounter, request: { method: 'POST', url: 'Encounter' } },
                ...conditions.map((c) => ({ resource: c, request: { method: 'POST', url: 'Condition' } })),
                ...procedures.map((p) => ({ resource: p, request: { method: 'POST', url: 'Procedure' } })),
                ...observations.map((o) => ({ resource: o, request: { method: 'POST', url: 'Observation' } })),
            ],
        };
    }
    async postBundle(bundle, token, orgId) {
        const baseUrl = this.config.get('SATUSEHAT_BASE_URL', 'https://api-satusehat.kemkes.go.id');
        const res = await fetch(`${baseUrl}/fhir-r4/v1`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'X-Organization-ID': orgId,
            },
            body: JSON.stringify(bundle),
        });
        if (!res.ok) {
            const body = await res.text();
            throw new Error(`SATUSEHAT API error ${res.status}: ${body}`);
        }
    }
    async syncPendingBatch(limit = 10) {
        const { data: pending } = await this.sb
            .from('satusehat_pending')
            .select('id, clinic_id')
            .limit(limit);
        let synced = 0, failed = 0;
        for (const row of pending ?? []) {
            try {
                await this.syncEmr(row.id, row.clinic_id);
                synced++;
            }
            catch {
                failed++;
            }
        }
        this.logger.log(`SATUSEHAT batch: ${synced} synced, ${failed} failed`);
        return { synced, failed };
    }
};
exports.SatuSehatService = SatuSehatService;
exports.SatuSehatService = SatuSehatService = SatuSehatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE_ADMIN)),
    __metadata("design:paramtypes", [typeof (_a = typeof supabase_js_1.SupabaseClient !== "undefined" && supabase_js_1.SupabaseClient) === "function" ? _a : Object, typeof (_b = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _b : Object])
], SatuSehatService);
//# sourceMappingURL=satu-sehat.service.js.map