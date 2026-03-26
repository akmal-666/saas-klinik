"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KasirModule = void 0;
const common_1 = require("@nestjs/common");
const kasir_controller_1 = require("./kasir.controller");
const kasir_service_1 = require("./kasir.service");
let KasirModule = class KasirModule {
};
exports.KasirModule = KasirModule;
exports.KasirModule = KasirModule = __decorate([
    (0, common_1.Module)({
        controllers: [kasir_controller_1.KasirController],
        providers: [kasir_service_1.KasirService],
        exports: [kasir_service_1.KasirService],
    })
], KasirModule);
//# sourceMappingURL=kasir.module.js.map