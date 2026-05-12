import OpenAI from 'openai';

export interface AiGeneratorInput {
  prompt: string;
  type: 'article' | 'social' | 'product';
  tone?: 'professional' | 'casual' | 'creative' | 'persuasive';
  length?: 'short' | 'medium' | 'long';
  language?: string;
}

export interface AiGeneratorResult {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export class AiGeneratorService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
    });
  }

  async execute(input: AiGeneratorInput): Promise<AiGeneratorResult> {
    const { prompt, type, tone = 'professional', length = 'medium', language = 'Indonesian' } = input;

    const systemPrompt = this.getSystemPrompt(type, tone, length, language);
    const userPrompt = `Topic/Instruction: ${prompt}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini', // Cost-effective and fast
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: tone === 'creative' ? 0.9 : 0.7,
      });

      const content = response.choices[0]?.message?.content || 'No content generated';

      return {
        content,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
      };
    } catch (err: any) {
      console.error('[AiGenerator] Error:', err.message);
      
      // If API key is missing or invalid, return a friendly mock for the demo
      if (process.env.OPENAI_API_KEY === 'sk-placeholder' || !process.env.OPENAI_API_KEY) {
        return this.getMockResult(prompt, type);
      }
      
      throw new Error(`AI Generation failed: ${err.message}`);
    }
  }

  private getSystemPrompt(type: string, tone: string, length: string, language: string): string {
    let base = `You are a professional content creator for a digital marketing agency (aidigicell.com). 
    Write in ${language}. Tone: ${tone}. Length: ${length}. `;

    switch (type) {
      case 'article':
        base += 'Write a structured blog article with headings (H1, H2) and a compelling introduction.';
        break;
      case 'social':
        base += 'Write a catchy social media post with relevant emojis and hashtags.';
        break;
      case 'product':
        base += 'Write a persuasive product description highlighting features and benefits.';
        break;
    }

    return base;
  }

  private getMockResult(prompt: string, type: string): AiGeneratorResult {
    return {
      content: `[MOCK CONTENT - API KEY NOT SET]\n\nThis is a simulated ${type} about "${prompt}". \n\nTo enable real AI generation, please set your OPENAI_API_KEY in the backend .env file.\n\nKey points for your content:\n1. Benefit 1 of ${prompt}\n2. How ${prompt} helps your business\n3. Why choose aidigicube for ${prompt}`,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      model: 'mock-gpt-4',
    };
  }
}
