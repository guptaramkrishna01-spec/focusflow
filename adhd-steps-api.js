export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { task } = req.body;

  if (!task) {
    return res.status(400).json({ error: "Task is required" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `Break this task into 4-7 simple steps for a child with ADHD. Max 8 words each step. Return ONLY a JSON array. Task: "${task}"`
          }
        ]
      })
    });

    const data = await response.json();
    const raw = data.content?.map(b => b.text || "").join("");
    const steps = JSON.parse(raw.trim());

    res.status(200).json({ steps });

  } catch (e) {
    res.status(500).json({ error: "Try again!" });
  }
}
