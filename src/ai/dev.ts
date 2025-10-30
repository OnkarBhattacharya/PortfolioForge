
'use server';
import {config} from 'dotenv';
config();

import './flows/ai-powered-content-suggestions.ts';
import './flows/cv-parser.ts';
import './flows/github-importer.ts';
import './flows/linkedin-parser.ts';
import './flows/web-importer.ts';

export {cvParserFlow} from './flows/cv-parser';
