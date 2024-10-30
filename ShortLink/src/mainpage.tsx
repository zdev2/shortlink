import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faShare } from '@fortawesome/free-solid-svg-icons';
import './App.css'

// Define the interface for the body data sent to the API
interface BodyData {
  url: string;
  shortlink: string;
  title: string;
  expiredTime?: number; // Optional property
}

interface QrCodePopupProps {
  qrCodeUrl: string; // Tipe untuk URL QR code
  onClose: () => void; // Tipe untuk fungsi onClose
}

interface ShortLink {
  id: string;
  shortLink: string;
  originalUrl: string;
  clicks: number;
  status: string;
  createdAt: string;
  lastAccessedAt: string | null;
  title: string;
  qrCodeUrl: string;
}

const MainPage = () => {
  const navigate = useNavigate();
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [expiredTime, setExpiredTime] = useState<number | null>(null);
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<ShortLink | null>(null);

  const generateRandomSlug = (length: number = 6): string => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let slug = "";
    for (let i = 0; i < length; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  };

  const resetInputs = () => {
    setOriginalUrl("");
    setCustomSlug("");
    setCustomTitle("");
    setExpiredTime(null);
  };

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
    // Generate a random slug and set it as customSlug
    const randomSlug = generateRandomSlug();
    setCustomSlug(randomSlug);
    setIsPopupOpen(true);
  };
  useEffect(() => {
    const showAllURLs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:3000/api/v1/urls", {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch URLs");
        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const links = data.data.urls.map((item: any) => ({
          id: item.id,
          shortLink: `dnd.id/${item.shortlink}`,
          originalUrl: item.url,
          title: item.url_title, // `url_title` is used directly from the JSON
          clicks: item.clickcount, // `clickcount` directly from `item`
          status: item.status,
          createdAt: item.createdat,
          lastAccessedAt: item.lastaccesedat || null,
          qrCodeUrl: item.qr_code, // `qr_code` as in the JSON
        }));
        setShortLinks(links);
      } catch (error) {
        console.error("Error fetching URLs:", error);
      }
    };
    showAllURLs(); // Call fetch function on mount
  }, []);

  const handlePopupSubmit = async () => {
    if (!customSlug || !customTitle) {
      alert(
        "Please complete all fields including custom slug and custom title."
      );
      return;
    }

    try {
      const bodyData: BodyData = {
        url: originalUrl,
        shortlink: customSlug,
        title: customTitle,
      };

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
        shortLink: `dnd.id/${data.data.shortlink}`,
        originalUrl: originalUrl,
        title: customTitle,
        clicks: data.data.url_details.clickcount,
        status: data.data.url_details.status,
        createdAt: data.data.url_details.createdat,
        lastAccessedAt: data.data.url_details.lastaccesedat || null,
        qrCodeUrl: data.data.url_details.qr_code,
      };

      setShortLinks([newLink, ...shortLinks]);
      setOriginalUrl("");
      setCustomSlug("");
      setExpiredTime(null);
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

  const QrCodePopup: React.FC<QrCodePopupProps> = ({ qrCodeUrl, onClose }) => {
    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${qrCodeUrl}`;
      link.download = 'qrcode.png';
      link.click();
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
          <h2 className="text-xl md:text-2xl font-bold mb-4">QR Code</h2>
          <img
            src={`data:image/png;base64,${qrCodeUrl}`}
            alt="QR Code"
            className="w-full h-auto mb-4"
          />
          <div className="flex justify-between">
            <button
              onClick={handleDownload}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              Download QR Code
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleQrCodeClick = (link: ShortLink) => {
    setSelectedQrCode(link);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center bg-gray-100 p-4 md:p-6">
      <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-8">
        URL Shortener
      </h1>

      <div className="flex justify-center mb-4">
        <button
          onClick={() => navigate("/analisis")}
          className="bg-blue-600 text-white px-4 py-2 text-xs w-fit font-semibold rounded-full"
        >
          Go to Analisi
        </button>
      </div>
      {/* Input Original Link */}
      <div className="flex flex-row md:flex-row justify-center w-auto py-1 px-2 bg-white rounded-full border-4 border-blue-600 ">
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="Enter original URL"
          className="p-2 border-gray-300 text-xs rounded-lg w-[65%] md:w-1/2"
        />
        <button
          onClick={handleShorten}
          className="bg-blue-600 text-white px-4 py-2 text-xs w-fit font-semibold rounded-full"
        >
          Shorten now
        </button>
      </div>
      {/* Customize Your Link */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/3">
            <h2 className="text-xl md:text-2xl font-bold mb-4">
              Customize Your Link
            </h2>
            <div className="p-2 mb-2 bg-gray-200 rounded-lg w-fit ">
              <p>
                <strong>Shortlink:</strong>{" "}
                {customSlug
                  ? `dnd.id/${customSlug}`
                  : "dnd.id/"}
              </p>
            </div>
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
              onChange={(e) =>
                setExpiredTime(e.target.value ? parseInt(e.target.value) : null)
              }
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
                onClick={() => {
                  resetInputs(); // Reset inputs saat popup ditutup
                  setIsPopupOpen(false);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* QR Code Popup */}
      {selectedQrCode && (
        <QrCodePopup
          qrCodeUrl={selectedQrCode.qrCodeUrl}
          onClose={() => setSelectedQrCode(null)}
        />
      )}
      {/* Output Semua Link */}
      <div className="flex mt-5 justify-center">
        <div className="w-fit max-h-[450px] flex flex-col justify-center scrollbar-hide overflow-y-auto bg-white shadow-md rounded-lg pt-4"> 
          <div className="listsorlink bg-white max-h-[450px] shadow-md w-fit  grid grid-cols-8 place-content-center text-center items-center rounded-lg"  > </div>
        {shortLinks.length > 0 ? (
          <ul className="space-y-4">
            {shortLinks.map((link, index) => (
              <li key={index} className="listsorlink bg-white shadow-md w-fit  grid grid-cols-8 place-content-center text-center items-center rounded-lg">
                <p>
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
                  {/* <strong>Shortlink:</strong>{" "} */}
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
                  {/* <strong>Title:</strong>  */}
                  {link.title}
                </p>
                <p>
                  {/* <strong>Created At:</strong>  */}
                  {link.createdAt}
                </p>
                <p>
                  {/* <strong>Status:</strong>  */}
                  {link.status}
                </p>
                <p>
                  {/* <strong>Clicks:</strong>  */}
                  {link.clicks}
                </p>
                <div className="flex items-center justify-center">
                  <img
                    src={`data:image/png;base64,${link.qrCodeUrl}`}
                    alt="QR Code"
                    className="qr-code w-16 h-16 my-1"
                    onClick={() => handleQrCodeClick(link)}
                  />
                </div>
                <div className="grid grid-cols-2">
                  <div className="flex justify-center">
                    <FontAwesomeIcon
                        onClick={() => handleShare(link.shortLink)}
                        className="px-4 py-2"
                        icon={faShare} />
                  </div>
                  <div className="flex justify-center">
                    <FontAwesomeIcon
                        onClick={() => handleCopy(link.shortLink)}
                        className="px-4 py-2"
                        icon={faCopy} />
                  </div>
                  <div className="flex justify-center">
                    <FontAwesomeIcon
                        onClick={() => handleShare(link.shortLink)}
                        className="px-4 py-2"
                        icon={faShare} />
                  </div>
                  <div className="flex justify-center">
                    <FontAwesomeIcon
                        onClick={() => handleCopy(link.shortLink)}
                        className="px-4 py-2"
                        icon={faCopy} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p></p>
        )}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
