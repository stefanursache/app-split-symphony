import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OptimizationRequest {
  currentPlies: Array<{ material: string; angle: number }>;
  requirements: {
    minStrength?: number;
    maxWeight?: number;
    targetThickness?: number;
    loadType: string;
  };
  availableMaterials: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { currentPlies, requirements, availableMaterials }: OptimizationRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert in composite laminate design and optimization. 
Your task is to analyze the current laminate configuration and suggest optimized ply angles and materials.

Key principles:
- Balance strength requirements with weight minimization
- Consider fiber orientations: 0°, ±45°, 90° are common
- Quasi-isotropic laminates often use [0/±45/90] patterns
- Carbon fiber is stronger but more expensive, fiberglass is lighter and cheaper
- Symmetrical stacking sequences reduce coupling effects
- More plies at load-critical angles improve strength in that direction`;

    const userPrompt = `Current Configuration:
${currentPlies.map((p, i) => `Ply ${i + 1}: ${p.material} @ ${p.angle}°`).join('\n')}

Requirements:
- Load Type: ${requirements.loadType}
${requirements.minStrength ? `- Minimum Strength: ${requirements.minStrength} MPa` : ''}
${requirements.maxWeight ? `- Maximum Weight: ${requirements.maxWeight} g` : ''}
${requirements.targetThickness ? `- Target Thickness: ${requirements.targetThickness} mm` : ''}

Available Materials: ${availableMaterials.join(', ')}

Suggest 3-5 optimized laminate configurations that meet these requirements while minimizing weight.
For each suggestion, explain the key improvements and trade-offs.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_laminate_configurations",
              description: "Return 3-5 optimized laminate configurations with plies and rationale.",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Name of the configuration" },
                        plies: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              material: { type: "string" },
                              angle: { type: "number" }
                            },
                            required: ["material", "angle"],
                            additionalProperties: false
                          }
                        },
                        expectedWeight: { type: "number", description: "Estimated weight in grams" },
                        strengthRating: { type: "string", enum: ["low", "medium", "high", "very high"] },
                        rationale: { type: "string", description: "Explanation of why this configuration is optimal" },
                        tradeoffs: { type: "string", description: "Key trade-offs of this design" }
                      },
                      required: ["name", "plies", "rationale"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_laminate_configurations" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(suggestions),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Optimization error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
