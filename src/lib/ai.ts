import "server-only";

/** AI service abstraction. Mock provider ships by default; production
 *  providers plug in via AI_PROVIDER/AI_API_KEY without app changes. */

export interface AIProvider {
  generateProductCopy(input: { name?: string; category?: string; hints?: string }): Promise<{
    title: string;
    description: string;
    tags: string[];
  }>;
}

class MockAIProvider implements AIProvider {
  async generateProductCopy({ name = "Product", category = "General", hints = "" }: { name?: string; category?: string; hints?: string }) {
    const base = name.trim() || "Product";
    return {
      title: base,
      description:
        `${base} — quality ${category.toLowerCase()} from our shop. ` +
        `${hints ? hints + " " : ""}Carefully selected for everyday value. ` +
        `Message us on WhatsApp for availability, sizes and best price.`,
      tags: [category.toLowerCase(), ...base.toLowerCase().split(/\s+/).slice(0, 3)].filter(
        (t, i, a) => t.length > 2 && a.indexOf(t) === i,
      ),
    };
  }
}

export function getAI(): AIProvider {
  // anthropic/openai providers can be added here keyed on AI_PROVIDER.
  return new MockAIProvider();
}
