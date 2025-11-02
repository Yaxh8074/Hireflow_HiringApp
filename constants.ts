import { ServiceType } from './types';

export const PRICING: Record<ServiceType, number> = {
    [ServiceType.JOB_POST]: 25.00,
    [ServiceType.BACKGROUND_CHECK]: 15.00,
    [ServiceType.SUCCESSFUL_HIRE]: 250.00,
    [ServiceType.AI_SCREENING]: 2.00,
    [ServiceType.SKILL_ASSESSMENT]: 20.00,
    [ServiceType.VIDEO_INTERVIEW]: 10.00,
};
