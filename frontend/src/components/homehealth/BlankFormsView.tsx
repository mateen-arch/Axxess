import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Printer,
  Download,
  FileText,
  FileCheck2,
  RefreshCw,
  X,
  Stethoscope,
  Activity,
  Heart,
  Users,
  Eye,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useHealthcare } from '../../context/HealthcareContext';

interface BlankFormsViewProps {
  onBack: () => void;
}

interface BlankFormItem {
  id: string;
  title: string;
  category: string;
  cmsCode?: string;
  url: string;
  description: string;
}

const BLANK_FORMS_DATA: { category: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }>; forms: BlankFormItem[] }[] = [
  {
    category: 'OASIS-E2 Forms',
    description: 'CMS Outcome and Assessment Information Set - Version E2 Effective 2025/2026',
    icon: Activity,
    forms: [
      {
        id: 'oe2-1',
        title: 'OASIS-E2 Patient Tracking',
        category: 'OASIS-E2 Forms',
        cmsCode: 'M0010-M0110',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=None&oasisRevision=OasisE2&fileName=patientTracking',
        description: 'Initial patient demographic, payment source, and clinical tracking sheet.',
      },
      {
        id: 'oe2-2',
        title: 'OASIS-E2 Start of Care (SN, PT, OT, ST)',
        category: 'OASIS-E2 Forms',
        cmsCode: 'CMS-SOC-E2',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=StartOfCare&oasisRevision=OasisE2',
        description: 'Comprehensive initial multidisciplinary start-of-care assessment.',
      },
      {
        id: 'oe2-3',
        title: 'OASIS-E2 Resumption of Care (SN, PT, OT, ST)',
        category: 'OASIS-E2 Forms',
        cmsCode: 'CMS-ROC-E2',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=ResumptionOfCare&oasisRevision=OasisE2',
        description: 'Comprehensive assessment upon return from an inpatient facility hold.',
      },
      {
        id: 'oe2-4',
        title: 'OASIS-E2 Recertification AND Follow-Up (SN, PT, OT, ST)',
        category: 'OASIS-E2 Forms',
        cmsCode: 'CMS-RECERT-E2',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=FollowUp&oasisRevision=OasisE2',
        description: 'Day 56-60 episode continuation and follow-up clinical evaluation.',
      },
      {
        id: 'oe2-5',
        title: 'OASIS-E2 Transfer (SN, PT, OT, ST)',
        category: 'OASIS-E2 Forms',
        cmsCode: 'CMS-TRANS-E2',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=TransferInPatientNotDischarged&oasisRevision=OasisE2',
        description: 'Assessment upon transfer to an acute care facility without agency discharge.',
      },
      {
        id: 'oe2-6',
        title: 'OASIS-E2 Death at Home (SN, PT, OT, ST)',
        category: 'OASIS-E2 Forms',
        cmsCode: 'CMS-DEATH-E2',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=DischargeFromAgencyDeath&oasisRevision=OasisE2',
        description: 'Agency discharge documentation following patient expiration in the community.',
      },
      {
        id: 'oe2-7',
        title: 'OASIS-E2 Discharge (SN, PT, OT, ST)',
        category: 'OASIS-E2 Forms',
        cmsCode: 'CMS-DISCH-E2',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=DischargeFromAgency&oasisRevision=OasisE2',
        description: 'Discharge from agency with goals achieved or transferred to hospice/outpatient.',
      },
    ],
  },
  {
    category: 'OASIS-E1 Forms',
    description: 'CMS Outcome and Assessment Information Set - Version E1 Reference Forms',
    icon: Activity,
    forms: [
      {
        id: 'oe1-1',
        title: 'OASIS-E1 Patient Tracking',
        category: 'OASIS-E1 Forms',
        cmsCode: 'M0010-M0104-E1',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=None&oasisRevision=OasisE1&fileName=patientTracking',
        description: 'Standard E1 revision patient identifier and episode tracking schedule.',
      },
      {
        id: 'oe1-2',
        title: 'OASIS-E1 Start of Care (SN, PT, OT, ST)',
        category: 'OASIS-E1 Forms',
        cmsCode: 'CMS-SOC-E1',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=StartOfCare&oasisRevision=OasisE1',
        description: 'E1 baseline comprehensive clinical, cognitive, and functional status assessment.',
      },
      {
        id: 'oe1-3',
        title: 'OASIS-E1 Resumption of Care (SN, PT, OT, ST)',
        category: 'OASIS-E1 Forms',
        cmsCode: 'CMS-ROC-E1',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=ResumptionOfCare&oasisRevision=OasisE1',
        description: 'E1 post-inpatient stay evaluation and functional scoring.',
      },
      {
        id: 'oe1-4',
        title: 'OASIS-E1 Recertification AND Follow-Up (SN, PT, OT, ST)',
        category: 'OASIS-E1 Forms',
        cmsCode: 'CMS-FU-E1',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=FollowUp&oasisRevision=OasisE1',
        description: 'E1 60-day recertification evaluation and goal review.',
      },
      {
        id: 'oe1-5',
        title: 'OASIS-E1 Transfer (SN, PT, OT, ST)',
        category: 'OASIS-E1 Forms',
        cmsCode: 'CMS-TRANS-E1',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=TransferInPatientNotDischarged&oasisRevision=OasisE1',
        description: 'E1 transfer documentation to acute/subacute inpatient facility.',
      },
      {
        id: 'oe1-6',
        title: 'OASIS-E1 Death at Home (SN, PT, OT, ST)',
        category: 'OASIS-E1 Forms',
        cmsCode: 'CMS-DEATH-E1',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=DischargeFromAgencyDeath&oasisRevision=OasisE1',
        description: 'E1 agency closure due to death at home prior to formal discharge.',
      },
      {
        id: 'oe1-7',
        title: 'OASIS-E1 Discharge (SN, PT, OT, ST)',
        category: 'OASIS-E1 Forms',
        cmsCode: 'CMS-DISCH-E1',
        url: 'https://agencycore7.axxessweb.com/Oasis/OasisBlankForm?type=DischargeFromAgency&oasisRevision=OasisE1',
        description: 'E1 end-of-episode discharge summary and quality indicator review.',
      },
    ],
  },
  {
    category: 'Physician Forms',
    description: 'CMS Certification, Face-to-Face & Attending Physician Orders',
    icon: Stethoscope,
    forms: [
      {
        id: 'phy-f2f',
        title: 'Face-to-Face Encounter',
        category: 'Physician Forms',
        cmsCode: 'CMS-F2F',
        url: 'https://agencycore7.axxessweb.com/Patient/ViewFaceToFaceEncounterPdfBlank',
        description: 'Certification that face-to-face physician encounter occurred within required timeframes.',
      },
      {
        id: 'phy-485',
        title: '485/POC',
        category: 'Physician Forms',
        cmsCode: 'CMS-485',
        url: 'https://agencycore7.axxessweb.com/Oasis/PlanOfCarePdfBlank',
        description: 'Home Health Certification and Plan of Care (CMS-485) blank printable document.',
      },
      {
        id: 'phy-order',
        title: 'Physician Order',
        category: 'Physician Forms',
        cmsCode: 'MED-ORD-01',
        url: 'https://agencycore7.axxessweb.com/Patient/PhysicianOrderPdfBlank',
        description: 'Interim clinical, therapeutic, and medication modification orders.',
      },
    ],
  },
  {
    category: 'Nursing Forms',
    description: 'Skilled Nursing Assessments, Summaries & Specialized Visits',
    icon: Heart,
    forms: [
      {
        id: 'nur-1',
        title: 'Transfer Summary',
        category: 'Nursing Forms',
        cmsCode: 'NUR-TRANS',
        url: 'https://agencycore7.axxessweb.com/Schedule/TransferSummaryPdfBlank',
        description: 'Clinical handoff summary for hospital or rehabilitation transfer.',
      },
      {
        id: 'nur-2',
        title: 'Coordination of Care',
        category: 'Nursing Forms',
        cmsCode: 'NUR-COORD',
        url: 'https://agencycore7.axxessweb.com/Schedule/CoordinationOfCarePdfBlank',
        description: 'Interdisciplinary care team and family communication documentation.',
      },
      {
        id: 'nur-3',
        title: '60 Day Summary',
        category: 'Nursing Forms',
        cmsCode: 'NUR-60D',
        url: 'https://agencycore7.axxessweb.com/Schedule/SixtyDaySummaryPdfBlank',
        description: 'Comprehensive 60-day episode review for attending physician signature.',
      },
      {
        id: 'nur-4',
        title: 'Missed Visit Form',
        category: 'Nursing Forms',
        cmsCode: 'NUR-MISS',
        url: 'https://agencycore7.axxessweb.com/Schedule/MissedVisitPdfBlank',
        description: 'Clinician documentation of missed skilled nursing appointment and corrective plan.',
      },
      {
        id: 'nur-5',
        title: 'Skilled Nurse Psych Visit',
        category: 'Nursing Forms',
        cmsCode: 'SN-PSYCH-V',
        url: 'https://agencycore7.axxessweb.com/Schedule/SNPsychVisitPdfBlank',
        description: 'Psychiatric nursing routine visit note with mental status examination.',
      },
      {
        id: 'nur-6',
        title: 'Skilled Nurse Pediatric Visit',
        category: 'Nursing Forms',
        cmsCode: 'SN-PED-V',
        url: 'https://agencycore7.axxessweb.com/Schedule/SNPediatricVisitPdfBlank',
        description: 'Pediatric skilled nursing clinical visit flow sheet.',
      },
      {
        id: 'nur-7',
        title: 'LVN Supervisory Visit',
        category: 'Nursing Forms',
        cmsCode: 'LVN-SUP',
        url: 'https://agencycore7.axxessweb.com/Schedule/LVNSVisitPdfBlank',
        description: 'RN 30-day supervisory evaluation of Licensed Vocational / Practical Nurse.',
      },
      {
        id: 'nur-8',
        title: 'SN Discharge Summary',
        category: 'Nursing Forms',
        cmsCode: 'SN-DISCH',
        url: 'https://agencycore7.axxessweb.com/Schedule/DischargeSummaryPdfBlank',
        description: 'Final skilled nursing outcome report and instructions provided.',
      },
      {
        id: 'nur-9',
        title: 'Skilled Nurse Visit',
        category: 'Nursing Forms',
        cmsCode: 'SN-VISIT',
        url: 'https://agencycore7.axxessweb.com/Schedule/SNVisitPdfBlank',
        description: 'Universal skilled nurse visit flow sheet (vitals, systems, interventions).',
      },
      {
        id: 'nur-10',
        title: 'Wound Care',
        category: 'Nursing Forms',
        cmsCode: 'SN-WOUND',
        url: 'https://agencycore7.axxessweb.com/Schedule/WoundCarePdfBlank',
        description: 'Pressure injury and surgical incision measurement and dressing evaluation.',
      },
      {
        id: 'nur-11',
        title: 'Skilled Nurse Psych Assessment',
        category: 'Nursing Forms',
        cmsCode: 'SN-PSYCH-A',
        url: 'https://agencycore7.axxessweb.com/Schedule/SNPsychAssessmentPdfBlank',
        description: 'Comprehensive initial psychiatric skilled nurse assessment.',
      },
      {
        id: 'nur-12',
        title: 'Skilled Nurse Pediatric Assessment',
        category: 'Nursing Forms',
        cmsCode: 'SN-PED-A',
        url: 'https://agencycore7.axxessweb.com/Schedule/SNPediatricAssessmentPdfBlank',
        description: 'Comprehensive neonatal and adolescent pediatric health evaluation.',
      },
    ],
  },
  {
    category: 'Home Health Aide Forms',
    description: 'Personal Care, Homemaker & Unlicensed Assistive Personnel Documentation',
    icon: Users,
    forms: [
      {
        id: 'hha-1',
        title: 'HHA Care Plan',
        category: 'Home Health Aide Forms',
        cmsCode: 'HHA-PLAN',
        url: 'https://agencycore7.axxessweb.com/Schedule/HHACarePlanPdfBlank',
        description: 'RN-directed aide assignment sheet (ADLs, IADLs, safety precautions).',
      },
      {
        id: 'hha-2',
        title: 'HHA Visit Note',
        category: 'Home Health Aide Forms',
        cmsCode: 'HHA-VISIT',
        url: 'https://agencycore7.axxessweb.com/Schedule/HHAideVisitBlank',
        description: 'Home health aide daily task completion and vital signs verification note.',
      },
      {
        id: 'hha-3',
        title: 'HHA Supervisory Visit',
        category: 'Home Health Aide Forms',
        cmsCode: 'HHA-SUP',
        url: 'https://agencycore7.axxessweb.com/Schedule/HHASVisitPdfBlank',
        description: 'Mandated 14-day RN/Therapist supervisory evaluation of home health aide.',
      },
      {
        id: 'hha-4',
        title: 'Home Maker Note',
        category: 'Home Health Aide Forms',
        cmsCode: 'HM-NOTE',
        url: 'https://agencycore7.axxessweb.com/Schedule/HomeMakerNotePdfBlank',
        description: 'Light housekeeping, meal preparation, and environment maintenance log.',
      },
      {
        id: 'hha-5',
        title: 'PAS Care Plan',
        category: 'Home Health Aide Forms',
        cmsCode: 'PAS-PLAN',
        url: 'https://agencycore7.axxessweb.com/Schedule/PASCarePlanBlank',
        description: 'Personal Assistance Services customized support plan.',
      },
      {
        id: 'hha-6',
        title: 'PAS Note',
        category: 'Home Health Aide Forms',
        cmsCode: 'PAS-NOTE',
        url: 'https://agencycore7.axxessweb.com/Schedule/PASVisitBlank',
        description: 'Personal attendant daily service shift documentation.',
      },
      {
        id: 'hha-7',
        title: 'PAS Travel Note',
        category: 'Home Health Aide Forms',
        cmsCode: 'PAS-TRAVEL',
        url: 'https://agencycore7.axxessweb.com/Schedule/PASTravelBlank',
        description: 'Community escort and attendant mileage/travel documentation.',
      },
      {
        id: 'hha-8',
        title: 'UAP Wound Care Visit',
        category: 'Home Health Aide Forms',
        cmsCode: 'UAP-WOUND',
        url: 'https://agencycore7.axxessweb.com/Schedule/UAPWoundCareVisitBlank',
        description: 'Delegated assistive task flow sheet for non-complex topical care.',
      },
      {
        id: 'hha-9',
        title: 'UAP Insulin Prep/Admin Visit',
        category: 'Home Health Aide Forms',
        cmsCode: 'UAP-INS',
        url: 'https://agencycore7.axxessweb.com/Schedule/UAPInsulinPrepAdminVisitBlank',
        description: 'RN-delegated insulin prep reminder and blood sugar observation log.',
      },
    ],
  },
  {
    category: 'Medical Social Work Forms',
    description: 'Psychosocial Assessments, Community Resource & Driver Logs',
    icon: Users,
    forms: [
      {
        id: 'msw-1',
        title: 'MSW Evaluation',
        category: 'Medical Social Work Forms',
        cmsCode: 'MSW-EVAL',
        url: 'https://agencycore7.axxessweb.com/Schedule/MSWEvaluationAssessmentBlank',
        description: 'Comprehensive psychosocial evaluation and family coping assessment.',
      },
      {
        id: 'msw-2',
        title: 'MSW Progress Note',
        category: 'Medical Social Work Forms',
        cmsCode: 'MSW-PROG',
        url: 'https://agencycore7.axxessweb.com/Schedule/MSWProgressNotePdfBlank',
        description: 'Interim casework documentation and counseling intervention note.',
      },
      {
        id: 'msw-3',
        title: 'MSW Visit',
        category: 'Medical Social Work Forms',
        cmsCode: 'MSW-VISIT',
        url: 'https://agencycore7.axxessweb.com/Schedule/MSWVisitPdfBlank',
        description: 'Routine medical social worker home consultation and resource delivery.',
      },
      {
        id: 'msw-4',
        title: 'MSW Assessment',
        category: 'Medical Social Work Forms',
        cmsCode: 'MSW-ASSESS',
        url: 'https://agencycore7.axxessweb.com/Schedule/MSWAssessmentPdfBlank',
        description: 'Financial, community support, and environmental barrier assessment.',
      },
      {
        id: 'msw-5',
        title: 'MSW Discharge',
        category: 'Medical Social Work Forms',
        cmsCode: 'MSW-DISCH',
        url: 'https://agencycore7.axxessweb.com/Schedule/MSWDischargePdfBlank',
        description: 'Case closure summary and ongoing community referrals roster.',
      },
      {
        id: 'msw-6',
        title: 'Driver/Transportation Log',
        category: 'Medical Social Work Forms',
        cmsCode: 'TRAN-LOG',
        url: 'https://agencycore7.axxessweb.com/Schedule/TransportationNotePdfBlank',
        description: 'Non-emergency medical transportation and driver route verification sheet.',
      },
    ],
  },
  {
    category: 'Therapy Forms',
    description: 'Physical Therapy (PT), Occupational Therapy (OT) & Speech Therapy (ST)',
    icon: Activity,
    forms: [
      {
        id: 'pt-1',
        title: 'PT Discharge',
        category: 'Therapy Forms',
        cmsCode: 'PT-DISCH',
        url: 'https://agencycore7.axxessweb.com/Schedule/PTDischargeBlank',
        description: 'Physical therapy formal episode discharge and functional progress score.',
      },
      {
        id: 'pt-2',
        title: 'PT Evaluation',
        category: 'Therapy Forms',
        cmsCode: 'PT-EVAL',
        url: 'https://agencycore7.axxessweb.com/Schedule/PTEvaluationBlank',
        description: 'Comprehensive initial PT mobility, gait, balance, and strength exam.',
      },
      {
        id: 'pt-3',
        title: 'PT Re-Evaluation',
        category: 'Therapy Forms',
        cmsCode: 'PT-REEVAL',
        url: 'https://agencycore7.axxessweb.com/Schedule/PTReEvaluationBlank',
        description: 'Mid-episode physical therapy re-examination and objective goal updates.',
      },
      {
        id: 'pt-4',
        title: 'PT Maintenance',
        category: 'Therapy Forms',
        cmsCode: 'PT-MAINT',
        url: 'https://agencycore7.axxessweb.com/Schedule/PTMaintenanceBlank',
        description: 'Skilled maintenance physical therapy plan of care documentation.',
      },
      {
        id: 'pt-5',
        title: 'PT Visit',
        category: 'Therapy Forms',
        cmsCode: 'PT-VISIT',
        url: 'https://agencycore7.axxessweb.com/Schedule/PTVisitBlank',
        description: 'Routine physical therapy session flow sheet and exercise metrics.',
      },
      {
        id: 'pt-6',
        title: 'PT Reassessment',
        category: 'Therapy Forms',
        cmsCode: 'PT-REASS',
        url: 'https://agencycore7.axxessweb.com/Schedule/PTReassessmentBlank',
        description: 'Periodic reassessment required for ongoing Medicare coverage.',
      },
      {
        id: 'pt-7',
        title: 'PT Discharge Summary',
        category: 'Therapy Forms',
        cmsCode: 'PT-SUMM',
        url: 'https://agencycore7.axxessweb.com/Schedule/PTDischargeSummaryPdfBlank',
        description: 'Complete physical therapy episode closure summary for physician review.',
      },
      {
        id: 'pt-8',
        title: 'PTA Visit',
        category: 'Therapy Forms',
        cmsCode: 'PTA-VISIT',
        url: 'https://agencycore7.axxessweb.com/Schedule/PTAVisitBlank',
        description: 'Physical Therapist Assistant treatment note under PT supervision.',
      },
      {
        id: 'ot-1',
        title: 'OT Evaluation',
        category: 'Therapy Forms',
        cmsCode: 'OT-EVAL',
        url: 'https://agencycore7.axxessweb.com/Schedule/OTEvaluationBlank',
        description: 'Comprehensive occupational therapy assessment of daily living skills.',
      },
      {
        id: 'ot-2',
        title: 'OT Re-Evaluation',
        category: 'Therapy Forms',
        cmsCode: 'OT-REEVAL',
        url: 'https://agencycore7.axxessweb.com/Schedule/OTReEvaluationBlank',
        description: 'Mid-episode occupational therapy re-evaluation of fine motor function.',
      },
      {
        id: 'ot-3',
        title: 'OT Discharge',
        category: 'Therapy Forms',
        cmsCode: 'OT-DISCH',
        url: 'https://agencycore7.axxessweb.com/Schedule/OTDischargeBlank',
        description: 'Occupational therapy formal discharge notice and home exercise guide.',
      },
      {
        id: 'ot-4',
        title: 'OT Discharge Summary',
        category: 'Therapy Forms',
        cmsCode: 'OT-SUMM',
        url: 'https://agencycore7.axxessweb.com/Schedule/OTDischargeSummaryPdfBlank',
        description: 'Comprehensive occupational therapy discharge summary report.',
      },
      {
        id: 'ot-5',
        title: 'OT Maintenance',
        category: 'Therapy Forms',
        cmsCode: 'OT-MAINT',
        url: 'https://agencycore7.axxessweb.com/Schedule/OTMaintenanceBlank',
        description: 'Skilled OT maintenance therapy documentation.',
      },
      {
        id: 'ot-6',
        title: 'OT Visit',
        category: 'Therapy Forms',
        cmsCode: 'OT-VISIT',
        url: 'https://agencycore7.axxessweb.com/Schedule/OTVisitBlank',
        description: 'Routine occupational therapy adaptive equipment and self-care note.',
      },
      {
        id: 'ot-7',
        title: 'OT Reassessment',
        category: 'Therapy Forms',
        cmsCode: 'OT-REASS',
        url: 'https://agencycore7.axxessweb.com/Schedule/OTReassessmentBlank',
        description: '30-day periodic occupational therapy progress verification.',
      },
      {
        id: 'ot-8',
        title: 'COTA Visit',
        category: 'Therapy Forms',
        cmsCode: 'COTA-VISIT',
        url: 'https://agencycore7.axxessweb.com/Schedule/COTAVisitBlank',
        description: 'Certified Occupational Therapy Assistant treatment session record.',
      },
      {
        id: 'st-1',
        title: 'ST Evaluation',
        category: 'Therapy Forms',
        cmsCode: 'ST-EVAL',
        url: 'https://agencycore7.axxessweb.com/Schedule/STEvaluationBlank',
        description: 'Speech-Language Pathology comprehensive communication & swallow exam.',
      },
      {
        id: 'st-2',
        title: 'ST Re-Evaluation',
        category: 'Therapy Forms',
        cmsCode: 'ST-REEVAL',
        url: 'https://agencycore7.axxessweb.com/Schedule/STReEvaluationBlank',
        description: 'Speech therapy progress reassessment and dietary swallow update.',
      },
      {
        id: 'st-3',
        title: 'ST Reassessment',
        category: 'Therapy Forms',
        cmsCode: 'ST-REASS',
        url: 'https://agencycore7.axxessweb.com/Schedule/STReassessmentBlank',
        description: 'Periodic functional communication measurement.',
      },
      {
        id: 'st-4',
        title: 'ST Maintenance',
        category: 'Therapy Forms',
        cmsCode: 'ST-MAINT',
        url: 'https://agencycore7.axxessweb.com/Schedule/STMaintenanceBlank',
        description: 'Skilled speech maintenance plan of care note.',
      },
      {
        id: 'st-5',
        title: 'ST Discharge',
        category: 'Therapy Forms',
        cmsCode: 'ST-DISCH',
        url: 'https://agencycore7.axxessweb.com/Schedule/STDischargeBlank',
        description: 'Speech-language pathology formal discharge and swallow recommendations.',
      },
      {
        id: 'st-6',
        title: 'ST Visit',
        category: 'Therapy Forms',
        cmsCode: 'ST-VISIT',
        url: 'https://agencycore7.axxessweb.com/Schedule/STVisitBlank',
        description: 'Routine speech therapy session flow sheet and cognitive exercises.',
      },
      {
        id: 'st-7',
        title: 'ST Discharge Summary',
        category: 'Therapy Forms',
        cmsCode: 'ST-SUMM',
        url: 'https://agencycore7.axxessweb.com/Schedule/STDischargeSummaryPdfBlank',
        description: 'Final speech therapy summary and physician communication report.',
      },
    ],
  },
];

