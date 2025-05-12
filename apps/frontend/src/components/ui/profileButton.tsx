import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useUser } from "@/lib/userContext";
import Link from "next/link";
import { Button } from "./button";

const ProfileButton = () => {
  const { logout, user } = useUser();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"outline"}
          className="flex items-center gap-2 cursor-pointer rounded-md p-3 py-5"
        >
          <Avatar className="h-8 w-8">
            {user?.avatar ? (
              <>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </>
            ) : (
              <AvatarFallback>
                <User />
              </AvatarFallback>
            )}
          </Avatar>
          <span className="font-medium">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/dashboard/shards" passHref>
          <DropdownMenuItem className="cursor-pointer">Shards</DropdownMenuItem>
        </Link>
        <Link href="/dashboard/images" passHref>
          <DropdownMenuItem className="cursor-pointer">Images</DropdownMenuItem>
        </Link>
        {user.role === "ADMIN" && (
          <>
            <DropdownMenuSeparator />
            <Link href="/dashboard/users" passHref>
              <DropdownMenuItem className="cursor-pointer">
                Users
              </DropdownMenuItem>
            </Link>
            <Link href="/dashboard/nodes" passHref>
              <DropdownMenuItem className="cursor-pointer">
                Nodes
              </DropdownMenuItem>
            </Link>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={logout}>
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileButton;
