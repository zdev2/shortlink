import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { notification } from 'antd';
import { CopyOutlined, ShareAltOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Dropdown, Space, Menu } from "antd";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  iat: number;
  // Add other properties of the decoded token as needed
}

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
  const [selectedLink, setSelectedLink] = useState<ShortLink | null>(null);

  const handleCopy = () => {
    if (selectedLink) {
      navigator.clipboard
        .writeText(selectedLink.shortLink)
        .then(() => {
          notification.success({
            message: "Link copied to clipboard!",
            description: "The shortened link has been copied successfully.",
            placement: "top",
          });
        })
        .catch((error) => {
          console.error("Error copying text:", error);
          notification.error({
            message: "Failed to copy link",
            description:
              "There was an error copying the link. Please try again.",
            placement: "top",
          });
        });
    }
  };

  const handleShare = () => {
    if (navigator.share && selectedLink) {
      navigator
        .share({
          title: "Check out this shortened link!",
          text: "Here is a link I shortened: ",
          url: selectedLink.shortLink,
        })
        .catch((error) => {
          console.error("Error sharing:", error);
          notification.error({
            message: "Failed to share link",
            description:
              "There was an error sharing the link. Please try again.",
            placement: "top",
          });
        });
    } else {
      notification.info({
        message: "Share not supported",
        description: "Your browser doesn't support the Web Share API.",
        placement: "top",
      });
    }
  };

  const showAllURLs = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decoded: DecodedToken = jwtDecode(token);
          console.log(decoded);
          if (decoded.exp < Date.now() / 1000) {
            console.error("Token has expired");
            // Handle token expiry (e.g., log out user or refresh token)
          }
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      } else {
        console.error("No token found in localStorage");
      }

      const response = await fetch("http://127.0.0.1:3000/api/v1/urls", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error("Unauthorized access - possible invalid or expired token.");
          localStorage.removeItem("authToken");
          navigate("/main-menu")
        } else {
          console.error("Failed to fetch URLs. Status code:", response.status);
        }
        return;
      }

      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const links: ShortLink[] = data.data.urls.map((item: any) => ({
        id: item.id,
        shortLink: `https://dnd.id/${item.shortlink}`,
        originalUrl: item.url || "",
        title: item.url_title || "Untitled",
        clicks: item.clickcount || 0,
        status: item.status || "inactive",
        createdAt: item.createdat || "N/A",
        lastAccessedAt: item.lastaccesedat || null,
        qrCodeUrl: item.qr_code || "",
      }));

      setShortLinks(links);
      console.log(links); // Log the final links array
    } catch (error) {
      console.error("Error fetching URLs:", error);
    }
  };

  const deleteShortlink = async (id: string) => {
    try {
      await fetch(`http://127.0.0.1:3000/api/v1/urls/${id}`, {
        method: 'DELETE',
      });
      // Setelah menghapus, panggil fetchData untuk memperbarui daftar shortlinks
      showAllURLs();
    } catch (error) {
      console.error("Error deleting shortlink:", error);
    }
  };

  const items = [
    {
      key: "copy",
      icon: <CopyOutlined />,
      label: "Copy",
      onClick: handleCopy,
    },
    {
      key: "share",
      icon: <ShareAltOutlined />,
      label: "Share",
      onClick: handleShare,
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit",
      // onClick: handleShare,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      onClick: deleteShortlink,
    },
  ];

  const HorizontalMenu = () => (
    <Menu
      items={items}
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    />
  );

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

  const authToken = localStorage.getItem("Authorization"); // Replace 'authToken' with your actual key

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 401) {
        // Handle unauthorized response (e.g., redirect to login or clear session)
        console.log("Session expired, redirecting to login...");
        navigate("/");
        // Clear any session data or redirect the user
      } else if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }

      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const truncateUrl = (url: string, maxLength = 20) => {
    if (!url) return "";
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
        const token = localStorage.getItem("authToken");

        if (!token) {
          console.error("No auth token found. Please log in first.");
          return; // Stop the function if no token is available
        }

        const response = await fetch("http://127.0.0.1:3000/api/v1/urls", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.error(
              "Unauthorized access - possible invalid or expired token."
            );
            localStorage.removeItem("authToken"); // Remove invalid token from localStorage
            // Optional: Redirect to login if using React Router
            // navigate("/login");
          } else {
            console.error(
              "Failed to fetch URLs. Status code:",
              response.status
            );
          }
          return; // Stop further execution if response is not ok
        }

        const data = await response.json();
        console.log(data); // Log to inspect the full data structure

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const links: ShortLink[] = data.data.urls.map((item: any) => ({
          id: item.id,
          shortLink: `https://dnd.id/${item.shortlink}`, // Correct field name here
          originalUrl: item.url || "", // Correct field name here (item.url)
          title: item.url_title || "Untitled", // Correct field name (item.url_title)
          clicks: item.clickcount || 0, // Default to 0 if undefined
          status: item.status || "inactive", // Default to "inactive" if undefined
          createdAt: item.createdat || "N/A", // Default to "N/A" if undefined
          lastAccessedAt: item.lastaccesedat || null, // Use correct field name
          qrCodeUrl: item.qr_code || "", // Correct field name
        }));

        setShortLinks(links); // Update the state with mapped links
        console.log(links); // Log the final links array
      } catch (error) {
        console.error("Error fetching URLs:", error);
      }
    };

    showAllURLs();
  }, []);

  const handlePopupSubmit = async () => {
    if (!customSlug || !customTitle) {
      notification.error({
        message: 'Shorten Failed',
        description: 'Please complete all fields including custom slug and custom title.',
        placement: 'top',
      });
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
        shortLink: `https://dnd.id/${data.data.shortlink}`,
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

  const QrCodePopup: React.FC<QrCodePopupProps> = ({ qrCodeUrl, onClose }) => {
    const handleDownload = () => {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${qrCodeUrl}`;
      link.download = "qrcode.png";
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
      {/* Logout Button */}
      <div className="flex justify-center mt-4">
        <h1 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-8">
          URL Shortener
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 text-xs w-fit font-semibold rounded-full"
        >
          Logout
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
      {/* Navigasi */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => navigate("/analisis")}
          className="bg-blue-600 text-white px-4 py-2 text-xs w-fit font-semibold rounded-full"
        >
          Go to Analisi
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
                  ? `https://dnd.id/${customSlug}`
                  : "https://dnd.id/"}
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
      <div className="flex mt-5 flex-wrap justify-center">
        <div className="barki bg-[#4250CC]/50 max-h-[450px] shadow-md w-fit grid grid-cols-8 place-content-center text-center items-center rounded-b-none rounded-lg">
          <strong className="text-white">Original Link</strong> 
          <strong className="text-white">Shortlink</strong>
          <strong className="text-white">Title</strong> 
          <strong className="text-white">Date</strong> 
          <strong className="text-white">Status</strong>
          <strong className="text-white">Click</strong> 
          <strong className="text-white">QR Code</strong>
          <strong className="text-white">Action</strong>
        </div>
        <div className="w-fit max-h-[450px] flex  flex-col justify-start scrollbar-hide overflow-y-auto rounded-t-none bg-[#4250CC]/50 shadow-md rounded-lg">
          {shortLinks.length > 0 ? (
            <ul className="space-y-4">
              {shortLinks.map((link, index) => (
                <li
                  key={index}
                  className="listsorlink bg-white/50 shadow-md w-fit border font-semibold grid grid-cols-8 place-content-center text-center items-center "
                >
                  <p>
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shor text-black"
                    >
                      {truncateUrl(link.originalUrl)}
                    </a>
                  </p>
                  <p>
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shor text-blue-600 font-semibold"
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
                  <button onClick={() => navigate(`/analisis/${link.id}`)}>{link.clicks}</button>
                  <div className="flex items-center justify-center">
                    <img 
                      src={`data:image/png;base64,${link.qrCodeUrl}`}
                      alt="QR Code"
                      className="qr-code w-16 h-16 my-1"
                      onClick={() => handleQrCodeClick(link)}
                    />
                  </div>
                  <div className="grid items-center justify-center">
                  <Space direction="horizontal" wrap>
                    <Dropdown
                      overlay={HorizontalMenu}
                      placement="topCenter" // Set the dropdown to appear above
                      onVisibleChange={(visible) => visible && setSelectedLink(link)} // Set selected link here
                    >
                      <a onClick={(e) => e.preventDefault()}>
                        <MoreOutlined 
                          style={{ 
                            fontSize: '30px', 
                            cursor: 'pointer', 
                            transform: 'rotate(90deg)', 
                            fontWeight: 'bold',
                          }} 
                        />
                      </a>
                    </Dropdown>
                  </Space>
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
