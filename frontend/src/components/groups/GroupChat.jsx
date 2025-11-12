import React, { useState, useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import EmojiPicker from "emoji-picker-react";
import FloatingChatWindow from "../FloatingChatWindow";
import { useNavigate } from "react-router-dom";

// --- Utility Components & Icons (Unchanged) ---

const ProfileButton = ({ size = 36, onClick, name }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center justify-center rounded-full bg-purple-100 hover:bg-purple-200 border border-purple-300 shadow w-9 h-9 mr-2"
    title={`View profile of ${name}`}
    style={{ width: size, height: size }}
  >
    <svg
      width={size * 0.66}
      height={size * 0.66}
      viewBox="0 0 28 28"
      fill="none"
      stroke="#9254e8"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="14" cy="10" r="5" />
      <rect x="4" y="19" width="20" height="5" rx="2.5" />
    </svg>
  </button>
);

function isOnlyEmoji(str) {
  return (
    str &&
    str.trim().length &&
    str.trim().length <= 16 &&
    /^[\p{Emoji}\s]+$/u.test(str.trim())
  );
}

const IconSend = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" />
  </svg>
);
const IconTrash = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
  </svg>
);
const IconPushPin = ({ size = 16, filled = false }) =>
  filled ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="#9254e8"
    >
      <path d="M6.5 2a1 1 0 00-1 1v2a4.48 4.48 0 003 4.24V17a1 1 0 002 0v-7.76A4.48 4.48 0 0014.5 5V3a1 1 0 00-1-1h-7z" />
      <path d="M9 18a1 1 0 102 0v-1H9v1z" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="none"
      stroke="#9254e8"
      strokeWidth="1.2"
      viewBox="0 0 20 20"
    >
      <path d="M6.5 2a1 1 0 00-1 1v2a4.48 4.48 0 003 4.24V17a1 1 0 002 0v-7.76A4.48 4.48 0 0014.5 5V3a1 1 0 00-1-1h-7z" />
      <path d="M9 18a1 1 0 102 0v-1H9v1z" />
    </svg>
  );
