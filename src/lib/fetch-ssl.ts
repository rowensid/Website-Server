import { Agent } from 'undici';

// Create a custom fetch agent that ignores SSL certificate errors
// WARNING: This is insecure and should only be used in development
export const createInsecureFetch = () => {
  const agent = new Agent({
    connect: {
      rejectUnauthorized: false
    }
  });

  return async (url: string, options: RequestInit = {}) => {
    // Add the agent to the fetch options
    const fetchOptions = {
      ...options,
      // @ts-ignore - undici agent is not in the default fetch types
      dispatcher: agent
    };

    return fetch(url, fetchOptions);
  };
};

// Export the insecure fetch function
export const insecureFetch = createInsecureFetch();