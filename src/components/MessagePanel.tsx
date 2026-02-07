import { useEffect, useState } from "react";
import styles from "./MessagePanel.module.css";

export interface MessagePanelItem {
  id: number | string;
  sender: string;
  body: string;
  time: string;
  side: "left" | "right";
}

interface MessagePanelProps {
  title: string;
  messages: MessagePanelItem[];
  inputPlaceholder?: string;
  onSend?: (message: string) => Promise<void> | void;
}

interface MessagePanelContainerProps {
  title: string;
  fetchUrl: string;
  postUrl: string;
  currentUserId?: string | null;
  otherLabel: string;
  inputPlaceholder?: string;
}

function formatTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

function mapMessages(
  messages: Array<{ sender?: string; message?: string; timestamp?: string }>,
  currentUserId: string | null | undefined,
  otherLabel: string,
): MessagePanelItem[] {
  return messages.map((message) => ({
    id: `${message.sender || "unknown"}-${message.timestamp || ""}`,
    sender: currentUserId && message.sender === currentUserId ? "You" : otherLabel,
    body: message.message || "",
    time: message.timestamp || "",
    side: currentUserId && message.sender === currentUserId ? "right" : "left",
  }));
}

export function MessagePanelContainer({
  title,
  fetchUrl,
  postUrl,
  currentUserId,
  otherLabel,
  inputPlaceholder = "Type your message...",
}: MessagePanelContainerProps) {
  const [messages, setMessages] = useState<MessagePanelItem[]>([]);
  const [messagesError, setMessagesError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function loadMessages() {
    try {
      setIsLoading(true);
      const response = await fetch(fetchUrl, { credentials: "include" });
      const result = await response.json();
      if (response.ok) {
        const mapped = mapMessages(result.messages || [], currentUserId, otherLabel);
        setMessages(mapped);
        setMessagesError("");
      } else {
        setMessagesError(result.error || "Unable to load messages.");
      }
    } catch {
      setMessagesError("Unable to load messages.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isActive = true;

    async function fetchMessages() {
      try {
        await loadMessages();
        if (!isActive) {
          return;
        }
      } catch {
        if (!isActive) {
          return;
        }
        setMessagesError("Unable to load messages.");
      }
    }

    fetchMessages();

    return () => {
      isActive = false;
    };
  }, [fetchUrl, currentUserId, otherLabel]);

  async function handleSendMessage(message: string) {
    const timestamp = formatTimestamp(new Date());
    const response = await fetch(postUrl, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, timestamp }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessagesError(result.error || "Unable to send message.");
      return;
    }
    await loadMessages();
  }

  return (
    <>
      {isLoading && <div>Loading messages...</div>}
      <MessagePanel
        title={title}
        messages={messages}
        inputPlaceholder={messagesError || inputPlaceholder}
        onSend={handleSendMessage}
      />
    </>
  );
}

function MessagePanel({
  title,
  messages,
  inputPlaceholder = "Type your message...",
  onSend,
}: MessagePanelProps) {
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function handleSend() {
    if (!onSend || !messageText.trim()) {
      return;
    }
    try {
      setIsSending(true);
      await onSend(messageText.trim());
      setMessageText("");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      <div className={styles.chatPanel}>
        <div className={styles.chatMessages}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.chatBubble} ${
                message.side === "right"
                  ? styles.chatBubbleRight
                  : styles.chatBubbleLeft
              }`}
            >
              <div className={styles.chatSender}>{message.sender}</div>
              <div className={styles.chatBody}>{message.body}</div>
              <div className={styles.chatTime}>{message.time}</div>
            </div>
          ))}
        </div>
        <div className={styles.chatInputRow}>
          <input
            className={styles.chatInput}
            type="text"
            placeholder={inputPlaceholder}
            aria-label={inputPlaceholder}
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            disabled={!onSend || isSending}
          />
          <button
            className={styles.primaryButton}
            type="button"
            onClick={handleSend}
            disabled={!onSend || isSending || !messageText.trim()}
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default MessagePanel;
