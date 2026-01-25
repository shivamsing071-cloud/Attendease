'use server';

/**
 * @fileOverview An AI agent that suggests relevant subject names, types, and instructors based on the time slot and past entries.
 *
 * - predictSlotAssignment - A function that handles the prediction process.
 * - PredictiveSlotAssignmentInput - The input type for the predictSlotAssignment function.
 * - PredictiveSlotAssignmentOutput - The return type for the predictSlotAssignment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveSlotAssignmentInputSchema = z.object({
  day: z.string().describe('The day of the week for the time slot.'),
  startTime: z.string().describe('The start time of the time slot (e.g., 08:30).'),
  endTime: z.string().describe('The end time of the time slot (e.g., 09:30).'),
  pastEntries: z
    .string()
    .describe(
      'A string containing the user historical schedule entries, each entry separated by a newline character. Each entry includes day, start time, end time, subject, type, and instructor.'
    ),
});
export type PredictiveSlotAssignmentInput = z.infer<typeof PredictiveSlotAssignmentInputSchema>;

const PredictiveSlotAssignmentOutputSchema = z.object({
  subject: z.string().describe('The predicted subject name.'),
  type: z.enum(['Lecture', 'Lab']).describe('The predicted type of the slot.'),
});
export type PredictiveSlotAssignmentOutput = z.infer<typeof PredictiveSlotAssignmentOutputSchema>;

export async function predictSlotAssignment(
  input: PredictiveSlotAssignmentInput
): Promise<PredictiveSlotAssignmentOutput> {
  return predictSlotAssignmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictSlotAssignmentPrompt',
  input: {schema: PredictiveSlotAssignmentInputSchema},
  output: {schema: PredictiveSlotAssignmentOutputSchema},
  prompt: `You are an AI assistant designed to predict the most relevant subject, and type for a given time slot based on the user's past entries.

  Here are the details of the time slot:
  - Day: {{day}}
  - Start Time: {{startTime}}
  - End Time: {{endTime}}

  Here are the user's past entries:
  {{#if pastEntries}}
  {{pastEntries}}
  {{else}}
  The user has no past entries.
  {{/if}}

  Based on this information, predict the subject and type that the user is most likely to assign to this time slot. Respond with JSON format.`,
});

const predictSlotAssignmentFlow = ai.defineFlow(
  {
    name: 'predictSlotAssignmentFlow',
    inputSchema: PredictiveSlotAssignmentInputSchema,
    outputSchema: PredictiveSlotAssignmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
