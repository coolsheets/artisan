/**
 * API route for generating prompt suggestions from image analysis
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get server URL from environment variables
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
    
    // Forward the request to the server
    const response = await fetch(`${serverUrl}/api/images/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    // Get the JSON response
    const data = await response.json();
    
    // Return the server response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Image prompt generation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Prompt generation failed: ${error.message}` 
    });
  }
}
