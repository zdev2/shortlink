import { useState } from 'react';

interface ShortLink {
  shortLink: string;
  originalUrl: string;
  clicks: number;
  status: string;
}

const MainPage = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]); // Menambahkan tipe <ShortLink[]>

  const handleShorten = async () => {
    if (!originalUrl) {
      alert('Please enter a valid URL.');
      return;
    }
  
    const randomSlug = customSlug || Math.random().toString(36).substring(2, 8);
  
    try {
      const response = await fetch('http://127.0.0.1:3000/api/v1/urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Gantikan YOUR_API_TOKEN dengan token yang benar
          'Authorization': `token`, // Token API kamu di sini
        },
        body: JSON.stringify({
          original_url: originalUrl,
          custom_slug: randomSlug,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      const newLink: ShortLink = {
        shortLink: data.short_link,
        originalUrl: originalUrl,
        clicks: 0,
        status: 'active',
      };
  
      setShortLinks([newLink, ...shortLinks]);
  
      // Reset input
      setOriginalUrl('');
      setCustomSlug('');
    } catch (error) {
      console.error('Error fetching API:', error);
      alert('Failed to shorten the link. Please try again later.');
    }
  };
  
  

  return (
    <div>
      <input 
        type="text" 
        value={originalUrl} 
        onChange={(e) => setOriginalUrl(e.target.value)} 
        placeholder="Enter original URL"
      />
      <input 
        type="text" 
        value={customSlug} 
        onChange={(e) => setCustomSlug(e.target.value)} 
        placeholder="Enter custom slug (optional)"
      />
      <button onClick={handleShorten}>Shorten Link</button>
    </div>
  );
};

export default MainPage;
