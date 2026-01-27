import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome back!
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">{user?.username}</p>
          <Badge variant="secondary" className="text-xs">
            {user?.role.toUpperCase()}
          </Badge>
        </div>
        <Avatar>
          <AvatarFallback className="bg-blue-100 text-blue-600">
            {user?.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}