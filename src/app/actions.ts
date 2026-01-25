'use server';

import { predictSlotAssignment } from '@/ai/flows/predictive-slot-assignment';
import type { PredictiveSlotAssignmentInput } from '@/ai/flows/predictive-slot-assignment';

export async function predictSlotAssignmentAction(input: PredictiveSlotAssignmentInput) {
  try {
    const result = await predictSlotAssignment(input);
    return result;
  } catch (error) {
    console.error('Error in predictSlotAssignmentAction:', error);
    return null;
  }
}
