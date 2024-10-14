import React, { useState } from 'react';
// import { Alert, AlertDescription } from '@/components/ui/alert';

interface ShortLink {
  shortLink: string;
  title: string;
  originalLink: string;
  customLink?: string;
  password?: string;
  clicks: number;
  status: 'active' | 'expired';
  date: string;
}

function App() {
  const [shortlinks, setShortlinks] = useState<ShortLink[]>([]);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [showProtectModal, setShowProtectModal] = useState<boolean>(false);
  const [customLink, setCustomLink] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [editLink, setEditLink] = useState<ShortLink | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [currentLink, setCurrentLink] = useState<ShortLink | null>(null);
  const [enteredPassword, setEnteredPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  const handleShorten = () => {
    const randomSlug = customLink || Math.random().toString(36).substring(2, 8);
    const shortLink = `https://dnd.id/${randomSlug}`;
    const newLink: ShortLink = {
      shortLink,
      title: title || 'Untitled',
      originalLink: originalUrl,
      clicks: 0,
      password,
      status: 'active',
      date: expiryDate || '12 Aug - 12 Sept',
    };
    setShortlinks([newLink, ...shortlinks]);
    setShowProtectModal(false);
    resetForm();
  };

  const resetForm = () => {
    setOriginalUrl('');
    setTitle('');
    setCustomLink('');
    setPassword('');
    setExpiryDate('');
  };

  const handleVisit = (link: ShortLink) => {
    if (link.password) {
      setCurrentLink(link);
      setShowPasswordModal(true);
    } else {
      window.open(link.originalLink, '_blank');
      updateClickCount(link);
    }
  };

  const updateClickCount = (link: ShortLink) => {
    const updatedLinks = shortlinks.map((l) =>
      l.shortLink === link.shortLink ? { ...l, clicks: l.clicks + 1 } : l
    );
    setShortlinks(updatedLinks);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (originalUrl) {
      setShowProtectModal(true);
    }
  };

  const handleEdit = (link: ShortLink) => {
    setEditLink(link);
    setTitle(link.title);
    setOriginalUrl(link.originalLink);
    setCustomLink(link.customLink || '');
    setPassword(link.password || '');
    setExpiryDate(link.date);
    setIsEditMode(true);
    setShowProtectModal(true);
  };

  const handleSaveEdit = () => {
    if (editLink) {
      const updatedLinks = shortlinks.map((l) =>
        l.shortLink === editLink.shortLink
          ? {
              ...l,
              title,
              originalLink: originalUrl,
              customLink,
              password,
              date: expiryDate,
            }
          : l
      );
      setShortlinks(updatedLinks);
      setIsEditMode(false);
      setShowProtectModal(false);
      resetForm();
    }
  };

  const truncateUrl = (url: string, maxLength: number = 30) => {
    return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentLink && enteredPassword === currentLink.password) {
      window.open(currentLink.originalLink, '_blank');
      updateClickCount(currentLink);
      setShowPasswordModal(false);
      setEnteredPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const protectLinkModal = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? 'Edit Your Link' : 'Protect Your Link'}
        </h2>
        <div className="mb-4">
          <label className="block text-sm">Title:</label>
          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Enter title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Custom Link:</label>
          <input
            type="text"
            className="border p-2 w-full"
            placeholder="Custom link (optional)"
            value={customLink}
            onChange={(e) => setCustomLink(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Password Protection:</label>
          <input
            type="password"
            className="border p-2 w-full"
            placeholder="Enter password (optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm">Expiry Date:</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={isEditMode ? handleSaveEdit : handleShorten}
        >
          {isEditMode ? 'Save Changes' : 'Save & Shorten'}
        </button>
      </div>
    </div>
  );

  const passwordModal = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Enter Password</h2>
        <form onSubmit={handlePasswordSubmit}>
          <div className="mb-4">
            <input
              type="password"
              className="border p-2 w-full"
              placeholder="Enter password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
            />
          </div>
          {passwordError}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Submit
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <header className="w-full flex justify-between items-center p-4 bg-white shadow-md">
        <div className="text-blue-600 font-bold text-xl">DnD</div>
      </header>

      <div className="mt-8 w-full max-w-4xl">
        <form onSubmit={handleSubmit} className="flex items-center bg-white p-4 rounded-lg shadow-md mb-6">
          <input
            type="text"
            className="flex-grow p-2 border rounded-lg outline-none"
            placeholder="Enter the link here"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
          />
          <button type="submit" className="ml-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
            Shorten Now!
          </button>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg w-full max-w-7xl">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 text-left">Short Link</th>
              <th className="p-4 text-center">Title</th>
              <th className="p-4 text-left">Original Link</th>
              <th className="p-4 text-center">Clicks</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Date</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shortlinks.length > 0 ? (
              shortlinks.map((link, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-4">
                    <button
                      onClick={() => handleVisit(link)}
                      className="text-blue-600 underline"
                    >
                      {link.shortLink}
                    </button>
                  </td>
                  <td className="p-4 text-center">{link.title}</td>
                  <td className="p-4">
                    <span className="text-gray-600">
                      {truncateUrl(link.originalLink)}
                    </span>
                  </td>
                  <td className="p-4 text-center">{link.clicks}</td>
                  <td className="p-4 text-center">
                    {link.status === 'active' ? (
                      <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full">active</span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full">expired</span>
                    )}
                  </td>
                  <td className="p-4 text-center">{link.date}</td>
                  <td className="p-4 flex space-x-2 justify-center">
                    <button onClick={() => handleEdit(link)} className="text-blue-600">
                      <Edit size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center">
                  No links available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showProtectModal && protectLinkModal}
      {showPasswordModal && passwordModal}
    </div>
  );
}

export default App;