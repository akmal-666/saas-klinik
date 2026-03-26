"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SatuSehatModule = void 0;
const common_1 = require("@nestjs/common");
const satu_sehat_controller_1 = require("./satu-sehat.controller");
const satu_sehat_service_1 = require("./satu-sehat.service");
const queue_service_1 = require("../../queues/queue.service");
let SatuSehatModule = class SatuSehatModule {
};
exports.SatuSehatModule = SatuSehatModule;
exports.SatuSehatModule = SatuSehatModule = __decorate([
    (0, common_1.Module)({
        controllers: [satu_sehat_controller_1.SatuSehatController],
        providers: [satu_sehat_service_1.SatuSehatService, queue_service_1.QueueService],
        exports: [satu_sehat_service_1.SatuSehatService],
    })
], SatuSehatModule);
//# sourceMappingURL=satu-sehat.module.js.map