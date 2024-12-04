import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./App.css";
import { notification } from "antd";
import {
  CopyOutlined,
  ShareAltOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Dropdown, Space, MenuProps, Button, Modal } from "antd";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface DecodedToken {
  exp: number;
  iat: number;
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
  const authToken = localStorage.getItem("authToken"); // Replace 'authToken' with your actual key
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState(
    "Are you sure you want to log out? You will need to log in again to access your account."
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentShortlink, setCurrentShortlink] = useState("example-shortlink");
  const [newShortlink, setNewShortlink] = useState(currentShortlink);
  const [loading, setLoading] = useState(false);
  const { id = "" } = useParams();
  console.log(id);

  const handleEdit = (link: ShortLink) => {
    setCurrentShortlink(link.shortLink); // Atur shortLink yang sedang diedit
    setNewShortlink(link.shortLink); // Isi input dengan nilai shortLink saat ini
    setSelectedLink(link); // Tetapkan link yang sedang dipilih
    setIsEditOpen(true); // Buka modal edit
  };

  const handleSave = async () => {
    if (!selectedLink || !newShortlink) {
      notification.error({
        message: "Error",
        description: "Please select a link and provide a valid shortlink.",
        placement: "top",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `https://shortlink-production-dnd.up.railway.app/api/v1/urls/${selectedLink.id}`,
        { shortlink: newShortlink }, // Kirim shortlink baru ke API
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        notification.success({
          message: "Shortlink updated successfully!",
          placement: "top",
        });

        // Perbarui state dengan shortlink yang diperbarui
        setShortLinks((prevLinks) =>
          prevLinks.map((link) =>
            link.id === selectedLink.id
              ? { ...link, shortLink: `${newShortlink}` }
              : link
          )
        );
        setIsEditOpen(false); // Tutup modal
      }
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Error updating shortlink",
        description: "Failed to update shortlink",
        placement: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setModalText(
      "Are you sure you want to log out? You will need to log in again to access your account."
    );
    setConfirmLoading(true);
    setTimeout(() => {
      handleLogout();
      setOpen(false);
      setConfirmLoading(false);
    }, 3000);
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  // Handle Untuk Copy Link Pendek
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

  // Handle Untuk Share Link Pendek
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

  // Handle Untuk Menghapus Link Pendek
  async function deleteShortlink(id: string) {
    try {
      // console.log(authToken);
      const response = await fetch(
        `https://shortlink-production-dnd.up.railway.app/api/v1/urls/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        notification.success({
          message: "Link succes has delete!",
          description: "The shortened link has been delete successfully.",
          placement: "top",
        });
        navigate("/main-menu");
      } else {
        notification.error({
          message: "Failed to delete link",
          description: "There was an error delete the link. Please try again.",
          placement: "top",
        });
      }
    } catch (error) {
      console.error("Error deleting shortlink:", error);
    }
  }

  // Variable items yang mengisi di bagian action dropdown
  const items: (row: ShortLink) => MenuProps["items"] = (row) => [
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
      onClick: () => handleEdit(row), // Bungkus dalam fungsi
    },
    {
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Delete",
      onClick: () => deleteShortlink(row.id as string),
    },
  ];

  // Handle Untuk Menggenerate Link Pendek Secara Acak
  const generateRandomSlug = (length: number = 6): string => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let slug = "";
    for (let i = 0; i < length; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  };

  // Handle Untuk Meriset Input saat ingin Menggenerate
  const resetInputs = () => {
    setOriginalUrl("");
    setCustomSlug("");
    setCustomTitle("");
    setExpiredTime(null);
  };

  // Handle Untuk Logout Account
  const handleLogout = async () => {
    try {
      const response = await fetch(
        "https://shortlink-production-dnd.up.railway.app/api/v1/users/logout",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.status === 200) {
        navigate("/");
        notification.success({
          message: "Logout has Succes",
          description: "Logout successfully.",
          placement: "top",
        });
      } else if (response.status === 401) {
        // Handle unauthorized response (e.g., redirect to login or clear session)
        console.log("Session expired, redirecting to login...");
        navigate("/");
        notification.error({
          message: "Failed to Logout",
          description: "Failed to Logout Check Your Conettion.",
          placement: "top",
        });
      } else if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }

      console.log("Logout successful");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Funcation Untuk Mempersingkat Tampilan Original Link Agar Lebih Pendek
  const truncateUrl = (url: string, maxLength = 20) => {
    if (!url) return "";
    if (url.length <= maxLength) return url;
    const start = url.slice(0, 20);
    return `${start}...`;
  };

  // Funcation Untuk Mengvalidasi Link Original
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

  // Funcation Untuk Mengvalidasi Link Original
  const handleShorten = async () => {
    if (!originalUrl || !validateUrl(originalUrl)) {
      // alert("Please enter a valid URL.");
      notification.info({
        message: "Invalid URL",
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

  useEffect(() => {
    // Funcation Untuk Menampilkan Data Yang Sudah Pernah di Buat
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

        const response = await fetch(
          "https://shortlink-production-dnd.up.railway.app/api/v1/urls",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            console.error(
              "Unauthorized access - possible invalid or expired token."
            );
            localStorage.removeItem("authToken");
            navigate("/main-menu");
          } else {
            console.error(
              "Failed to fetch URLs. Status code:",
              response.status
            );
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
          createdAt: formatDate(item.createdat) || "N/A",
          lastAccessedAt: formatDate(item.lastaccesedat) || null,
          qrCodeUrl: item.qr_code || "",
        }));

        // Fungsi untuk memformat tanggal
        function formatDate(dateString: string): string {
          if (!dateString) return ""; // Jika tidak ada tanggal
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return ""; // Pastikan validitas tanggal

          // Ambil bulan dalam format angka (1 - 12) dan tahun, hari
          const month = date.getMonth() + 1; // Menambahkan 1 agar bulan dimulai dari 1
          const day = date.getDate();
          const year = date.getFullYear();

          // Formatkan tanggal dengan bulan berupa angka
          return `${day}-${month < 10 ? "0" + month : month}-${year}`;
        }

        setShortLinks(links);
        console.log(links); // Log the final links array
      } catch (error) {
        console.error("Error fetching URLs:", error);
      }
    };

    showAllURLs();
  }, [id, navigate]);

  // Format Penanggalan
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString); // Ubah string ISO ke objek Date
    const day = date.getDate().toString().padStart(2, "0"); // Ambil tanggal
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ambil bulan
    const year = date.getFullYear(); // Ambil tahun

    return `${day}-${month}-${year}`; // Format DD-MM-YYYY
  };

  // Handle Yang digunakan Untuk Menggenerate Shortlink
  const handlePopupSubmit = async () => {
    // Check for required fields and show error notification if empty
    if (!customSlug || !customTitle || !originalUrl) {
      notification.error({
        message: "Form Incomplete",
        description:
          "Please complete all fields including original URL, custom slug, and custom title.",
        placement: "top",
      });
      return;
    }

    try {
      const bodyData = {
        url: originalUrl,
        shortlink: customSlug,
        url_title: customTitle,
        expiredTime: expiredTime || null,
      };

      console.log("Request Body:", bodyData);

      const response = await fetch(
        "https://shortlink-production-dnd.up.railway.app/api/v1/urls",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          credentials: "include",
          body: JSON.stringify(bodyData),
        }
      );

      if (!response.ok) {
        const errorText = await response.json();
        console.error(`Error: ${errorText.message}`);
        notification.error({
          message: "Failed to create a shortened link. ",
          description:
            "The alias already exists. Please use a different one or let the system generate it automatically.",
          placement: "top",
        });
        return;
      }

      const data = await response.json();
      const newLink = {
        id: data.data.url_details.id,
        shortLink: `https://dnd.id/${data.data.shortlink}`,
        originalUrl: originalUrl,
        title: data.data.url_details.url_title,
        clicks: data.data.url_details.clickcount,
        status: "active", // Default status as active
        createdAt: formatDate(data.data.url_details.createdat), // Format tanggal
        lastAccessedAt: data.data.url_details.lastaccesedat
          ? formatDate(data.data.url_details.lastaccesedat)
          : null, // Format tanggal jika ada
        qrCodeUrl: data.data.url_details.qr_code,
      };

      // Check if the link is expired
      if (expiredTime && new Date(expiredTime) < new Date()) {
        newLink.status = "expired"; // Update status if expired
        notification.warning({
          message: "Link Expired",
          description: "This link has expired.",
          placement: "top",
        });
      }

      if (customTitle) {
        bodyData.url_title = customTitle; // Add customTitle if provided
      }

      setShortLinks([newLink, ...shortLinks]);
      setOriginalUrl("");
      setCustomSlug("");
      setExpiredTime(null);
      setCustomTitle("");
      setIsPopupOpen(false);
    } catch (error) {
      console.error("Error fetching API:", error);
      notification.error({
        message: "Error",
        description: "An unexpected error occurred while creating the link.",
        placement: "top",
      });
    }
  };

  // Fncation Yang Bekerja sebagai Generate QR CODE
  const QrCodePopup: React.FC<QrCodePopupProps> = ({ qrCodeUrl, onClose }) => {
    // Funcation Untuk Download QR CODE
    const handleDownload = () => {
      const link = document.createElement("a");
      link.href = `data:image/png;base64,${qrCodeUrl}`;
      link.download = "shortlink-title.png";
      link.click();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white flex flex-col items-center p-6 rounded-lg shadow-lg w-11/12 md:w-[300px]">
          <h2 className="text-xl md:text-2xl font-bold mb-4">
            Download QR Code
          </h2>
          <img
            src={`data:image/png;base64,${qrCodeUrl}`}
            alt="QR Code"
            className="w-[100%] h-[50%] mb-4"
          />
          <div className="flex justify-between gap-10">
            <button
              onClick={handleDownload}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              <DownloadOutlined />
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
            >
              <CloseOutlined />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Handle untuk membuka bagian QR Code
  const handleQrCodeClick = (link: ShortLink) => {
    setSelectedQrCode(link);
  };

  const onClick: MenuProps["onClick"] = ({ key }) => {
    console.log(`Click on item ${key}`);
  };

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
      {/* Input Edit Shortlink */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit Shortlink</h2>
            <label
              htmlFor="shortlink"
              className="block text-sm font-medium text-gray-700"
            >
              New Shortlink
            </label>
            <input
              id="shortlink"
              type="text"
              value={newShortlink}
              onChange={(e) => setNewShortlink(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setIsEditOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Input Original Link */}
      <div className="jawir flex md:flex-row justify-center sm:w-[768px] md:w-[1075px] w-[1075px] py-1 px-2 bg-white rounded-full border-4 border-blue-600 ">
        <input
          type="text"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          placeholder="Enter original URL"
          className=" p-3 border-gray-300 text-xs flex-1 rounded-lg"
        />
        <button
          onClick={handleShorten}
          className="bg-blue-600 text-white px-4 py-2 text-xs flex-shrink-0 min-w[100px] w-fit font-semibold rounded-full"
        >
          Shorten now
        </button>
      </div>
      {/* Edit Popup */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit Shortlink</h2>
            <label
              htmlFor="shortlink"
              className="block text-sm font-medium text-gray-700"
            >
              New Shortlink
            </label>
            <input
              id="shortlink"
              type="text"
              value={newShortlink}
              onChange={(e) => setNewShortlink(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
            <div className="mt-4 flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setIsEditOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Navigasi */}
      <div className="flex justify-center gap-5 mt-4">
        <button
          onClick={() => navigate("/main-menu")}
          className="border-b-4 font-semibold text-blue-500 border-blue-500 "
        >
          Shortlink
        </button>
        <button
          onClick={() => navigate("/analisis")}
          className="font-semibold border-blue-500 hover:text-blue-500"
        >
          Analytics
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
                  <button onClick={() => navigate(`/analisis/${link.id}`)}>
                    {link.clicks}
                  </button>
                  <div className="flex items-center justify-center">
                    <img
                      src={`data:image/png;base64,${link.qrCodeUrl}`}
                      alt="QR Code"
                      className="qr-code w-16 h-16 my-1"
                      onClick={() => handleQrCodeClick(link)}
                    />
                  </div>
                  <div className="items-center justify-center">
                    <Space direction="horizontal" wrap>
                      <Dropdown
                        menu={{ items: items(link), onClick }}
                        placement="top"
                        className="flex"
                        onVisibleChange={(visible) =>
                          visible && setSelectedLink(link)
                        }
                      >
                        <a onClick={(e) => e.preventDefault()}>
                          <Space direction="horizontal">
                            <MoreOutlined
                              style={{
                                fontSize: "40px",
                                cursor: "pointer",
                                transform: "rotate(90deg)",
                                fontWeight: "bold",
                              }}
                            />
                          </Space>
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
