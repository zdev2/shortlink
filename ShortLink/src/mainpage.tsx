import { useState } from "react";

interface ShortLink {
  shortLink: string;
  originalUrl: string;
  clicks: number;
  status: string;
}

const MainPage = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]); // Menambahkan tipe <ShortLink[]>

  const handleShorten = async () => {
    if (!originalUrl) {
      alert("Please enter a valid URL.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include credentials to send cookies
        body: JSON.stringify({
          url: originalUrl, // Only send the original URL
          shortlink: customSlug,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      const newLink: ShortLink = {
        shortLink: data.shortlink, // Ensure this matches your API response
        originalUrl: originalUrl,
        clicks: 0,
        status: "active",
      };

      setShortLinks([newLink, ...shortLinks]);

      // Reset input
      setOriginalUrl("");
    } catch (error) {
      console.error("Error fetching API:", error);
      alert("Failed to shorten the link. Please try again later.");
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
