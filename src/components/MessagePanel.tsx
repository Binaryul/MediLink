import { useState } from "react";
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