export const BlankFormsView: React.FC<BlankFormsViewProps> = ({ onBack }) => {
  const { organization } = useHealthcare();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewForm, setPreviewForm] = useState<BlankFormItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categories = useMemo(() => {
    return ['All', ...BLANK_FORMS_DATA.map((c) => c.category)];
  }, []);

  const totalFormsCount = useMemo(() => {
    return BLANK_FORMS_DATA.reduce((acc, c) => acc + c.forms.length, 0);
  }, []);

  // Filtered categories and their forms
  const filteredData = useMemo(() => {
    return BLANK_FORMS_DATA.map((cat) => {
      if (selectedCategory !== 'All' && cat.category !== selectedCategory) {
        return { ...cat, forms: [] };
      }
      if (!searchQuery.trim()) {
        return cat;
      }
      const q = searchQuery.toLowerCase();
      const matchingForms = cat.forms.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          (f.cmsCode && f.cmsCode.toLowerCase().includes(q))
      );
      return { ...cat, forms: matchingForms };
    }).filter((cat) => cat.forms.length > 0);
  }, [searchQuery, selectedCategory]);

  const handlePrintForm = (form: BlankFormItem) => {
    showToast(`Preparing blank PDF for "${form.title}"...`);
    setTimeout(() => {
      window.print();
    }, 600);
  };

  const handleDownloadPdf = (form: BlankFormItem) => {
    showToast(`Downloading blank "${form.title}" PDF...`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-pearl-100 font-sans text-slate-900 transition-colors dark:bg-charcoal-900 dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-600 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Contextual Header Strip */}
      <div className="flex min-h-[56px] shrink-0 items-center justify-between gap-3 border-b border-pearl-200/90 bg-white/80 px-4 py-2.5 backdrop-blur-xl dark:border-charcoal-700/80 dark:bg-charcoal-900/80 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-pearl-200 bg-pearl-50 text-slate-600 shadow-2xs transition hover:border-rose-300 hover:text-rose-700 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 cursor-pointer"
            title="Return to Dashboard"
            aria-label="Return to Dashboard"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Axxess Home Health
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                View
              </span>
              <span className="font-light text-slate-300 dark:text-charcoal-600">/</span>
              <span className="truncate text-xs font-black text-slate-950 dark:text-white">
                Blank Forms
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Clinical Documentation & CMS Assessment Forms Catalog
              </span>
              <span>•</span>
              <span className="truncate">{organization.name}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => showToast('Blank forms directory refreshed.')}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-8 items-center gap-1.5 rounded-xl border border-pearl-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-pearl-300 dark:border-charcoal-700 dark:bg-charcoal-800 dark:text-slate-200 cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Catalog</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4">
        {/* Single Row Filter & Actions Bar */}
        <div className="rounded-2xl border border-pearl-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Left Filter: Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-rose-700 text-white shadow-2xs'
                      : 'border border-pearl-300 bg-white text-slate-700 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right Actions */}
            <div className="ml-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  showToast('Generated complete multidisciplinary blank admission packet.');
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 px-3.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Admission Packet
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar - Separate compact row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search blank forms by title, CMS code, discipline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full rounded-xl border border-pearl-300 bg-white pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 shadow-2xs focus:border-rose-500 focus:outline-none dark:border-charcoal-600 dark:bg-charcoal-750 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {totalFormsCount} blank printable forms in agency library
          </div>
        </div>

        {/* Blank Forms Categories List matching Screenshot media_1794160933326_d2bc85e7.png */}
        <div className="space-y-4">
          {filteredData.length === 0 ? (
            <div className="rounded-2xl border border-pearl-200 bg-white p-12 text-center text-slate-400 dark:border-charcoal-700 dark:bg-charcoal-800">
              No blank clinical forms found matching "{searchQuery}".
            </div>
          ) : (
            filteredData.map((categoryGroup) => {
              const Icon = categoryGroup.icon;

              // Split forms into 2 columns matching the authentic screenshot layout
              const halfIndex = Math.ceil(categoryGroup.forms.length / 2);
              const leftCol = categoryGroup.forms.slice(0, halfIndex);
              const rightCol = categoryGroup.forms.slice(halfIndex);

              return (
                <div
                  key={categoryGroup.category}
                  className="overflow-hidden rounded-2xl border border-pearl-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-charcoal-700/80 dark:bg-charcoal-800/95"
                >
                  {/* Category Header Bar */}
                  <div className="flex items-center justify-between border-b border-pearl-200/80 bg-pearl-50/70 px-5 py-3 dark:border-charcoal-700 dark:bg-charcoal-750">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                        <Icon size={14} />
                      </div>
                      <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        {categoryGroup.category}
                      </h2>
                    </div>
                    <span className="rounded-full bg-pearl-200/70 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-charcoal-700 dark:text-slate-300">
                      {categoryGroup.forms.length} forms
                    </span>
                  </div>

                  {/* 2-Column Links Grid matching the screenshot */}
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-pearl-150 p-2 sm:p-4 dark:divide-charcoal-700">
                    {/* Left Column */}
                    <div className="divide-y divide-dashed divide-pearl-200/90 px-3 sm:px-4 dark:divide-charcoal-700">
                      {leftCol.map((form) => (
                        <div
                          key={form.id}
                          className="group flex items-center justify-between py-2.5 transition hover:bg-rose-50/40 dark:hover:bg-rose-950/20 px-2 rounded-lg"
                        >
                          <button
                            type="button"
                            onClick={() => setPreviewForm(form)}
                            className="text-left text-xs font-semibold text-rose-700 hover:text-rose-800 hover:underline dark:text-rose-400 cursor-pointer"
                          >
                            {form.title}
                          </button>

                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              title="Preview Blank Form"
                              onClick={() => setPreviewForm(form)}
                              className="rounded p-1 text-slate-500 hover:bg-pearl-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-charcoal-700 cursor-pointer"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              type="button"
                              title="Print Blank Form"
                              onClick={() => handlePrintForm(form)}
                              className="rounded p-1 text-slate-500 hover:bg-pearl-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-charcoal-700 cursor-pointer"
                            >
                              <Printer size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Column */}
                    <div className="divide-y divide-dashed divide-pearl-200/90 px-3 sm:px-4 dark:divide-charcoal-700">
                      {rightCol.map((form) => (
                        <div
                          key={form.id}
                          className="group flex items-center justify-between py-2.5 transition hover:bg-rose-50/40 dark:hover:bg-rose-950/20 px-2 rounded-lg"
                        >
                          <button
                            type="button"
                            onClick={() => setPreviewForm(form)}
                            className="text-left text-xs font-semibold text-rose-700 hover:text-rose-800 hover:underline dark:text-rose-400 cursor-pointer"
                          >
                            {form.title}
                          </button>

                          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                            <button
                              type="button"
                              title="Preview Blank Form"
                              onClick={() => setPreviewForm(form)}
                              className="rounded p-1 text-slate-500 hover:bg-pearl-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-charcoal-700 cursor-pointer"
                            >
                              <Eye size={13} />
                            </button>
                            <button
                              type="button"
                              title="Print Blank Form"
                              onClick={() => handlePrintForm(form)}
                              className="rounded p-1 text-slate-500 hover:bg-pearl-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-charcoal-700 cursor-pointer"
                            >
                              <Printer size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Blank Form Preview Modal */}
      {previewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-pearl-200 bg-white shadow-2xl dark:border-charcoal-700 dark:bg-charcoal-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-pearl-200 bg-rose-700 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-white" />
                <div>
                  <h3 className="text-sm font-bold">{previewForm.title}</h3>
                  <p className="text-[11px] text-white/80">
                    {previewForm.category} {previewForm.cmsCode && `• CMS Code: ${previewForm.cmsCode}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewForm(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Simulated Blank Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-charcoal-800">
              {/* Form Agency Header */}
              <div className="flex items-center justify-between border-b border-pearl-300 pb-4 dark:border-charcoal-600">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase">
                    {organization.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Home Health Agency Service Line • Agency Phone: (857) 707-0949
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                    {previewForm.cmsCode || 'STANDARD FORM'}
                  </span>
                  <p className="text-[10px] text-slate-400">Blank Clinical Work Paper</p>
                </div>
              </div>

              {/* Blank Patient Demographics Box */}
              <div className="rounded-xl border border-pearl-300 p-4 space-y-3 dark:border-charcoal-600 bg-pearl-50/40 dark:bg-charcoal-750/40">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Patient & Episode Identification
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold">PATIENT NAME:</span>
                    <div className="mt-1 h-7 border-b border-slate-300 dark:border-charcoal-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold">MRN:</span>
                    <div className="mt-1 h-7 border-b border-slate-300 dark:border-charcoal-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold">DATE OF BIRTH:</span>
                    <div className="mt-1 h-7 border-b border-slate-300 dark:border-charcoal-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 font-semibold">VISIT DATE / TIME:</span>
                    <div className="mt-1 h-7 border-b border-slate-300 dark:border-charcoal-500" />
                  </div>
                </div>
              </div>

              {/* Blank Clinical Assessment Box */}
              <div className="rounded-xl border border-pearl-300 p-4 space-y-3 dark:border-charcoal-600">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Vital Signs & Clinical Evaluation
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                  <div className="border border-pearl-200 p-2 rounded-lg dark:border-charcoal-600">
                    <span className="text-[10px] text-slate-400 font-bold">BP (Sys/Dia)</span>
                    <div className="mt-2 text-slate-300">____ / ____</div>
                  </div>
                  <div className="border border-pearl-200 p-2 rounded-lg dark:border-charcoal-600">
                    <span className="text-[10px] text-slate-400 font-bold">Heart Rate</span>
                    <div className="mt-2 text-slate-300">____ bpm</div>
                  </div>
                  <div className="border border-pearl-200 p-2 rounded-lg dark:border-charcoal-600">
                    <span className="text-[10px] text-slate-400 font-bold">Resp. Rate</span>
                    <div className="mt-2 text-slate-300">____ /min</div>
                  </div>
                  <div className="border border-pearl-200 p-2 rounded-lg dark:border-charcoal-600">
                    <span className="text-[10px] text-slate-400 font-bold">O2 Sat</span>
                    <div className="mt-2 text-slate-300">____ %</div>
                  </div>
                  <div className="border border-pearl-200 p-2 rounded-lg dark:border-charcoal-600">
                    <span className="text-[10px] text-slate-400 font-bold">Temp (°F)</span>
                    <div className="mt-2 text-slate-300">____ °F</div>
                  </div>
                  <div className="border border-pearl-200 p-2 rounded-lg dark:border-charcoal-600">
                    <span className="text-[10px] text-slate-400 font-bold">Pain (0-10)</span>
                    <div className="mt-2 text-slate-300">____ / 10</div>
                  </div>
                </div>
              </div>

              {/* Blank Narrative & Clinical Notes */}
              <div className="rounded-xl border border-pearl-300 p-4 space-y-3 dark:border-charcoal-600">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Clinical Narrative / Interventions / Patient Response
                </div>
                <div className="space-y-4 pt-1">
                  <div className="h-6 border-b border-slate-200 dark:border-charcoal-700" />
                  <div className="h-6 border-b border-slate-200 dark:border-charcoal-700" />
                  <div className="h-6 border-b border-slate-200 dark:border-charcoal-700" />
                  <div className="h-6 border-b border-slate-200 dark:border-charcoal-700" />
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-pearl-200 dark:border-charcoal-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Clinician Signature:</span>
                  <div className="mt-4 border-b border-slate-400" />
                  <span className="text-[10px] text-slate-400 mt-1 block">Credentials & Date</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Physician Signature (if required):</span>
                  <div className="mt-4 border-b border-slate-400" />
                  <span className="text-[10px] text-slate-400 mt-1 block">Attending Physician & Date</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between border-t border-pearl-200 bg-pearl-50 px-6 py-3 dark:border-charcoal-700 dark:bg-charcoal-850">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Ready for offline completion or blank charting backup.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewForm(null)}
                  className="rounded-xl border border-pearl-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-pearl-100 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-slate-200 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintForm(previewForm)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-800 transition active:scale-95 cursor-pointer"
                >
                  <Printer size={13} />
                  Print Blank Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

