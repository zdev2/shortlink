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
  const [expiredTime, setExpiredTime] = useState<number | null>(null);
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Fungsi untuk memendekan tampila original Link
  const truncateUrl = (url: string, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    const start = url.slice(0, 20);
    return `${start}...`;
  };

  // Validasi original Url saat input 
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

    setIsPopupOpen(true);
  };

  const handlePopupSubmit = async () => {
    if (!customSlug || !expiredTime) {
      alert("Please complete the custom link and expiration time.");
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
          expiredTime,
        }),
      });

      if (!response.ok) {
        const errorText = await response.json();
        console.error(`Error: ${errorText.message}`);
        alert("Failed to shorten the link. Please try again.");
        return;
      }

      const data = await response.json();

      const newLink: ShortLink = {
        id: data.data.url_details.id,
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
      setExpiredTime(null);
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error fetching API:", error);
    }
  };

  const handleCopy = (shortLink: string) => {
    navigator.clipboard.writeText(shortLink).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const handleShare = (shortLink: string) => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this shortened link!",
          text: "Here is a link I shortened: ",
          url: shortLink,
        })
        .catch((error) => console.error("Error sharing:", error));
    } else {
      alert("Your browser doesn't support the Web Share API.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center mb-8">URL Shortener</h1>

      {/* Input original link */}
      <div className="flex justify-center gap-4 mb-6">
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="Enter original URL"
          className="p-2 border border-gray-300 rounded-lg w-1/2"
        />
        <button onClick={handleShorten} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
          Shorten now
        </button>
      </div>

      {/* Pop-up for input custom link and expiration time */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Customize your link</h2>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="Enter custom slug"
              className="p-2 border border-gray-300 rounded-lg w-full mb-4"
            />
            <input
              type="number"
              value={expiredTime || ""}
              onChange={(e) => setExpiredTime(parseInt(e.target.value))}
              placeholder="Expired time in minutes"
              className="p-2 border border-gray-300 rounded-lg w-full mb-4"
            />
            <div className="flex gap-4">
              <button onClick={handlePopupSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                Submit
              </button>
              <button onClick={() => setIsPopupOpen(false)} className="bg-red-500 text-white px-4 py-2 rounded-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display shortened links */}
      <div>
        {shortLinks.length > 0 ? (
          <ul className="space-y-4">
            {shortLinks.map((link, index) => (
              <li key={index} className="p-4 bg-white shadow-md rounded-lg">
                <p>
                  <strong>Original:</strong>{" "}
                  <a
                    href={link.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {truncateUrl(link.originalUrl)}
                  </a>
                </p>
                <p>
                  <strong>ID:</strong> {link.id}
                </p>
                <p>
                  <strong>Shortlink:</strong>{" "}
                  <a
                    href={link.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {link.shortLink}
                  </a>
                </p>
                <p>
                  <strong>Click Count:</strong> {link.clicks}
                </p>
                <p>
                  <strong>Status:</strong> {link.status}
                </p>
                <p>
                  <strong>Created At:</strong> {new Date(link.createdAt).toLocaleString()}
                </p>
                <p>
                  <strong>Last Accessed At:</strong>{" "}
                  {link.lastAccessedAt
                    ? new Date(link.lastAccessedAt).toLocaleString()
                    : "N/A"}
                </p>
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleCopy(link.shortLink)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => handleShare(link.shortLink)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    Share Link
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600">No shortened links yet.</p>
        )}
      </div>
    </div>
  );
};

export default MainPage;
