export default async function handler(req, res) {
  // This file allows the backend to run as Vercel serverless functions
  // The actual backend code will be served from the backend folder
  
  res.status(404).json({ message: 'Backend API route not found' });
}
