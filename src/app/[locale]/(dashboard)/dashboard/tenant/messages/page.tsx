'use client';

import React, { useState } from 'react';
import { Card } from '@/presentation/components/ui/Card';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Button } from '@/presentation/components/ui/Button';
import { Send, Phone, Info } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function TenantMessagesPage() {
  const [activeChat, setActiveChat] = useState(1);
  const [inputMsg, setInputMsg] = useState('');

  const [conversations] = useState([
    {
      id: 1,
      name: 'Trần Minh Tuấn',
      role: 'Chủ nhà trọ (Cầu Giấy)',
      unread: 0,
      time: '10:45',
      lastMessage: 'Anh đã nhận được lịch hẹn 9h30 thứ Bảy nhé em.',
    },
    {
      id: 2,
      name: 'Lê Văn Hoàng',
      role: 'Chủ nhà trọ (Quan Hoa)',
      unread: 1,
      time: 'Hôm qua',
      lastMessage: 'Phòng studio đó hiện vẫn còn trống em nhé.',
    },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Chào em, anh là Tuấn chủ nhà trọ ở Dịch Vọng Hậu.', time: '10:30' },
    { id: 2, sender: 'me', text: 'Dạ em chào anh Tuấn! Em vừa gửi lịch hẹn xem phòng 302 vào thứ Bảy ạ.', time: '10:35' },
    { id: 3, sender: 'them', text: 'Anh đã nhận được lịch hẹn 9h30 thứ Bảy nhé em. Đến đầu ngõ 92 gọi anh ra đón.', time: '10:45' },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'me',
        text: inputMsg,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setInputMsg('');
  };

  return (
    <div className="space-y-4 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Tin nhắn trao đổi
        </h1>
        <p className="text-xs text-stone-500">Trao đổi trực tiếp và tức thì với các chủ trọ.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 font-bold text-xs uppercase tracking-wider text-stone-400">
            Hội thoại gần đây
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800 overflow-y-auto flex-1">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveChat(c.id)}
                className={cn(
                  'w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer',
                  activeChat === c.id
                    ? 'bg-teal-50/70 dark:bg-teal-950/40'
                    : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                )}
              >
                <Avatar name={c.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">{c.name}</p>
                    <span className="text-[10px] text-stone-400 shrink-0">{c.time}</span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate mt-0.5">{c.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="md:col-span-2 p-0 overflow-hidden flex flex-col">
          <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/40">
            <div className="flex items-center gap-2.5">
              <Avatar name="Trần Minh Tuấn" size="sm" />
              <div>
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Trần Minh Tuấn</p>
                <p className="text-[10px] text-emerald-600">Đang hoạt động</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-mono">0912 345 678</span>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div key={m.id} className={cn('flex flex-col', isMe ? 'items-end' : 'items-start')}>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed',
                      isMe
                        ? 'bg-teal-700 text-white rounded-tr-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-tl-xs'
                    )}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 px-1">{m.time}</span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-stone-100 dark:border-stone-800 flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Nhập nội dung tin nhắn..."
              className="flex-1 bg-stone-50 dark:bg-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
            <Button type="submit" variant="primary" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Gửi
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