const IconReply = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);
const IconClip = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const IconPoll = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M16 17v-4M12 17v-8M8 17v-12" />
    <rect width="20" height="16" x="2" y="3" rx="2" />
  </svg>
);
const IconEmoji = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" x2="9.01" y1="9" y2="9" />
    <line x1="15" x2="15.01" y1="9" y2="9" />
  </svg>
);
const FileIcon = ({ size = 16 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

// --- Helper Functions (Unchanged) ---

function normalizeMessage(m) {
  // Use a combined key to reduce duplicate keys, avoid Date.now() alone
  return {
    id:
      m.messageId ??
      m.id ??
      `${m.timestamp ?? Date.now()}_${m.senderId ?? "unknown"}`,
    content: m.content ?? m.message ?? m.text ?? "",
    senderId: m.senderId ?? m.userId ?? null,
    senderName: m.senderName ?? m.user ?? "Unknown",
    timestamp: m.timestamp ?? m.createdAt ?? new Date().toISOString(),
    messageType: m.messageType ?? "TEXT",
    attachment: m.attachment ?? null,
    replyToMessageId: m.replyToMessageId ?? null,
    replyToSenderName: m.replyToSenderName ?? null,
    replyToContent: m.replyToContent ?? null,
  };
}
const getChatDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// --- Main Chat Component ---

const GroupChat = ({
  groupId,
  groupName,
  groupColor,
  currentUser,
  userRole,
  openFloatingChat,
}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [polls, setPolls] = useState([]);
  const [pinnedIds, setPinnedIds] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const messagesEndRef = useRef(null);
  const canDeleteMessage = (m) => m.senderId === currentUser?.id;
  const navigate = useNavigate();

  const handleGroupButtonDoubleClickOrDrag = () => {
    if (openFloatingChat) {
      openFloatingChat({
        groupId,
        groupName,
        groupColor,
        currentUser,
        userRole,
      });
    } else {
      console.warn("openFloatingChat prop is NOT defined!");
    }
  };

  // --- Data Loading & WebSocket Logic (Unchanged) ---

  const loadHistory = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8145/api/groups/${groupId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data.map(normalizeMessage) : []);
      }
    } catch {}
  };

  const loadPinnedMessages = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8145/api/groups/${groupId}/pins`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setPinnedIds(data.map((p) => p.messageId));
      }
    } catch {}
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    let stomp = null;

    const connect = () => {
      try {
        const socket = new SockJS("http://localhost:8145/ws");
        stomp = Stomp.over(() => socket);
        stomp.debug = () => {};
        stomp.connect(
          { Authorization: `Bearer ${token}` },
          () => {
            setStompClient(stomp);
            stomp.subscribe(`/topic/group/${groupId}`, (msg) => {
              try {
                const data = JSON.parse(msg.body);
                setMessages((prev) => [...prev, normalizeMessage(data)]);
                if (data.poll) {
                  setPolls((prev) => [...prev, data.poll]);
                }
              } catch {}
            });
            loadHistory();
            loadPinnedMessages();
          },
          () => setTimeout(connect, 4000)
        );
      } catch {
        setTimeout(connect, 4000);
      }
    };
    connect();
    return () => {
      try {
        if (stomp) stomp.disconnect();
      } catch {}
    };
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pinnedIds]);

  // --- Message Handlers (Unchanged) ---

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !stompClient) return;
    if (!currentUser?.id) {
      alert("You must be logged in to send messages.");
      return;
    }
    const token = sessionStorage.getItem("token");
    const message = {
      groupId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: input,
      replyToMessageId: replyTo?.id || null,
      replyToSenderName: replyTo?.user || null,
      replyToContent: replyTo?.message || null,
      messageType: "TEXT",
    };
    try {
      stompClient.send(
        `/app/chat.sendMessage/${groupId}`,
        { Authorization: `Bearer ${token}` },
        JSON.stringify(message)
      );
      setInput("");
      setReplyTo(null);
      setShowEmoji(false);
    } catch {
      alert("Failed to send message. Try again.");
    }
  };

  const handleTogglePin = async (id) => {
    const isPinned = pinnedIds.includes(id);
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8145/api/groups/${groupId}/pins/messages/${id}`,
        {
          method: isPinned ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setPinnedIds((prev) =>
          prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
        );
      } else {
        alert("Failed to toggle pin.");
      }
    } catch (e) {
      alert("Pin toggle request failed.");
    }
  };

  const scrollToMessage = (id) => {
    const el = document.getElementById(`msg-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleDelete = async (id) => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:8145/api/groups/${groupId}/messages/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert("Failed to delete message.");
      }
    } catch (e) {
      alert("Delete request failed.");
    }
  };

  // Poll handlers omitted (use your existing ones, unchanged)

  const handleProfileClick = (senderId, senderName) => {
    alert(`Profile clicked: ${senderName} (${senderId})`);
  };

  // --- Render ---

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-purple-50 to-pink-50 w-full max-w-full">
      {/* --- STUNNING HEADER (UPDATED) --- */}
      <div className="w-full flex px-4 py-3 border-b bg-white shadow-sm sticky top-0 z-30 items-center gap-3">
        <button
          type="button"
          onDoubleClick={handleGroupButtonDoubleClickOrDrag}
          onDragStart={handleGroupButtonDoubleClickOrDrag}
          className="ml-3 px-6 py-2 rounded-xl shadow-lg shadow-orange-500/30 font-bold text-white
                     bg-gradient-to-r from-purple-600 to-orange-500
                     hover:from-purple-700 hover:to-orange-600 transition-all transform hover:scale-105 hover:shadow-orange-400/50"
        >
          {groupName || "Group Chat"}
        </button>

        {/* --- STUNNING SEARCH BAR (Unchanged) --- */}
        <div className="flex-1 flex justify-end items-center">
          <div className="relative w-64">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="block w-full pl-10 pr-4 py-2 bg-white text-purple-800 text-sm font-medium
                         border-2 border-purple-100 rounded-full
                         shadow-sm shadow-purple-500/10
                         focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-300
                         transition-all duration-300"
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
              <svg
                width={18}
                height={18}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" x2="16.65" y1="21" y2="16.65" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* --- Pinned Messages (Unchanged) --- */}
      {pinnedIds.length > 0 && (
        <div
          className="flex gap-2 overflow-x-auto px-4 py-2 bg-purple-50 border-t border-purple-200 shadow-md sticky top-[60px] z-20"
          style={{ whiteSpace: "nowrap" }}
        >
          {pinnedIds.map((id) => {
            const msg = messages.find((m) => m.id === id);
            if (!msg) return null;
            return (
              <div
                key={id}
                className="inline-block bg-purple-100 text-purple-800 py-1 px-3 rounded-full cursor-pointer select-none shadow"
                title={`${msg.senderName}: ${msg.content}`}
                onClick={() => scrollToMessage(id)}
              >
                {msg.content.length > 30
                  ? msg.content.slice(0, 27) + "..."
                  : msg.content}
              </div>
            );
          })}
        </div>
      )}

      {/* --- Message List --- */}
      <div className="flex-1 overflow-y-auto px-0 py-2">
        <div className="flex flex-col gap-2 w-full max-w-full">
          {messages
            .filter(
              (m) =>
                !search ||
                m.content?.toLowerCase().includes(search.toLowerCase()) ||
                m.senderName?.toLowerCase().includes(search.toLowerCase())
            )
            .map((m, i, arr) => {
              const isOwn = m.senderId === currentUser?.id;
              const dateLabel = getChatDateLabel(m.timestamp);
              let showDateSeparator =
                i === 0 || getChatDateLabel(arr[i - 1].timestamp) !== dateLabel;

              // ✅✅✅ --- 1. LIGHTER CHAT BUBBLES --- ✅✅✅
              const bubbleClass = isOwn
                ? "bg-gradient-to-r from-purple-200 to-pink-200 text-gray-800 rounded-2xl rounded-tr-lg px-4 py-2 shadow-md"
                : "bg-white border border-purple-100 rounded-2xl rounded-tl-lg px-4 py-2 shadow text-purple-900";

              const contentClass = isOnlyEmoji(m.content)
                ? "text-5xl md:text-6xl leading-none text-center py-3 select-none"
                : "text-sm break-words";

              return (
                <React.Fragment key={m.id}>
                  {/* Cleaner Date Separator */}
                  {showDateSeparator && (
                    <div className="flex justify-center my-3">
                      <div className="rounded-full px-4 py-1 bg-white border border-gray-200 text-xs text-gray-500 font-medium shadow-sm">
                        {dateLabel}
                      </div>
                    </div>
                  )}

                  {/* ✅✅✅ --- 2. HOVER OPTIONS FIX (Group) --- ✅✅✅ */}
                  <div
                    id={`msg-${m.id}`}
                    className={`flex items-end gap-2 w-full px-3 group ${
                      // Added "group"
                      isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwn && (
                      <ProfileButton
                        name={m.senderName}
                        onClick={() =>
                          handleProfileClick(m.senderId, m.senderName)
                        }
                      />
                    )}
                    <div className="relative flex flex-1 max-w-full">
                      <div
                        className={`${bubbleClass} w-fit max-w-[95vw] relative`} // Added "relative"
                        style={{
                          marginLeft: isOwn ? "auto" : "0",
                          marginRight: isOwn ? "0" : "auto",
                        }}
                      >
                        {/* ✅ Options Div - now inside bubble & appears on group-hover */}
                        <div
                          className={`absolute -top-4 ${
                            isOwn ? "left-2" : "right-2"
                          } 
                                          z-10 flex gap-1 items-center bg-white border border-gray-200 rounded-full shadow-lg 
                                          p-1 transition-all duration-150 ease-out
                                          scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100`}
                        >
                          <button
                            className="hover:bg-purple-100 rounded-full p-1"
                            style={{
                              minWidth: 24,
                              minHeight: 24,
                              lineHeight: 0,
                              color: "#9254e8", // Always purple
                            }}
                            onClick={() =>
                              setReplyTo({
                                id: m.id,
                                user: m.senderName,
                                message: m.content,
                              })
                            }
                            aria-label="Reply"
                          >
                            <IconReply size={14} />
                          </button>
                          <button
                            className="hover:bg-purple-100 rounded-full p-1"
                            style={{
                              minWidth: 24,
                              minHeight: 24,
                              lineHeight: 0,
                            }}
                            onClick={() => handleTogglePin(m.id)}
                            aria-label={
                              pinnedIds.includes(m.id) ? "Unpin" : "Pin"
                            }
                          >
                            <IconPushPin
                              size={15}
                              filled={pinnedIds.includes(m.id)}
                            />
                          </button>
                          {canDeleteMessage(m) && (
                            <button
                              className="hover:bg-red-100 rounded-full p-1"
                              style={{
                                minWidth: 24,
                                minHeight: 24,
                                lineHeight: 0,
                                color: "#E11D48", // Always red
                              }}
                              onClick={() => {
                                handleDelete(m.id);
                              }}
                              aria-label="Delete"
                            >
                              <IconTrash size={14} />
                            </button>
                          )}
                        </div>

                        {!isOwn && (
                          <div className="text-xs font-semibold text-purple-700 mb-1">
                            {m.senderName}
                          </div>
                        )}
                        {m.replyToMessageId && (
                          <div
                            className={`text-xs mb-1 border-l-2 pl-2 ${
                              isOwn
                                ? "border-gray-500/50 text-gray-700/80" // Dark text on light bubble
                                : "border-purple-300 text-gray-500"
                            }`}
                          >
                            Replying to {m.replyToSenderName}:{" "}
                            {m.replyToContent?.length > 50
                              ? m.replyToContent.slice(0, 47) + "..."
                              : m.replyToContent}
                          </div>
                        )}

                        <div className={contentClass}>{m.content}</div>

                        {m.messageType === "document" && (
                          <div
                            className={`flex items-center mt-2 text-xs rounded px-2 py-1 ${
                              isOwn
                                ? "border border-purple-300/50 bg-purple-100/50 text-purple-800" // Dark text
                                : "text-blue-700 border border-blue-100 bg-blue-50"
                            }`}
                          >
                            <FileIcon size={13} />{" "}
                            <span className="mx-2">{m.content}</span>
                            <button
                              className={`ml-2 underline ${
                                isOwn
                                  ? "text-purple-700 hover:text-purple-900" // Dark text
                                  : "text-blue-600 hover:text-blue-800"
                              }`}
                              onClick={async () => {
                                try {
                                  const token = sessionStorage.getItem("token");
                                  const res = await fetch(
                                    `http://localhost:8145/api/documents/${m.id}`,
                                    {
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                      },
                                    }
                                  );
                                  if (res.ok) {
                                    const blob = await res.blob();
                                    const url =
                                      window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = m.content; // Use the filename from message content
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                  } else {
                                    alert("Failed to download file");
                                  }
                                } catch (error) {
                                  alert("Download failed");
                                }
                              }}
                            >
                              DOWNLOAD
                            </button>
                          </div>
                        )}
                        <div
                          className={`text-xs mt-1 text-right ${
                            isOwn ? "text-gray-600/70" : "text-gray-400" // Dark text
                          }`}
                        >
                          {new Date(m.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* --- Reply Bar (Unchanged) --- */}
      {replyTo && (
        <div className="max-w-2xl mx-auto mb-2 bg-purple-50 rounded px-3 py-2 flex items-center justify-between">
          <span>
            Replying to <strong>{replyTo.user}</strong>: {replyTo.message}
          </span>
          <button
            onClick={() => setReplyTo(null)}
            className="text-xs p-1 text-purple-700"
          >
            Cancel
          </button>
        </div>
      )}

      {/* --- STUNNING INPUT BAR --- */}
      <div className="flex-none w-full border-t bg-white px-0 py-3 sticky bottom-0 shadow-lg z-10">
        <form
          className="max-w-full w-full mx-auto flex gap-1 items-center p-2"
          onSubmit={handleSend}
        >
          <button
            type="button"
            className="p-2 rounded-full text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition"
            onClick={() => setShowPollForm(true)}
            title="Create Poll"
          >
            <IconPoll />
          </button>
          <label className="p-2 cursor-pointer rounded-full text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition">
            <IconClip />
            <input
              type="file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("groupId", groupId);
                    formData.append("senderId", currentUser.id);
                    const token = sessionStorage.getItem("token");
                    const res = await fetch(
                      `http://localhost:8145/api/documents/upload`,
                      {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` },
                        body: formData,
                      }
                    );
                    if (res.ok) {
                      loadHistory(); // Refresh messages after upload
                    } else {
                      alert("Failed to upload file");
                    }
                  } catch (error) {
                    alert("Upload failed");
                  }
                }
                e.target.value = null; // Reset input
              }}
            />
          </label>
          <button
            type="button"
            className="p-2 rounded-full text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition"
            onClick={() => setShowEmoji((v) => !v)}
            title="Emoji"
          >
            <IconEmoji />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-full text-purple-800
                       focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-400 transition"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {/* UPDATED SEND BUTTON */}
          <button
            type="submit"
            className="rounded-full font-semibold text-white shadow-xl shadow-purple-500/60 flex items-center justify-center
                       w-11 h-11
                       bg-purple-500
                       p-1
                       transition-all duration-100 ease-in
                       hover:shadow-purple-600/80
                       active:scale-90 active:shadow-inner
                       disabled:opacity-50 disabled:shadow-none"
            disabled={!input.trim()}
          >
            {/* Inner Circle */}
            <div className="w-full h-full rounded-full bg-gradient-to-r from-orange-400 to-pink-400 flex items-center justify-center">
              <IconSend
                size={
                  window.innerWidth < 400
                    ? 18
                    : window.innerWidth < 740
                    ? 20
                    : 22
                }
              />
            </div>
          </button>
        </form>
        {showEmoji && (
          // Safer Emoji Picker Position
          <div className="absolute right-4 bottom-20 z-20 bg-white rounded-2xl shadow-xl p-2 border border-gray-200">
            <EmojiPicker
              onEmojiClick={(emojiData) =>
                setInput((prevInput) => prevInput + emojiData.emoji)
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupChat;
