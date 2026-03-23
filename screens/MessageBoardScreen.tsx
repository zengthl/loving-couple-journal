import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Heart, MessageCircleHeart, Send } from 'lucide-react';

interface MessageBoardEntry {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface MessageBoardScreenProps {
  onBack: () => void;
}

const STORAGE_KEY = 'loving-message-board-v1';

const seedMessages: MessageBoardEntry[] = [
  {
    id: 'seed-1',
    author: 'ZTHL',
    content: '以后每次看到晚霞，都想起我们牵着手往海里走的那一刻。',
    createdAt: '2026-03-20T20:16:00.000Z',
  },
  {
    id: 'seed-2',
    author: 'DYQ',
    content: '如果爱有形状，那应该就是我们一起留下来的这些小日子。',
    createdAt: '2026-03-21T10:28:00.000Z',
  },
  {
    id: 'seed-3',
    author: 'Visitor',
    content: '愿看到这里的人，也都能被认真地爱着。',
    createdAt: '2026-03-22T14:08:00.000Z',
  },
];

const formatMessageTime = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const MessageBoardScreen: React.FC<MessageBoardScreenProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<MessageBoardEntry[]>(seedMessages);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MessageBoardEntry[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Fall back to seed messages if localStorage is unavailable.
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore storage failures and keep the in-memory board usable.
    }
  }, [messages]);

  const canSubmit = content.trim().length > 0;

  const orderedMessages = useMemo(
    () =>
      [...messages].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [messages],
  );

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    const entry: MessageBoardEntry = {
      id: `${Date.now()}`,
      author: author.trim() || 'Visitor',
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [entry, ...current]);
    setAuthor('');
    setContent('');
  };

  return (
    <div className="min-h-full bg-[#fffaf8]">
      <div className="sticky top-0 z-30 border-b border-[#f4e6e4] bg-[#fffaf8]/92 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-text-main shadow-sm transition hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-primary/60 uppercase">Message Board</p>
            <h1 className="mt-1 text-[26px] font-black tracking-tight text-[#4a3434]">留言板</h1>
          </div>
        </div>
      </div>

      <div className="px-5 pb-28 pt-5">
        <div className="rounded-[28px] bg-gradient-to-br from-[#fff3f6] via-white to-[#fff6ef] p-5 shadow-[0_18px_50px_rgba(245,166,163,0.15)]">
          <div className="flex items-center gap-2 text-primary">
            <MessageCircleHeart size={18} />
            <span className="text-sm font-semibold tracking-[0.18em] uppercase">Leave A Note</span>
          </div>

          <p className="mt-3 text-sm leading-6 text-text-sub">
            把想说的话留在这里，让每一次打开都能看到新的温柔。
          </p>

          <div className="mt-5 space-y-3">
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="署名（可选）"
              className="w-full rounded-2xl border border-[#f2d7d7] bg-white px-4 py-3 text-sm text-text-main outline-none transition focus:border-primary/60"
            />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="写下一句想留下的话..."
              rows={4}
              className="w-full rounded-2xl border border-[#f2d7d7] bg-white px-4 py-3 text-sm leading-6 text-text-main outline-none transition focus:border-primary/60"
            />
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-bold tracking-[0.14em] text-white transition ${
                canSubmit
                  ? 'bg-primary shadow-[0_18px_40px_rgba(245,166,163,0.28)] hover:scale-[1.01]'
                  : 'cursor-not-allowed bg-[#d8c9c7]'
              }`}
            >
              <Send size={16} />
              发布留言
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {orderedMessages.map((message) => (
            <article
              key={message.id}
              className="rounded-[26px] border border-[#f4e6e4] bg-white p-5 shadow-[0_12px_30px_rgba(74,59,59,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-[#4a3434]">{message.author}</h2>
                  <p className="mt-1 text-xs font-medium tracking-[0.08em] text-text-sub uppercase">
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Heart size={16} className="fill-current" />
                </span>
              </div>

              <p className="mt-4 text-[15px] leading-7 text-text-main">{message.content}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};
