import { Bell, X, Calendar, Book, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const mockNotifications = [
  {
    id: 1,
    type: 'deadline',
    title: 'Assignment Deadline',
    message: 'Your Math 101 assignment is due tomorrow',
    date: '1 day',
    read: false,
  },
  {
    id: 2,
    type: 'course',
    title: 'New Course Material',
    message: 'New lecture has been uploaded for Physics 202',
    date: '2 days',
    read: false,
  },
  {
    id: 3,
    type: 'message',
    title: 'New Message',
    message: 'You received a message from Dr. Smith',
    date: '3 days',
    read: true,
  },
];

const NotificationsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const markAsRead = (id) => {
    setNotifications(
      notifications.map(n => n.id === id ? {...n, read: true} : n)
    );
  };
  
  const getIcon = (type) => {
    switch(type) {
      case 'deadline': return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'course': return <Book className="h-5 w-5 text-green-500" />;
      case 'message': return <MessageCircle className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-indigo-500" />;
    }
  };
  
  return (
    <div className="relative">
      <button 
        className="relative p-2 rounded-full hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5 text-indigo-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-indigo-100">
          <div className="flex justify-between items-center p-3 bg-indigo-50 border-b border-indigo-100">
            <h3 className="font-medium text-indigo-900">Notifications</h3>
            <button 
              className="text-indigo-500 hover:text-indigo-700"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 border-b border-indigo-50 hover:bg-indigo-50 cursor-pointer ${notification.read ? 'opacity-70' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex">
                    <div className="mr-3">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={`font-medium ${notification.read ? 'text-indigo-700' : 'text-indigo-900'}`}>{notification.title}</h4>
                        <span className="text-xs text-indigo-500">{notification.date}</span>
                      </div>
                      <p className="text-sm text-indigo-600 mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-indigo-500">
                No notifications
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-2 border-t border-indigo-100 text-center">
              <button className="text-sm text-indigo-600 hover:text-indigo-800">
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
