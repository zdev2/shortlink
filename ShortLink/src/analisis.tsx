import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AreaChart, Area } from "recharts";
import { XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { notification } from "antd";
import { Button, Modal } from "antd";
import { ChartData, processData } from "./utils/analitik";

interface BodyData {
  url: string;
  shortlink: string;
  title: string;
  expiredTime?: number;
}

// interface AnalysticData {
//   name: string;
//   clicks: number;
//   visitor: number;
// }

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

const Analisis: React.FC = () => {
  const navigate = useNavigate();
  const [originalUrl, setOriginalUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [expiredTime, setExpiredTime] = useState<number | null>(null);
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState(
    "Are you sure you want to log out? You will need to log in again to access your account."
  );
  const [globalAnalystics, setGlobalAnalystics] = useState<ChartData[]>([]);
  const [SpecificLinkAnalytics, setSpecificLinkAnalytics] = useState<
    ChartData[]
  >([]);
  const authToken = localStorage.getItem("authToken");
  const { id = "" } = useParams();

  // Handle Show Modal
  const showModal = () => {
    setOpen(true);
  };

  // Handle Oke
  const handleOk = () => {
    setModalText(
      "Are you sure you want to log out? You will need to log in again to access your account."
    );
    setConfirmLoading(true);
    setTimeout(() => {
      handleLogout();
      setOpen(false);
      setConfirmLoading(false);
    }, 5000);
  };

  // Handle Cancel
  const handleCancel = () => {
    setOpen(false);
  };

  // Generate Random Shortlink
  const generateRandomSlug = (length: number = 6): string => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let slug = "";
    for (let i = 0; i < length; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  };

  // Reset Inputs
  const resetInputs = () => {
    setOriginalUrl("");
    setCustomSlug("");
    setCustomTitle("");
    setExpiredTime(null);
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      const response = await fetch(
        "https://shortlink-production-dnd.up.railway.app/api/v1/users/logout",
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
        navigate("/");
        notification.success({
          message: "Logout has Succes",
          description: "Logout successfully.",
          placement: "top",
        });
        // openNotification("top")
        // Clear any session data or redirect the user
      } else if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Handle Validasi Url
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

  // Handle Shorten Link
  const handleShorten = async () => {
    if (!originalUrl || !validateUrl(originalUrl)) {
      notification.error({
        message: "Shorten Failed",
        description: "Please enter a valid URL.",
        placement: "top",
      });
      return;
    }
    // Generate a random slug and set it as customSlug
    const randomSlug = generateRandomSlug();
    setCustomSlug(randomSlug);
    setIsPopupOpen(true);
  };

  // Handle Submit
  const handlePopupSubmit = async () => {
    if (!customSlug || !customTitle) {
      notification.error({
        message: "Shorten Failed",
        description:
          "Please complete all fields including custom slug and custom title.",
        placement: "top",
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

      const response = await fetch(
        "https://shortlink-production-dnd.up.railway.app/api/v1/urls",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(bodyData),
        }
      );

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
      navigate("/main-menu");
    } catch (error) {
      console.error("Error fetching API:", error);
      notification.error({
        message: "Shorten Failed",
        description:
          "There was a problem connecting to the server. Please check your connection and try again.",
        placement: "top",
      });
    }
  };

  // Fetching Global Analytics
  const fetchGlobalAnalystics = async () => {
    try {
      const response = await fetch(
        "https://shortlink-production-dnd.up.railway.app/api/v1/analytics",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch global analytics");
        return;
      }
      const data = await response.json();
      const processesdData = processData(data.data.analytics);
      setGlobalAnalystics(processesdData);
    } catch (error) {
      console.error("Error fetching API:", error);
      notification.error({
        message: "Error",
        description: "Failed to Fetch Global Analytics",
        placement: "top",
      });
    }
  };

  // Fetching Spesifik Analytics
  const fetchSpecificLinkAnalytics = async (id: string) => {
    try {
      // Validasi ID
      if (!id) {
        console.error(
          "Error: ID is missing. Ensure that a valid ID is provided."
        );
        return;
      }
      // Validasi Token Otorisasi
      if (!authToken) {
        console.error(
          "Error: Authorization token is missing. Ensure you are logged in."
        );
        return;
      }
      // Kirim Permintaan ke API
      const response = await fetch(
        `https://shortlink-production-dnd.up.railway.app/api/v1/analytics/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        console.error(
          `Error: Failed to fetch specific link analytics. Status: ${response.status}`
        );
      }

      if (response.status === 200) {
        notification.success({
          message: "Success",
          description: "Analytics fetched successfully.",
          placement: "top",
        });
      }

      if (response.status === 404) {
        notification.error({
          message: "Analytics not found",
          description: "Analytics not found for the specified ID.",
          placement: "top",
        });
      }

      // Parsing JSON
      let data;
      try {
        data = await response.json();
        const processedData = processData(data.data.analytics);
        setSpecificLinkAnalytics(processedData);
      } catch (jsonError) {
        console.error("Error: Failed to parse response as JSON.", jsonError);
      }
    } catch (error) {
      console.error(
        "Error: An unexpected error occurred while fetching analytics.",
        error
      );
      // Tampilkan notifikasi kepada pengguna
      notification.error({
        message: "Error",
        description:
          "Failed to Fetch Specific Link Analytics. Please try again later.",
        placement: "top",
      });
    }
  };

  // Memindai Output by ID dan Global
  useEffect(() => {
    const fetchAndSetData = async () => {
      if (id) {
        await fetchSpecificLinkAnalytics(id); // Untuk data spesifik jika ada ID
      } else {
        await fetchGlobalAnalystics(); // Untuk data global
      }
    };

    fetchAndSetData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Menjalankan ulang jika ID berubah

  return (
    <div className="min-h-screen relative flex flex-col justify-center items-center bg-gray-100 p-4 md:p-6">
      {/* Logout Button */}
      <div className="flex justify-between mt-4 w-[1075px] mb-10">
        <h1 className="text-2xl md:text-4xl font-bold text-center ">
          URL Shortener
        </h1>
        <Button type="primary" onClick={showModal}>
          Logout
        </Button>
        <Modal
          title="Logout Confirmation"
          open={open}
          onOk={handleOk}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}
        >
          <p>{modalText}</p>
        </Modal>
      </div>

      {/* Input Original Link */}
      <div className="flex md:flex-row justify-center w-[1075px] py-1 px-2 bg-white rounded-full border-4 border-blue-600 ">
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="Enter original URL"
          className="p-3 border-gray-300 text-xs flex-1 rounded-lg"
        />
        <button
          onClick={handleShorten}
          className="bg-blue-600 text-white px-4 py-2 text-xs flex-shrink-0 min-w[100px] w-fit font-semibold rounded-full"
        >
          Shorten now
        </button>
      </div>

      {/* Navigasi */}
      <div className="flex justify-center gap-5 mt-4">
        <button
          onClick={() => navigate("/main-menu")}
          className="font-semibold border-blue-500 hover:text-blue-500"
        >
          Shortlink
        </button>
        <button
          onClick={() => navigate("/analisis")}
          className="border-b-4 font-semibold text-blue-500 border-blue-500"
        >
          Analytics
        </button>
      </div>

      {/* Customize Your Link */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-10 bg-black bg-opacity-50 flex justify-center items-center">
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

      {/* Analisis Page */}
      <div>
        <div>
          {id ? (
            <div>
              <h2 className="font-bold">Analytics for Shortlink: {id}</h2>
            </div>
          ) : (
            <div>
              <h2 className="font-bold">Analytics by Global</h2>
            </div>
          )}
        </div>

        <div
          className="z-0"
          style={{
            width: "100%",
            height: "400px",
            maxWidth: "1000px",
            margin: "auto",
          }}
        >
          <AreaChart
            width={1000}
            height={300}
            data={id ? SpecificLinkAnalytics : globalAnalystics}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis strokeOpacity={0} dataKey="date" />
            <YAxis strokeOpacity={0} dataKey="visitors" />
            <CartesianGrid strokeDasharray="1 1" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#colorPv)"
            />
          </AreaChart>
        </div>
      </div>
    </div>
  );
};

export default Analisis;
