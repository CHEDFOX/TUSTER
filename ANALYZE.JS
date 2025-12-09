// Simple Vercel serverless function that returns a mock AI analysis
export default function handler(req, res) {
  // Accept POST requests only
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // You can inspect req.body here, but we just return a mock response for now
  res.status(200).json({
    summary: "Mock summary: This PR updates input validation and adds upload endpoint.",
    flags: ["Missing unit tests", "Potential NPE in transformUser"],
    tests: "Suggested tests:\n- transformUser(null)\n- transformUser(large payload)\n- upload endpoint handles invalid files"
  });
}
