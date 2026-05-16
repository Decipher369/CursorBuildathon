export type Business = {
  id: string;
  name: string;
  type: string;
  language?: string;
  hours?: string;
  faqs?: string | Record<string, string> | unknown;
  escalation_threshold?: string;
  twilio_phone_number?: string;
  agent_name?: string;
  persona?: string;
  escalation_phone?: string;
};

export type AppView = 'dashboard' | 'call-logs' | 'agent' | 'settings';
