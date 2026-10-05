import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { useNotifications } from '../../contexts/NotificationContext.js';
import { UserAvatar } from './UserAvatar.js';

interface TopNavbarProps {
  onToggleSidebar: () => void;
  pageTitle?: string;
  breadcrumbs?: string[];
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onToggleSidebar,
  pageTitle = 'Dashboard',
  breadcrumbs = [],
}) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (item: any) => {
    markAsRead(item._id);
    if (item.link) {
      navigate(item.link);
      setShowNotifications(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-border sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-subtle">
      {/* Left: Mobile menu button & Title/Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 lg:hidden text-neutral-secondary hover:text-neutral-dark hover:bg-neutral-light rounded-btn transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-secondary font-medium mb-0.5">
              <span>Platform</span>
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  <span>/</span>
                  <span>{b}</span>
                </React.Fragment>
              ))}
            </div>
          )}
          <h2 className="text-base sm:text-lg font-bold text-[#1F2937] leading-tight">{pageTitle}</h2>
        </div>
      </div>

      {/* Right: Notifications & Quick Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-neutral-secondary hover:text-[#17B2BA] hover:bg-[#1DCED8]/10 rounded-full transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#FF9D50] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-neutral-border rounded-card shadow-2xl z-50 overflow-hidden animate-fadeIn">
              <div className="p-3.5 border-b border-neutral-border bg-neutral-light/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1F2937] uppercase tracking-wider">Notifications</h4>
                  <p className="text-[11px] text-neutral-secondary">{unreadCount} unread update(s)</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-[#17B2BA] hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-neutral-border/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-secondary">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 hover:bg-[#FFF9D8]/30 transition-colors cursor-pointer flex items-start gap-2.5 ${
                        !item.isRead ? 'bg-[#1DCED8]/5 font-medium' : ''
                      }`}
                    >
                      <div
                        className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                          !item.isRead ? 'bg-[#1DCED8]' : 'bg-transparent'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#1F2937] leading-snug">{item.title}</p>
                        <p className="text-[11px] text-neutral-secondary mt-0.5 leading-relaxed">{item.message}</p>
                        <p className="text-[10px] text-neutral-secondary/80 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()} at{' '}
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {item.link && <ExternalLink className="w-3.5 h-3.5 text-neutral-secondary/60 flex-shrink-0 mt-1" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div
          onClick={() => navigate('/profile')}
          className="hidden sm:flex items-center gap-2 pl-3 border-l border-neutral-border cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="text-right">
            <p className="text-xs font-bold text-[#1F2937]">{user?.name}</p>
            <p className="text-[10px] font-medium text-[#E6853A] uppercase tracking-wider">{user?.role}</p>
          </div>
          <UserAvatar src={user?.avatar} name={user?.name} size="sm" />
        </div>
      </div>
    </header>
  );
};
