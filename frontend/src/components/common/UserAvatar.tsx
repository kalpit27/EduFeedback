import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl font-extrabold',
  };

  if (src && !imageError) {
    return (
      <div
        className={`relative inline-block rounded-full overflow-hidden flex-shrink-0 border border-neutral-border bg-neutral-light shadow-subtle ${sizeClasses[size]} ${className}`}
      >
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full flex-shrink-0 font-bold bg-gradient-to-tr from-[#1DCED8] to-[#17B2BA] text-white shadow-subtle border border-white/40 ${sizeClasses[size]} ${className}`}
    >
      {initial}
    </div>
  );
};
