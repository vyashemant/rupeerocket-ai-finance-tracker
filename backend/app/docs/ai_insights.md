AI Insights — prompt and examples

Purpose

Generate concise, professional monthly financial insights using Google Gemini. Insights are cached in the `ai_insights` table to avoid repeated calls and reduce cost.

Prompt design (token-optimized)

- Input: compact JSON that includes month, income, expenses, net, top_expenses (array), daily_samples, recent_trend (last 6 months).
- Instructions:
  - Return only a single valid JSON object with keys: `summary`, `highlights`, `recommendations`.
  - `summary`: one-line professional summary <= 80 chars.
  - `highlights`: 1-4 short observations (<=60 chars each).
  - `recommendations`: 1-4 concise action items; when possible include monthly savings like "Reduce dining by 15% -> save ₹3000"; if estimate is not possible use `estimate_unavailable`.
  - Do not add explanations, markdown, or extra keys. Use only numbers present in the input. Avoid fabrication.

Example prompt (shortened):

You are a concise, conservative financial insights assistant.
Given the structured JSON input, produce a short JSON object with keys:
  - "summary": one-sentence professional summary (no more than 80 chars),
  - "highlights": array of 1-4 short observations (each < 60 chars),
  - "recommendations": array of 1-4 short action items with optional estimated monthly savings.
Only return valid JSON — do not add explanations, markdown, or extra keys. If a numeric estimate is not possible, use the text 'estimate_unavailable'. Avoid fabricating facts; only use numbers present in the input.
Input JSON:
{"month":"2026-05","income":50000,"expenses":13499,"net":36501,"top_expenses":[{"name":"Food","amount":5000},{"name":"Bills","amount":4000},{"name":"Entertainment","amount":2000}],"daily_samples":[{"date":"2026-05-02","amount":499}],"recent_trend":[{"month":"2026-01","expenses":8000},{"month":"2026-04","expenses":12000}]}
Output JSON:


Sample API responses

1) When AI is available (ideal):

{
  "success": true,
  "data": {
    "insights": {
      "id": 12,
      "user_id": 5,
      "month": "2026-05",
      "insights_text": "{\"summary\": \"Food spending up 28% vs last month.\", \"highlights\": [\"Food +28%\", \"Subscriptions significant\"], \"recommendations\": [\"Reduce dining out by 15% -> save ₹3000\"]}",
      "summary_text": "Food spending up 28% vs last month.",
      "provider": "gemini-3.5-flash",
      "tokens_used": 182,
      "created_at": "2026-05-21T12:38:40.054564"
    }
  }
}

2) When AI is unavailable (fallback):

{
  "success": true,
  "data": {
    "insights": {
      "id": 13,
      "user_id": 5,
      "month": "2026-05",
      "insights_text": "{\"summary\": \"No AI insights available.\", \"highlights\": [], \"recommendations\": []}",
      "summary_text": "No AI insights available.",
      "provider": null,
      "tokens_used": null,
      "created_at": "2026-05-21T12:40:00.000000"
    }
  }
}

Notes on hallucination prevention

- The prompt explicitly instructs the model to only use numbers present in the input and to avoid fabrication.
- We parse the model output as JSON; if parsing fails we fall back to a short extract and store that, but we avoid presenting fabricated numeric estimates.
- Consider adding additional deterministic checks: e.g., when a recommendation includes a savings estimate, verify it by computing percentage * category amount.

Token optimization

- We pass a compact JSON payload and request a conservative `max_output_tokens` (default 300 in the insights flow) and `temperature=0` to improve determinism and reduce tokens.
- Cache generated insights per user/month to avoid repeat calls.

Operational notes

- The AI insights are stored in the `ai_insights` table. For production, create a proper migration instead of relying on `db.create_all()`.
- Rotate and secure `GEMINI_API_KEY`.

*** End of file
