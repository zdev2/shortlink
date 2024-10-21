import { useState } from "react";

interface ShortLink {
  id: string;
  shortLink: string;
  originalUrl: string;
  clicks: number;
  status: string;
  createdAt: string;
  lastAccessedAt: string | null;
}

const MainPage = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);

  const validateUrl = (url: string) => {
    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" +
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" +
        "((\\d{1,3}\\.){3}\\d{1,3}))" +
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
        "(\\?[;&a-z\\d%_.~+=-]*)?" +
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );
    return !!urlPattern.test(url);
  };

  const handleShorten = async () => {
    if (!originalUrl || !validateUrl(originalUrl)) {
      alert("Please enter a valid URL.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:3000/api/v1/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          url: originalUrl,
          shortlink: customSlug,
        }),
      });

      if (!response.ok) {
        const errorText = await response.json();
        console.error(`Error: ${errorText.message}`);

        if (errorText.error_location === "Short link already exists") {
          alert("The custom slug already exists. Please choose another one.");
        } else {
          alert("Failed to shorten the link. Please try again.");
        }

        throw new Error(`Error: ${errorText.message}`);
      }

      const data = await response.json();

      const newLink: ShortLink = {
        id: data.data.url_details.id, // Added ID
        shortLink: `https://dnd.id/${data.data.shortlink}`,
        originalUrl: originalUrl,
        clicks: data.data.url_details.clickcount,
        status: data.data.url_details.status,
        createdAt: data.data.url_details.createdat,
        lastAccessedAt: data.data.url_details.lastaccesedat || null,
      };

      setShortLinks([newLink, ...shortLinks]);

      setOriginalUrl("");
      setCustomSlug("");
    } catch (error) {
      console.error("Error fetching API:", error);
    }
  };

  return (
    <div>
      <h1>URL Shortener</h1>

      <div className=" flex gap-4 justify-center py-5 p">
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
        <button onClick={handleShorten} className="bg-red-100">
          Shorten Link
        </button>
      </div>

      <div>
        <h2>Shortened Links</h2>
        {shortLinks.length > 0 ? (
          <ul>
            {shortLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.shortLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.shortLink}
                </a>
                <br />
                <span>Original: {link.originalUrl}</span>
                <br />
                <span>ID: {link.id}</span>
                <br />
                <span>ID: {link.shortLink}</span>
                <br />
                <span>Click Count: {link.clicks}</span>
                <br />
                <span>Status: {link.status}</span>
                <br />
                <span>
                  Created At: {new Date(link.createdAt).toLocaleString()}
                </span>
                <br />
                <span>
                  Last Accessed At:{" "}
                  {link.lastAccessedAt
                    ? new Date(link.lastAccessedAt).toLocaleString()
                    : "N/A"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No shortened links yet.</p>
        )}
      </div>
    </div>
  );
};

export default MainPage;
