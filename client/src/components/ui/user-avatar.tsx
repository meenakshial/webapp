import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  // Get initials from user name or username
  const getInitials = () => {
    if (!user) return "U";
    
    const name = user.name || user.username || "";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Determine avatar size
  const avatarSize = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }[size];
  
  // Determine font size for initials
  const fontSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }[size];
  
  return (
    <Avatar className={avatarSize}>
      {user?.avatar && <AvatarImage src={user.avatar} alt={user.name || user.username || "User"} />}
      <AvatarFallback 
        className={`bg-primary text-primary-foreground ${fontSize}`}
      >
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}
