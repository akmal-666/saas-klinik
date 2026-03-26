// ══════════════════════════════════════════════════════════════
// ICD-10 DENTAL REFERENCE DATA — Standar Kemenkes RI
// Sumber: ICD-10-CM 2024 + Permenkes No. 27 Tahun 2014
// Bab relevan: K00-K14 (Penyakit Rongga Mulut, Kelenjar Ludah
//              dan Rahang), S00-S09 (Cedera Kepala), Z-codes
// ══════════════════════════════════════════════════════════════

export interface Icd10Item {
  code: string;
  description: string; // Bahasa Indonesia (sesuai Kemenkes)
  category: string;
  chapter: string;
  billable: boolean; // True = kode yang bisa ditagihkan / kode spesifik
  notes?: string;
}

export const ICD10_DENTAL: Icd10Item[] = [

  // ──────────────────────────────────────────────────────────
  // K00 — GANGGUAN PERKEMBANGAN DAN ERUPSI GIGI
  // ──────────────────────────────────────────────────────────
  { code:'K00',    description:'Gangguan perkembangan dan erupsi gigi',                     category:'Gangguan Perkembangan Gigi', chapter:'K00',   billable:false },
  { code:'K00.0',  description:'Anodontia (tidak tumbuh gigi)',                              category:'Gangguan Perkembangan Gigi', chapter:'K00',   billable:true },
  { code:'K00.1',  description:'Gigi supernumerari (gigi berlebih)',                         category:'Gangguan Perkembangan Gigi', chapter:'K00',   billable:true },
  { code:'K00.2',  description:'Anomali ukuran dan bentuk gigi',                             category:'Gangguan Perkembangan Gigi', chapter:'K00',   billable:true },
  { code:'K00.3',  description:'Gigi totol (mottled teeth) — fluorosis gigi',               category:'Gangguan Perkembangan Gigi', chapter:'K00',   billable:true },
  { code:'K00.4',  description:'Gangguan pembentukan gigi (disturbances in tooth formation)',category:'Gangguan Perkembangan Gigi', chapter:'K00',   billable:true },
  { code:'K00.5',  description:'Kelainan herediter pada struktur gigi, tidak diklasifikasikan di tempat lain', category:'Gangguan Perkembangan Gigi', chapter:'K00', billable:true },
  { code:'K00.6',  description:'Gangguan erupsi gigi',                                      category:'Gangguan Perkembangan Gigi', chapter:'K00',   billable:true },
  { code:'K00.7',  description:'Sindrom erupsi gigi (teething syndrome)',                   category:'Gangguan Perkembangan Gigi', chapter:'K00',   billable:true },
  { code:'K00.8',  description:'Gangguan perkembangan gigi lainnya yang ditentukan',        category:'Gangguan Perkembangan Gigi', chapter:'K00',   billable:true },
  { code:'K00.9',  description:'Gangguan perkembangan gigi, tidak ditentukan',              category:'Gangguan Perkembangan Gigi', chapter:'K00',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K01 — GIGI IMPAKSI DAN GIGI TERPENDAM
  // ──────────────────────────────────────────────────────────
  { code:'K01',    description:'Gigi impaksi dan gigi terpendam',                            category:'Gigi Impaksi',              chapter:'K01',   billable:false },
  { code:'K01.0',  description:'Gigi terpendam (embedded teeth — tanpa tulang atau jaringan lunak menghalangi)', category:'Gigi Impaksi', chapter:'K01', billable:true },
  { code:'K01.1',  description:'Gigi impaksi (impacted teeth — ada hambatan erupsi)',        category:'Gigi Impaksi',              chapter:'K01',   billable:true, notes:'Termasuk gigi molar ketiga impaksi (gigi bungsu)' },

  // ──────────────────────────────────────────────────────────
  // K02 — KARIES GIGI
  // ──────────────────────────────────────────────────────────
  { code:'K02',    description:'Karies gigi',                                                category:'Karies Gigi',               chapter:'K02',   billable:false },
  { code:'K02.0',  description:'Karies terbatas pada email (karies email / enamel caries)',  category:'Karies Gigi',               chapter:'K02',   billable:true, notes:'Bercak putih (white spot), awal karies' },
  { code:'K02.1',  description:'Karies dentin',                                              category:'Karies Gigi',               chapter:'K02',   billable:true, notes:'Karies mencapai dentin, umumnya sudah ada rasa ngilu' },
  { code:'K02.2',  description:'Karies sementum (cementum caries)',                          category:'Karies Gigi',               chapter:'K02',   billable:true, notes:'Karies pada akar gigi / permukaan sementum' },
  { code:'K02.3',  description:'Karies gigi terhenti (arrested dental caries)',              category:'Karies Gigi',               chapter:'K02',   billable:true },
  { code:'K02.51', description:'Karies fissure permukaan oklusal gigi primer (sulung)',      category:'Karies Gigi',               chapter:'K02',   billable:true },
  { code:'K02.52', description:'Karies fissure permukaan oklusal gigi permanen',             category:'Karies Gigi',               chapter:'K02',   billable:true },
  { code:'K02.53', description:'Karies fissure permukaan oklusal gigi tidak ditentukan',     category:'Karies Gigi',               chapter:'K02',   billable:true },
  { code:'K02.61', description:'Karies permukaan halus permukaan labial/bukal/lingual gigi primer', category:'Karies Gigi',      chapter:'K02',   billable:true },
  { code:'K02.62', description:'Karies permukaan halus permukaan labial/bukal/lingual gigi permanen', category:'Karies Gigi',   chapter:'K02',   billable:true },
  { code:'K02.7',  description:'Karies akar (root caries)',                                  category:'Karies Gigi',               chapter:'K02',   billable:true },
  { code:'K02.9',  description:'Karies gigi, tidak ditentukan',                              category:'Karies Gigi',               chapter:'K02',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K03 — PENYAKIT JARINGAN KERAS GIGI LAINNYA
  // ──────────────────────────────────────────────────────────
  { code:'K03',    description:'Penyakit lain pada jaringan keras gigi',                     category:'Jaringan Keras Gigi',       chapter:'K03',   billable:false },
  { code:'K03.0',  description:'Atrisi gigi berlebihan (excessive attrition)',               category:'Jaringan Keras Gigi',       chapter:'K03',   billable:true, notes:'Keausan gigi akibat gesekan oklusal (bruxism)' },
  { code:'K03.1',  description:'Abrasi gigi (abrasion of teeth)',                            category:'Jaringan Keras Gigi',       chapter:'K03',   billable:true, notes:'Keausan akibat sikat gigi / benda asing' },
  { code:'K03.2',  description:'Erosi gigi (erosion of teeth)',                              category:'Jaringan Keras Gigi',       chapter:'K03',   billable:true, notes:'Keausan akibat asam (GERD, minuman asam)' },
  { code:'K03.3',  description:'Resorpsi patologis gigi (pathological resorption)',          category:'Jaringan Keras Gigi',       chapter:'K03',   billable:true },
  { code:'K03.4',  description:'Hipersementosis (hypercementosis)',                          category:'Jaringan Keras Gigi',       chapter:'K03',   billable:true },
  { code:'K03.5',  description:'Ankylosis gigi (ankylosis of teeth)',                        category:'Jaringan Keras Gigi',       chapter:'K03',   billable:true },
  { code:'K03.6',  description:'Deposisi pada gigi (deposits on teeth)',                     category:'Jaringan Keras Gigi',       chapter:'K03',   billable:true, notes:'Kalkulus, plak, diskolorasi' },
  { code:'K03.7',  description:'Perubahan warna pasca erupsi gigi (posteruptive colour changes)', category:'Jaringan Keras Gigi', chapter:'K03',  billable:true },
  { code:'K03.81', description:'Retak/craze lines pada email (cracked tooth)',               category:'Jaringan Keras Gigi',       chapter:'K03',   billable:true },
  { code:'K03.89', description:'Penyakit jaringan keras gigi lain yang ditentukan',         category:'Jaringan Keras Gigi',       chapter:'K03',   billable:true },
  { code:'K03.9',  description:'Penyakit jaringan keras gigi, tidak ditentukan',            category:'Jaringan Keras Gigi',       chapter:'K03',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K04 — PENYAKIT PULPA DAN JARINGAN PERIAPIKAL
  // ──────────────────────────────────────────────────────────
  { code:'K04',    description:'Penyakit pulpa dan jaringan periapikal',                     category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:false },
  { code:'K04.0',  description:'Pulpitis (radang pulpa gigi)',                               category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:false },
  { code:'K04.01', description:'Pulpitis reversibel',                                        category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true, notes:'Hiperemia pulpa, masih dapat disembuhkan tanpa PSA' },
  { code:'K04.02', description:'Pulpitis irreversibel',                                      category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true, notes:'Indikasi perawatan saluran akar (PSA)' },
  { code:'K04.1',  description:'Nekrosis pulpa (gangren pulpa)',                             category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true, notes:'Mati pulpa, tidak ada respons vitalitas' },
  { code:'K04.2',  description:'Degenerasi pulpa',                                           category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true, notes:'Kalsifikasi pulpa / batu pulpa' },
  { code:'K04.3',  description:'Pembentukan jaringan keras abnormal dalam pulpa',            category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true },
  { code:'K04.4',  description:'Periodontitis apikal akut yang berasal dari pulpa',          category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true, notes:'Nyeri pada perkusi/tekanan' },
  { code:'K04.5',  description:'Periodontitis apikal kronis (granuloma periapikal)',         category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true },
  { code:'K04.6',  description:'Abses periapikal dengan sinus (fistula)',                    category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true },
  { code:'K04.7',  description:'Abses periapikal tanpa sinus',                               category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true },
  { code:'K04.8',  description:'Kista akar (radicular cyst)',                                category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true, notes:'Kista periapikal / lateral' },
  { code:'K04.80', description:'Kista apikal dan lateral (periapikal)',                      category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true },
  { code:'K04.81', description:'Kista residual',                                             category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true },
  { code:'K04.89', description:'Kista akar lainnya yang ditentukan',                        category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true },
  { code:'K04.9',  description:'Penyakit pulpa dan periapikal lain, tidak ditentukan',      category:'Penyakit Pulpa & Periapikal', chapter:'K04', billable:true },

  // ──────────────────────────────────────────────────────────
  // K05 — GINGIVITIS DAN PENYAKIT PERIODONTAL
  // ──────────────────────────────────────────────────────────
  { code:'K05',    description:'Gingivitis dan penyakit periodontal',                        category:'Penyakit Periodontal',       chapter:'K05',   billable:false },
  { code:'K05.0',  description:'Gingivitis akut (acute gingivitis)',                         category:'Penyakit Periodontal',       chapter:'K05',   billable:false },
  { code:'K05.00', description:'Gingivitis akut, plak terinduksi',                           category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.01', description:'Gingivitis akut, non-plak terinduksi',                       category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.1',  description:'Gingivitis kronis (chronic gingivitis)',                     category:'Penyakit Periodontal',       chapter:'K05',   billable:false },
  { code:'K05.10', description:'Gingivitis kronis marginal tanpa komplikasi',                category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.11', description:'Gingivitis kronis hiperplastik',                             category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.19', description:'Gingivitis kronis lainnya',                                  category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.2',  description:'Periodontitis agresif (aggressive periodontitis)',           category:'Penyakit Periodontal',       chapter:'K05',   billable:false },
  { code:'K05.20', description:'Periodontitis agresif, tidak ditentukan',                    category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.21', description:'Periodontitis agresif — penyakit periodontal terlokalisir', category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.22', description:'Periodontitis agresif — penyakit periodontal generalisata', category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.3',  description:'Periodontitis kronis (chronic periodontitis)',               category:'Penyakit Periodontal',       chapter:'K05',   billable:false },
  { code:'K05.30', description:'Periodontitis kronis, tidak ditentukan',                     category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.31', description:'Periodontitis kronis terlokalisir',                          category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.32', description:'Periodontitis kronis generalisata',                          category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.4',  description:'Periodontosis (periodontosis)',                              category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.5',  description:'Penyakit periodontal lain',                                  category:'Penyakit Periodontal',       chapter:'K05',   billable:true },
  { code:'K05.6',  description:'Penyakit periodontal, tidak ditentukan',                     category:'Penyakit Periodontal',       chapter:'K05',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K06 — GANGGUAN GINGIVA DAN LINGIR ALVEOLAR
  // ──────────────────────────────────────────────────────────
  { code:'K06',    description:'Gangguan lain gingiva dan lingir alveolar tidak bergigi',    category:'Gangguan Gingiva',           chapter:'K06',   billable:false },
  { code:'K06.0',  description:'Resesi gingiva (gingival recession)',                        category:'Gangguan Gingiva',           chapter:'K06',   billable:false },
  { code:'K06.01', description:'Resesi gingiva — terlokalisir',                              category:'Gangguan Gingiva',           chapter:'K06',   billable:true },
  { code:'K06.02', description:'Resesi gingiva — generalisata',                              category:'Gangguan Gingiva',           chapter:'K06',   billable:true },
  { code:'K06.1',  description:'Pembesaran gingiva (gingival enlargement / hyperplasia)',    category:'Gangguan Gingiva',           chapter:'K06',   billable:true },
  { code:'K06.2',  description:'Lesi gingiva dan alveolar akibat trauma',                    category:'Gangguan Gingiva',           chapter:'K06',   billable:true, notes:'Termasuk lesi akibat menyikat gigi yang salah' },
  { code:'K06.3',  description:'Kista mukosa alveolar (alveolar mucosa cyst)',               category:'Gangguan Gingiva',           chapter:'K06',   billable:true },
  { code:'K06.8',  description:'Gangguan lain gingiva dan alveolar yang ditentukan',        category:'Gangguan Gingiva',           chapter:'K06',   billable:true },
  { code:'K06.9',  description:'Gangguan gingiva dan alveolar, tidak ditentukan',           category:'Gangguan Gingiva',           chapter:'K06',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K08 — GANGGUAN LAIN GIGI DAN STRUKTUR PENYANGGA
  // ──────────────────────────────────────────────────────────
  { code:'K08',    description:'Gangguan lain gigi dan struktur penyangga',                  category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:false },
  { code:'K08.0',  description:'Eksfoliasi gigi akibat penyakit sistemik',                   category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.1',  description:'Kehilangan gigi akibat kecelakaan, ekstraksi, atau penyakit lokal', category:'Gangguan Gigi Lainnya', chapter:'K08', billable:false },
  { code:'K08.101',description:'Kehilangan gigi akibat trauma — kelas I',                    category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.102',description:'Kehilangan gigi akibat trauma — kelas II',                   category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.103',description:'Kehilangan gigi akibat trauma — kelas III',                  category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.104',description:'Kehilangan gigi akibat trauma — kelas IV',                   category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.109',description:'Kehilangan gigi akibat trauma, tidak ditentukan',           category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.111',description:'Kehilangan gigi akibat karies — kelas I',                   category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.119',description:'Kehilangan gigi akibat karies, tidak ditentukan',           category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.121',description:'Kehilangan gigi akibat penyakit periodontal — kelas I',     category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.129',description:'Kehilangan gigi akibat penyakit periodontal, tidak ditentukan', category:'Gangguan Gigi Lainnya', chapter:'K08',   billable:true },
  { code:'K08.199',description:'Kehilangan gigi akibat penyebab lain, tidak ditentukan',    category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.2',  description:'Atrisi gigi tidak bergigi (atrophy of edentulous alveolar ridge)', category:'Gangguan Gigi Lainnya', chapter:'K08', billable:true },
  { code:'K08.3',  description:'Sisa akar (retained dental root)',                           category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.4',  description:'Sakit kepala terkait sakit gigi / nyeri odontogenik',       category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:false },
  { code:'K08.40', description:'Sakit gigi, tidak ditentukan (toothache NOS)',               category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.41', description:'Nyeri gigi irreversibel',                                    category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.42', description:'Nyeri gigi akibat terkelupasnya dentin',                     category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.49', description:'Sakit gigi lainnya',                                         category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.50', description:'Gigi fraktur tidak berkomplikasi, tidak ditentukan',        category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.51', description:'Fraktur mahkota tanpa melibatkan pulpa',                     category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.52', description:'Fraktur mahkota melibatkan pulpa',                           category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.53', description:'Fraktur akar gigi',                                          category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.54', description:'Fraktur mahkota-akar',                                       category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.59', description:'Fraktur gigi lainnya',                                       category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.81', description:'Gigi primer yang terlambat tanggal',                         category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.82', description:'Pembesaran alveolar (enlarged alveolar ridge)',              category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.89', description:'Gangguan gigi dan struktur penyangga lainnya',              category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },
  { code:'K08.9',  description:'Gangguan gigi dan struktur penyangga, tidak ditentukan',    category:'Gangguan Gigi Lainnya',      chapter:'K08',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K09 — KISTA RONGGA MULUT, TIDAK DIKLASIFIKASIKAN DI TEMPAT LAIN
  // ──────────────────────────────────────────────────────────
  { code:'K09',    description:'Kista rongga mulut, tidak diklasifikasikan di tempat lain', category:'Kista Mulut & Rahang',       chapter:'K09',   billable:false },
  { code:'K09.0',  description:'Kista perkembangan odontogenik (dentigerous cyst, dll.)',   category:'Kista Mulut & Rahang',       chapter:'K09',   billable:true, notes:'Termasuk kista dentigerous, eruptif, keratokistik odontogenik' },
  { code:'K09.1',  description:'Kista fisural (fissural cysts of jaw)',                     category:'Kista Mulut & Rahang',       chapter:'K09',   billable:true },
  { code:'K09.8',  description:'Kista rongga mulut lainnya yang ditentukan',               category:'Kista Mulut & Rahang',       chapter:'K09',   billable:true },
  { code:'K09.9',  description:'Kista rongga mulut, tidak ditentukan',                     category:'Kista Mulut & Rahang',       chapter:'K09',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K10 — PENYAKIT LAIN RAHANG
  // ──────────────────────────────────────────────────────────
  { code:'K10',    description:'Penyakit lain rahang',                                       category:'Penyakit Rahang',            chapter:'K10',   billable:false },
  { code:'K10.0',  description:'Gangguan perkembangan rahang (developmental disorders of jaws)', category:'Penyakit Rahang',       chapter:'K10',   billable:true },
  { code:'K10.1',  description:'Tumor odontogenik sentral sel raksasa (giant cell granuloma)', category:'Penyakit Rahang',         chapter:'K10',   billable:true },
  { code:'K10.2',  description:'Kondisi radang rahang (inflammatory conditions of jaws)',    category:'Penyakit Rahang',            chapter:'K10',   billable:true, notes:'Termasuk osteitis, periostitis, osteomielitis rahang' },
  { code:'K10.3',  description:'Alveolitis rahang (dry socket, alveolitis sicca dolorosa)', category:'Penyakit Rahang',            chapter:'K10',   billable:true, notes:'Dry socket pasca ekstraksi' },
  { code:'K10.8',  description:'Penyakit rahang lain yang ditentukan',                      category:'Penyakit Rahang',            chapter:'K10',   billable:true, notes:'Termasuk eksostosis, torus palatinus, torus mandibularis' },
  { code:'K10.9',  description:'Penyakit rahang, tidak ditentukan',                         category:'Penyakit Rahang',            chapter:'K10',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K11 — PENYAKIT KELENJAR LUDAH
  // ──────────────────────────────────────────────────────────
  { code:'K11',    description:'Penyakit kelenjar ludah (salivary glands)',                  category:'Kelenjar Ludah',             chapter:'K11',   billable:false },
  { code:'K11.0',  description:'Atrofi kelenjar ludah',                                      category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.1',  description:'Hipertrofi kelenjar ludah',                                  category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.2',  description:'Sialoadenitis (radang kelenjar ludah)',                      category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.20', description:'Sialoadenitis, tidak ditentukan',                            category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.21', description:'Sialoadenitis akut',                                         category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.22', description:'Sialoadenitis akut berulang',                                category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.23', description:'Sialoadenitis kronis',                                       category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.3',  description:'Abses kelenjar ludah',                                       category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.4',  description:'Fistula kelenjar ludah',                                     category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.5',  description:'Sialolithiasis (batu kelenjar ludah)',                       category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.6',  description:'Mukokel kelenjar ludah (mucocele)',                          category:'Kelenjar Ludah',             chapter:'K11',   billable:true, notes:'Termasuk ranula (mukokel dasar mulut)' },
  { code:'K11.7',  description:'Gangguan sekresi kelenjar ludah (xerostomia)',               category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.8',  description:'Penyakit kelenjar ludah lainnya yang ditentukan',            category:'Kelenjar Ludah',             chapter:'K11',   billable:true },
  { code:'K11.9',  description:'Penyakit kelenjar ludah, tidak ditentukan',                  category:'Kelenjar Ludah',             chapter:'K11',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K12 — STOMATITIS DAN LESI SERUPA
  // ──────────────────────────────────────────────────────────
  { code:'K12',    description:'Stomatitis dan lesi serupa',                                 category:'Stomatitis',                 chapter:'K12',   billable:false },
  { code:'K12.0',  description:'Aphthae oral berulang (recurrent oral aphthae / RAS)',       category:'Stomatitis',                 chapter:'K12',   billable:true, notes:'Sariawan / ulkus aftosa rekuren' },
  { code:'K12.1',  description:'Bentuk stomatitis lainnya',                                  category:'Stomatitis',                 chapter:'K12',   billable:true, notes:'Termasuk stomatitis denture, stomatitis kontak' },
  { code:'K12.2',  description:'Selulitis dan abses dasar mulut (Ludwig\'s angina)',         category:'Stomatitis',                 chapter:'K12',   billable:true },
  { code:'K12.30', description:'Mukositis oral, tidak ditentukan',                           category:'Stomatitis',                 chapter:'K12',   billable:true },
  { code:'K12.31', description:'Mukositis oral akibat agen antineoplastik',                  category:'Stomatitis',                 chapter:'K12',   billable:true },
  { code:'K12.32', description:'Mukositis oral akibat radiasi',                              category:'Stomatitis',                 chapter:'K12',   billable:true },
  { code:'K12.39', description:'Mukositis oral lainnya (termasuk drug-induced)',             category:'Stomatitis',                 chapter:'K12',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K13 — PENYAKIT LAIN BIBIR DAN MUKOSA MULUT
  // ──────────────────────────────────────────────────────────
  { code:'K13',    description:'Penyakit lain bibir dan mukosa mulut',                       category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:false },
  { code:'K13.0',  description:'Penyakit bibir (cheilitis, angular cheilitis, cheilosis)',  category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true },
  { code:'K13.1',  description:'Menggigit pipi dan bibir (cheek biting)',                    category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true },
  { code:'K13.2',  description:'Leukoplakia dan lesi putih lain epitel mulut',              category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true },
  { code:'K13.21', description:'Leukoplakia mulut (lesi prakanker)',                         category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true, notes:'Perlu biopsi untuk evaluasi keganasan' },
  { code:'K13.22', description:'Leukoplakia minimal terkait tembakau tanpa asap',           category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true },
  { code:'K13.29', description:'Lesi putih epitel mulut lainnya',                           category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true },
  { code:'K13.3',  description:'Leukoplakia berbulu (hairy leukoplakia)',                    category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true },
  { code:'K13.4',  description:'Granuloma dan lesi seperti granuloma mukosa mulut',         category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true },
  { code:'K13.5',  description:'Fibrosis submukosa mulut (oral submucous fibrosis / OSF)',  category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true },
  { code:'K13.6',  description:'Hiperplasia mukosa mulut akibat iritasi',                   category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true },
  { code:'K13.70', description:'Lesi eritroplakia, tidak ditentukan',                        category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true, notes:'Lesi merah — risiko tinggi keganasan' },
  { code:'K13.79', description:'Lesi mukosa mulut lainnya yang ditentukan',                 category:'Mukosa Mulut & Bibir',       chapter:'K13',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K14 — PENYAKIT LIDAH
  // ──────────────────────────────────────────────────────────
  { code:'K14',    description:'Penyakit lidah',                                             category:'Penyakit Lidah',             chapter:'K14',   billable:false },
  { code:'K14.0',  description:'Glossitis (radang lidah)',                                   category:'Penyakit Lidah',             chapter:'K14',   billable:true },
  { code:'K14.1',  description:'Lidah geografis (geographic tongue, benign migratory glossitis)', category:'Penyakit Lidah',        chapter:'K14',   billable:true },
  { code:'K14.2',  description:'Lidah rombus median (median rhomboid glossitis)',            category:'Penyakit Lidah',             chapter:'K14',   billable:true },
  { code:'K14.3',  description:'Hipertrofi papila lidah (tongue papilla hypertrophy)',       category:'Penyakit Lidah',             chapter:'K14',   billable:true, notes:'Termasuk lidah berbulu/hitam (black hairy tongue)' },
  { code:'K14.4',  description:'Atrofi papila lidah',                                       category:'Penyakit Lidah',             chapter:'K14',   billable:true, notes:'Lidah halus / smooth tongue, bald tongue' },
  { code:'K14.5',  description:'Lidah berlipat (fissured tongue, scrotal tongue)',          category:'Penyakit Lidah',             chapter:'K14',   billable:true },
  { code:'K14.6',  description:'Glossodynia (burning mouth syndrome)',                      category:'Penyakit Lidah',             chapter:'K14',   billable:true, notes:'Rasa terbakar pada lidah / mulut' },
  { code:'K14.8',  description:'Penyakit lidah lainnya yang ditentukan',                    category:'Penyakit Lidah',             chapter:'K14',   billable:true },
  { code:'K14.9',  description:'Penyakit lidah, tidak ditentukan',                          category:'Penyakit Lidah',             chapter:'K14',   billable:true },

  // ──────────────────────────────────────────────────────────
  // K07 — ANOMALI DENTOFASIAL (TERMASUK MALOKLUSI)
  // ──────────────────────────────────────────────────────────
  { code:'K07',    description:'Anomali dentofasial termasuk maloklusi',                     category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:false },
  { code:'K07.0',  description:'Anomali ukuran rahang (major anomalies of jaw size)',        category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true, notes:'Makrognasi, mikrognasi, prognasi rahang' },
  { code:'K07.1',  description:'Hubungan rahang atas-bawah tidak normal',                    category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true, notes:'Prognatisme rahang bawah / atas' },
  { code:'K07.2',  description:'Anomali hubungan dental arch',                               category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true, notes:'Crossbite, gigitan terbuka, deep bite' },
  { code:'K07.3',  description:'Anomali posisi gigi (anomalies of tooth position)',          category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true, notes:'Crowding, gigi berjejal, rotasi, transposisi' },
  { code:'K07.4',  description:'Maloklusi, tidak ditentukan (malocclusion NOS)',             category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true },
  { code:'K07.5',  description:'Kelainan fungsional dentofasial',                            category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true },
  { code:'K07.6',  description:'Gangguan sendi temporomandibular (TMD)',                     category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true, notes:'TMJ disorder, bunyi klik TMJ, nyeri otot mastikasi' },
  { code:'K07.60', description:'Gangguan TMJ, tidak ditentukan',                             category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true },
  { code:'K07.61', description:'Kondisi sendi kondilus temporomandibular',                   category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true },
  { code:'K07.62', description:'Arthralgia temporomandibular',                               category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true },
  { code:'K07.63', description:'Articular disc disorder TMJ',                                category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true },
  { code:'K07.64', description:'Trismus (TMJ)',                                              category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true },
  { code:'K07.69', description:'Gangguan TMJ lainnya',                                       category:'Maloklusi & Ortodonsi',      chapter:'K07',   billable:true },

  // ──────────────────────────────────────────────────────────
  // S00-S09 — CEDERA GIGI (TRAUMA DENTOFASIAL)
  // ──────────────────────────────────────────────────────────
  { code:'S00.01XA',description:'Laserasi superfisial bibir',                                category:'Trauma Dental',              chapter:'S00',   billable:true },
  { code:'S00.511A',description:'Kontusio bibir',                                            category:'Trauma Dental',              chapter:'S00',   billable:true },
  { code:'S01.512A',description:'Luka terbuka bibir tanpa penetrasi rongga mulut',           category:'Trauma Dental',              chapter:'S01',   billable:true },
  { code:'S02.5XXA',description:'Fraktur gigi, pertemuan awal (fracture of tooth)',          category:'Trauma Dental',              chapter:'S02',   billable:true, notes:'Kode tambahan untuk jenis fraktur K08.5x' },
  { code:'S02.5XXD',description:'Fraktur gigi, pertemuan selanjutnya',                       category:'Trauma Dental',              chapter:'S02',   billable:true },
  { code:'S02.5XXS',description:'Fraktur gigi, sekuele (gejala sisa)',                      category:'Trauma Dental',              chapter:'S02',   billable:true },
  { code:'S02.600A',description:'Fraktur kondilus mandibula, tidak ditentukan',              category:'Trauma Dental',              chapter:'S02',   billable:true },
  { code:'S02.67XA',description:'Fraktur alveolar mandibula (fracture of alveolus of mandible)', category:'Trauma Dental',        chapter:'S02',   billable:true },
  { code:'S02.8XXA',description:'Fraktur tulang wajah lainnya',                              category:'Trauma Dental',              chapter:'S02',   billable:true },
  { code:'S03.00XA',description:'Dislokasi sendi temporomandibular',                        category:'Trauma Dental',              chapter:'S03',   billable:true },
  { code:'S09.90XA',description:'Cedera kepala / wajah tidak ditentukan',                    category:'Trauma Dental',              chapter:'S09',   billable:true },

  // ──────────────────────────────────────────────────────────
  // Z-CODES — FAKTOR YANG MEMPENGARUHI STATUS KESEHATAN
  // ──────────────────────────────────────────────────────────
  { code:'Z01.20', description:'Pemeriksaan gigi rutin tanpa temuan abnormal',               category:'Kunjungan Preventif & Kontrol', chapter:'Z01', billable:true },
  { code:'Z01.21', description:'Pemeriksaan gigi rutin dengan temuan abnormal',              category:'Kunjungan Preventif & Kontrol', chapter:'Z01', billable:true },
  { code:'Z13.84', description:'Skrining untuk penyakit gigi dan mulut',                    category:'Kunjungan Preventif & Kontrol', chapter:'Z13', billable:true },
  { code:'Z29.3',  description:'Profilaksis fluor (fluoride prophylaxis)',                   category:'Kunjungan Preventif & Kontrol', chapter:'Z29', billable:true },
  { code:'Z41.8',  description:'Prosedur lain untuk tujuan non-terapeutik (termasuk bleaching)', category:'Kunjungan Preventif & Kontrol', chapter:'Z41', billable:true },
  { code:'Z46.3',  description:'Pemasangan dan penyesuaian alat ortodontik',                category:'Kunjungan Preventif & Kontrol', chapter:'Z46', billable:true, notes:'Kontrol behel, pemasangan alat cekat/lepasan' },
  { code:'Z46.4',  description:'Pemasangan dan penyesuaian alat ortodontik gigi lainnya',   category:'Kunjungan Preventif & Kontrol', chapter:'Z46', billable:true },
  { code:'Z96.5',  description:'Adanya gigi palsu (dental implant status)',                  category:'Kunjungan Preventif & Kontrol', chapter:'Z96', billable:true },
  { code:'Z97.2',  description:'Adanya gigi tiruan (presence of dental prosthetic device)', category:'Kunjungan Preventif & Kontrol', chapter:'Z97', billable:true },

];

// ─── ICD-9-CM Dental Procedure Codes (Kemenkes) ──────────

export interface Icd9Item {
  code: string;
  description: string;
  category: string;
  billable: boolean;
}

export const ICD9_DENTAL: Icd9Item[] = [
  // Pemeriksaan
  { code:'89.31', description:'Pemeriksaan gigi (dental examination)',             category:'Pemeriksaan',   billable:true },
  { code:'89.39', description:'Pemeriksaan gigi dan mulut lainnya',               category:'Pemeriksaan',   billable:true },

  // Pencitraan
  { code:'87.11', description:'Radiografi intraoral (periapikal, bitewing)',       category:'Radiologi',     billable:true },
  { code:'87.12', description:'Radiografi panoramik (panoramik / OPG)',           category:'Radiologi',     billable:true },
  { code:'87.13', description:'Sefalometri / radiografi oblique mandibula',        category:'Radiologi',     billable:true },
  { code:'87.19', description:'Radiografi gigi dan mulut lainnya',                category:'Radiologi',     billable:true },

  // Ekstraksi
  { code:'23.01', description:'Ekstraksi gigi sulung (primary tooth extraction)',  category:'Ekstraksi',     billable:true },
  { code:'23.09', description:'Ekstraksi gigi permanen (permanent tooth extraction)', category:'Ekstraksi', billable:true },
  { code:'23.11', description:'Insisi periapikal dan drainase (I&D abses dental)', category:'Ekstraksi',    billable:true },
  { code:'23.19', description:'Prosedur insisi gigi dan tulang alveolar lainnya', category:'Ekstraksi',     billable:true },
  { code:'23.73', description:'Odontektomi — gigi impaksi tulnak / jaringan lunak', category:'Bedah Mulut', billable:true },
  { code:'23.74', description:'Odontektomi — gigi impaksi tulang (operkulektomi)', category:'Bedah Mulut',  billable:true },
  { code:'23.79', description:'Odontektomi lainnya',                               category:'Bedah Mulut',   billable:true },

  // Restorasi
  { code:'23.2',  description:'Restorasi gigi dengan tumpatan (amalgam/komposit)', category:'Restorasi',    billable:true },
  { code:'23.3',  description:'Restorasi inlay/onlay (inlay dental restoration)',  category:'Restorasi',     billable:true },
  { code:'23.41', description:'Pemasangan mahkota (dental crown)',                 category:'Restorasi',     billable:true },
  { code:'23.42', description:'Restorasi veneer / facet keramik/komposit',         category:'Restorasi',     billable:true },
  { code:'23.49', description:'Restorasi gigi lainnya',                            category:'Restorasi',     billable:true },

  // Endodontik (PSA)
  { code:'23.70', description:'Perawatan saluran akar (PSA) — pulpektomi total',   category:'Endodontik',   billable:true },
  { code:'23.71', description:'Pulpotomi (amputasi pulpa vital)',                   category:'Endodontik',   billable:true },
  { code:'23.72', description:'Apikoektomi / reseksi apikal',                       category:'Endodontik',   billable:true },

  // Periodontal
  { code:'96.54', description:'Scaling dan polishing gigi (dental scaling)',        category:'Periodontal',  billable:true },
  { code:'24.31', description:'Kuretase periodontal (subgingival curettage)',       category:'Periodontal',  billable:true },
  { code:'24.32', description:'Gingivektomi dan gingivoplasti',                     category:'Periodontal',  billable:true },
  { code:'24.33', description:'Bedah flap periodontal (flap operation)',            category:'Periodontal',  billable:true },
  { code:'24.34', description:'Cangkok mukogingival (mucosal graft)',              category:'Periodontal',   billable:true },

  // Bedah Mulut
  { code:'24.0',  description:'Alveolektomi (alveolectomy)',                        category:'Bedah Mulut',  billable:true },
  { code:'24.1',  description:'Alveoloplasti (alveoloplasty)',                      category:'Bedah Mulut',  billable:true },
  { code:'24.2',  description:'Operasi apikal dan periosteal (apicoectomy)',        category:'Bedah Mulut',  billable:true },
  { code:'24.4',  description:'Eksisi kista odontogenik (enukleasi kista)',         category:'Bedah Mulut',  billable:true },
  { code:'24.5',  description:'Operasi frenektomi (frenulektomi lingual/labial)',   category:'Bedah Mulut',  billable:true },
  { code:'24.6',  description:'Eksisi lesi jinak rongga mulut',                    category:'Bedah Mulut',   billable:true },
  { code:'24.91', description:'Splinting gigi (stabilisasi gigi traumatik)',       category:'Bedah Mulut',   billable:true },
  { code:'24.99', description:'Prosedur gigi dan gusi lainnya',                    category:'Bedah Mulut',   billable:true },

  // Prostodontik
  { code:'23.5',  description:'Implantasi gigi (dental implant placement)',         category:'Prostodontik', billable:true },
  { code:'23.6',  description:'Gigi tiruan sebagian lepasan (removable partial denture)', category:'Prostodontik', billable:true },
  { code:'23.61', description:'Gigi tiruan penuh lepasan (complete denture)',       category:'Prostodontik', billable:true },
  { code:'23.62', description:'Gigi tiruan jembatan (fixed partial denture/bridge)', category:'Prostodontik', billable:true },

  // Ortodonsi
  { code:'24.7',  description:'Pemasangan alat ortodontik cekat (fixed appliance)',category:'Ortodonsi',     billable:true },
  { code:'24.71', description:'Kontrol/adjustment alat ortodontik cekat',          category:'Ortodonsi',     billable:true },
  { code:'24.72', description:'Pemasangan alat ortodontik lepasan',                category:'Ortodonsi',     billable:true },
  { code:'24.73', description:'Pemasangan retainer ortodontik',                    category:'Ortodonsi',     billable:true },
  { code:'24.74', description:'Pelepasan alat ortodontik cekat (debonding)',       category:'Ortodonsi',     billable:true },

  // Estetik & Preventif
  { code:'96.53', description:'Aplikasi fluor topikal (fluoride application)',     category:'Preventif',     billable:true },
  { code:'96.55', description:'Aplikasi fissure sealant (pit and fissure sealant)', category:'Preventif',   billable:true },
  { code:'99.97', description:'Pemutihan gigi (dental bleaching / whitening)',     category:'Estetik',       billable:true },
];

// ─── Lookup helpers ───────────────────────────────────────

export function searchIcd10(query: string, limit = 30): Icd10Item[] {
  const q = query.toLowerCase().trim();
  if (!q) return ICD10_DENTAL.filter((i) => i.billable).slice(0, limit);
  return ICD10_DENTAL
    .filter(
      (i) =>
        i.code.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    )
    .slice(0, limit);
}

export function searchIcd9(query: string, limit = 30): Icd9Item[] {
  const q = query.toLowerCase().trim();
  if (!q) return ICD9_DENTAL.slice(0, limit);
  return ICD9_DENTAL
    .filter(
      (i) =>
        i.code.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q),
    )
    .slice(0, limit);
}

export const ICD10_CATEGORIES = [...new Set(ICD10_DENTAL.map((i) => i.category))];
export const ICD9_CATEGORIES  = [...new Set(ICD9_DENTAL.map((i) => i.category))];
