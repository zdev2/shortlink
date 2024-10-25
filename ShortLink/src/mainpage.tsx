import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Tambahkan ini

interface ShortLink {
  id: string;
  shortLink: string;
  originalUrl: string;
  clicks: number;
  status: string;
  createdAt: string;
  lastAccessedAt: string | null;
  title: string;
  qrCodeUrl: string; // Tambahkan properti qrCodeUrl
}

const MainPage = () => {
  const navigate = useNavigate(); // Inisialisasi navigate
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [expiredTime, setExpiredTime] = useState<number | null>(null);
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const truncateUrl = (url: string, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    const start = url.slice(0, 20);
    return `${start}...`;
  };

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

  interface BodyData {
    url: string;
    shortlink: string;
    title: string;
    expiredTime?: number; // expiredTime bersifat opsional
  }

  const handlePopupSubmit = async () => {
    if (!customSlug || !customTitle) {
      alert("Please complete all fields including custom slug and custom title.");
      return;
    }

    try {
      const bodyData: BodyData = {
        url: originalUrl,
        shortlink: customSlug,
        title: customTitle, // Mengirim customTitle ke backend
      };

      // Hanya tambahkan expiredTime jika diisi
      if (expiredTime !== null) {
        bodyData.expiredTime = expiredTime;
      }

      const response = await fetch("http://127.0.0.1:3000/api/v1/urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bodyData),
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
        title: customTitle, // Menggunakan customTitle
        clicks: data.data.url_details.clickcount,
        status: data.data.url_details.status,
        createdAt: data.data.url_details.createdat,
        lastAccessedAt: data.data.url_details.lastaccesedat || null,
        qrCodeUrl: data.data.url_details.qr_code, // Tambahkan URL QR Code dari backend
      };

      setShortLinks([newLink, ...shortLinks]);

      setOriginalUrl("");
      setCustomSlug("");
      setExpiredTime(null); // Reset expired time
      setCustomTitle("");
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
    <div className="min-h-screen relative flex flex-col justify-center bg-gray-100 p-4 md:p-6">
      <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-8">
        URL Shortener
      </h1>

      {/* Tombol navigasi ke halaman Analisi */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => navigate("/analisi")} // Mengarahkan ke halaman Analisi
          className="bg-blue-600 text-white px-4 py-2 text-xs w-fit font-semibold rounded-full"
        >
          Go to Analisi
        </button>
      </div>

      {/* Input original link */}
      <div className="flex flex-row md:flex-row justify-center w-auto py-1 px-2 bg-white rounded-full border-4 border-blue-600 ">
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="Enter original URL"
          className="p-2 border-gray-300 text-xs bgrounded-lg w-[65%] md:w-1/2"
        />
        <button
          onClick={handleShorten}
          className="bg-blue-600 text-white px-4 py-2 text-xs w-fit font-semibold rounded-full"
        >
          Shorten now
        </button>
      </div>

      {/* Pop-up for input custom link and expiration time */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Customize your link
            </h2>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              placeholder="Enter custom slug"
              className="p-2 border border-gray-300 rounded-lg w-full mb-4"
            />
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Enter custom title"
              className="p-2 border border-gray-300 rounded-lg w-full mb-4"
            />
            <input
              type="number"
              value={expiredTime || ""}
              onChange={(e) => setExpiredTime(e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Expired time in minutes (optional)"
              className="p-2 border border-gray-300 rounded-lg w-full mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handlePopupSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Submit
              </button>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display shortened links */}
      <div className="flex justify-center">
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
                  <strong>Title:</strong> {link.title || "No Title Available"}
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
                  <strong>Clicks:</strong> {link.clicks}
                </p>
                <p>
                  <strong>Status:</strong> {link.status}
                </p>
                <p>
                  <strong>Created At:</strong> {link.createdAt}
                </p>
                <p>
                  <strong>Last Accessed:</strong> {link.lastAccessedAt || "Never"}
                </p>
                {/* Tampilkan QR Code jika ada */}
                {link.qrCodeUrl && (
                  <img
                    src={`data:image/png;base64,${link.qrCodeUrl}`}
                    alt="QR Code"
                    className="w-24 h-24 my-2"
                  />
                )}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(link.shortLink)}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleShare(link.shortLink)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Share
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No shortened links available.</p>
        )}
      </div>
    </div>
  );
};

export default MainPage;
