/**
 * API route for handling image uploads
 * 
 * Acts as a proxy to the server-side image API
 */

export const config = {
  api: {
    bodyParser: false, // Don't parse body - we need to forward the multipart form data
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get server URL from environment variables
    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
    
    // Forward the request to the server
    const response = await fetch(`${serverUrl}/api/images/upload`, {
      method: 'POST',
      body: req.body, // Forward the raw request body (multipart form)
      headers: req.headers, // Forward headers
    });
    
    // Get the JSON response
    const data = await response.json();
    
    // Return the server response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Image upload proxy error:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Image upload failed: ${error.message}` 
    });
  }
}
