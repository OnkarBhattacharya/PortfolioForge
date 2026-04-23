// Genkit dev server entry point.
// Flows are now plain async functions (not self-registering Genkit flows),
// so there is nothing to import here for registration purposes.
// getAi() initialises the Genkit instance on first call from a flow function.
import { getAi } from './genkit';
getAi(); // Eagerly init in dev so the Genkit UI can introspect the instance.
