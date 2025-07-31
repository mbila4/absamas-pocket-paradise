interface PlayerAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PlayerAvatar = ({ size = 'md', className = '' }: PlayerAvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-absama flex items-center justify-center font-bold text-accent-foreground shadow-absama-glow`}>
      <span>AS</span>
    </div>
  );
};