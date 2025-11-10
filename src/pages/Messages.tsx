import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import styles from './Messages.module.css';

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
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Сообщения</h1>
        <p className={styles.subtitle}>Общение с заказчиками и подрядчиками</p>
      </div>

      <div className={styles.gridContainer}>
        <Card className={styles.chatList}>
          <ScrollArea className="h-full">
            <div className={styles.searchSection}>
              <div className={styles.searchWrapper}>
                <Icon name="Search" className={styles.searchIcon} size={18} />
                <Input placeholder="Поиск..." className={styles.searchInput} />
              </div>
            </div>
            <div className={styles.chatListItems}>
              {mockChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`${styles.chatItem} ${selectedChat.id === chat.id ? styles.chatItemActive : ''}`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className={styles.chatItemContent}>
                    <Avatar>
                      <AvatarFallback className={styles.chatAvatar}>
                        {chat.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className={styles.chatInfo}>
                      <div className={styles.chatTopRow}>
                        <p className={styles.chatName}>
                          {chat.name}
                        </p>
                        <span className={styles.chatTimestamp}>{chat.timestamp}</span>
                      </div>
                      <p className={styles.chatLastMessage}>
                        {chat.lastMessage}
                      </p>
                      <Badge variant="outline" className={styles.chatWork}>
                        {chat.work}
                      </Badge>
                    </div>
                    {chat.unread > 0 && (
                      <Badge className={styles.chatUnread}>
                        {chat.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className={styles.chatWindow}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderContent}>
              <div className={styles.chatHeaderLeft}>
                <Avatar>
                  <AvatarFallback className={styles.chatAvatar}>
                    {selectedChat.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className={styles.chatHeaderInfo}>
                  <p className={styles.chatHeaderName}>{selectedChat.name}</p>
                  <p className={styles.chatHeaderWork}>{selectedChat.work}</p>
                </div>
              </div>
              <div className={styles.chatHeaderActions}>
                <Button variant="ghost" size="sm">
                  <Icon name="Phone" size={20} />
                </Button>
                <Button variant="ghost" size="sm">
                  <Icon name="MoreVertical" size={20} />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className={styles.chatMessages}>
            <div className={styles.messagesSpace}>
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.messageRow} ${message.sender === 'me' ? styles.messageRowMe : styles.messageRowOther}`}
                >
                  <div
                    className={`${styles.messageBubble} ${message.sender === 'me' ? styles.messageBubbleMe : styles.messageBubbleOther}`}
                  >
                    <p className={styles.messageText}>{message.text}</p>
                    <p
                      className={`${styles.messageTime} ${message.sender === 'me' ? styles.messageTimeMe : styles.messageTimeOther}`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className={styles.chatFooter}>
            <div className={styles.footerContent}>
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
                className={styles.footerInput}
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