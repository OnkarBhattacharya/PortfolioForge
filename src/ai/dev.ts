'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-powered-content-suggestions.ts';
import '@/ai/flows/cv-parser.ts';
import '@/ai/flows/github-importer.ts';
import '@/ai/flows/linkedin-parser.ts';
