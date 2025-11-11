import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  work: string;
}

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Инспектор Петров',
    avatar: 'ИП',
    lastMessage: 'Замечания по кровле требуют внимания',
    timestamp: '10:30',
    unread: 2,
    work: 'Замена кровли'
  },
  {
    id: '2',
    name: 'ООО "СтройМастер"',
    avatar: 'СМ',
    lastMessage: 'Когда планируется следующая проверка?',
    timestamp: 'Вчера',
    unread: 0,
    work: 'Ремонт фасада'
  },
  {
    id: '3',
    name: 'Администратор',
    avatar: 'А',
    lastMessage: 'Обновлена смета по объекту',
    timestamp: '05.10',
    unread: 1,
    work: 'Система'
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Добрый день! Проверка завершена',
    sender: 'other',
    timestamp: '10:15'
  },
  {
    id: '2',
    text: 'Выявлены замечания по пункту 5.2.1',
    sender: 'other',
    timestamp: '10:16'
  },
  {
    id: '3',
    text: 'Здравствуйте! Принято, приступаем к устранению',
    sender: 'me',
    timestamp: '10:25'
  },
  {
    id: '4',
    text: 'Когда планируете завершить работы?',
    sender: 'other',
    timestamp: '10:27'
  },
  {
    id: '5',
    text: 'До конца недели все будет исправлено',
    sender: 'me',
    timestamp: '10:28'
  },
  {
    id: '6',
    text: 'Замечания по кровле требуют внимания',
    sender: 'other',
    timestamp: '10:30'
  },
];

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<Chat>(mockChats[0]);
  const [messageText, setMessageText] = useState('');

  const handleSend = () => {
    if (messageText.trim()) {
      setMessageText('');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Сообщения</h1>
        <p className="text-slate-600">Общение с заказчиками и подрядчиками</p>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-240px)]">
        <Card className="col-span-4">
          <ScrollArea className="h-full">
            <div className="p-4 border-b">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input placeholder="Поиск..." className="pl-10" />
              </div>
            </div>
            <div className="divide-y">
              {mockChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedChat.id === chat.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-[#2563EB] text-white">
                        {chat.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {chat.name}
                        </p>
                        <span className="text-xs text-slate-500">{chat.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-600 truncate mb-1">
                        {chat.lastMessage}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {chat.work}
                      </Badge>
                    </div>
                    {chat.unread > 0 && (
                      <Badge className="bg-[#2563EB]">
                        {chat.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="col-span-8 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-[#2563EB] text-white">
                    {selectedChat.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{selectedChat.name}</p>
                  <p className="text-sm text-slate-600">{selectedChat.work}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Icon name="Phone" size={20} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon name="MoreVertical" size={20} />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      message.sender === 'me'
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'me' ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Icon name="Paperclip" size={20} />
              </Button>
              <Button variant="ghost" size="sm">
                <Icon name="Image" size={20} />
              </Button>
              <Input
                placeholder="Введите сообщение..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1"
              />
              <Button onClick={handleSend}>
                <Icon name="Send" size={20} />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Messages;
