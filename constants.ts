
import { ServiceType } from './types';

export const PRICING: Record<ServiceType, number> = {
    [ServiceType.JOB_POST]: 50.00,
    [ServiceType.BACKGROUND_CHECK]: 25.00,
    [ServiceType.SUCCESSFUL_HIRE]: 500.00,
    [ServiceType.AI_SCREENING]: 5.00,
    [ServiceType.SKILL_ASSESSMENT]: 35.00,
    [ServiceType.VIDEO_INTERVIEW]: 15.00,
};
