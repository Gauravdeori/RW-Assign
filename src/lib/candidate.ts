import type { Candidate, Education } from '../types';

/** The highest degree: the one shown on result cards. Undefined when the CV lists no education. */
export const topEducation = (c: Candidate): Education | undefined => c.education[c.education.length - 1];
