/**
 * All AI prompts are centralized here.
 * Never put prompts in components or route handlers.
 */

export const PROMPTS = {
  matchScore: (cvText: string, jobDescription: string, requirements: string[]) => `
You are an expert recruiter and career advisor. Analyze the match between a candidate's CV and a job posting.

## CV
${cvText}

## Job Description
${jobDescription}

## Required Skills/Qualifications
${requirements.join("\n")}

## Task
Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "score": <integer 0-100>,
  "reasoning": "<2-3 sentences explaining the match score>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "gaps": ["<gap 1>", "<gap 2>"]
}

Scoring criteria:
- 90-100: Near-perfect match, candidate exceeds requirements
- 75-89: Strong match, minor gaps
- 60-74: Good match, some relevant experience missing
- 40-59: Partial match, significant gaps
- 0-39: Poor match
`,

  coverLetter: (
    cvText: string,
    jobTitle: string,
    company: string,
    jobDescription: string,
    userName: string
  ) => `
You are a professional career coach helping write a compelling, personalized cover letter in German.

## Candidate CV
${cvText}

## Target Position
Title: ${jobTitle}
Company: ${company}
Description: ${jobDescription}

## Candidate Name
${userName}

## Task
Write a professional cover letter in German (Sie-form) that:
1. Is personalized to the specific role and company
2. Highlights the most relevant experience from the CV
3. Shows genuine enthusiasm for the position
4. Is 3-4 paragraphs, professional tone
5. Does NOT use generic phrases like "hiermit bewerbe ich mich"

Return ONLY the cover letter text, no subject line, no date, no address block.
`,

  cvAnalysis: (cvText: string) => `
You are an expert recruiter. Analyze this CV and extract structured information.

## CV
${cvText}

Return ONLY a valid JSON object (no markdown) with this structure:
{
  "skills": ["skill1", "skill2"],
  "experienceYears": <number>,
  "currentRole": "<job title or null>",
  "education": "<highest education level>",
  "languages": [{"language": "German", "level": "Native"}],
  "summary": "<2-sentence professional summary>"
}
`,
} as const;
