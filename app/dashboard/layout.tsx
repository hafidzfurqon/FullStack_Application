"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/auth";
import { toast } from "sonner";
import { User } from "../products/cart/page";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [userAuthenticated, setUserAuthenticated] = useState<User | null>(null);
  const router = useRouter();
  const logout = async () => {
    // Hapus cookie access_token
    const response = apiCall.post("/logout");
    document.cookie =
      "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    toast.success("Logout Successfully!");

    // Redirect ke halaman login
    router.push("/");
    return response;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await apiCall.get("/me"); // Adjust endpoint as needed
        setUserAuthenticated(userData.data || userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast.error("Please login to continue");
        router.push("/");
      }
    };
    fetchUserData();
  }, [router]);
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar userData={userAuthenticated} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col w-full">
          {/* Top Panel */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              {/* Left side - Sidebar trigger */}
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden" />
                <div className="hidden md:block">
                  <SidebarTrigger />
                </div>
              </div>

              {/* Right side - User profile and actions */}
              <div className="flex items-center gap-2 sm:gap-4">
                <ModeToggle />
                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full p-0 hover:bg-accent"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src="/avatar/avatar.webp"
                          alt="User Avatar"
                        />
                        <AvatarFallback>
                          <UserIcon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {userAuthenticated?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {userAuthenticated?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Button
                        onClick={logout}
                        variant="destructive"
                        className="w-full"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 w-full overflow-auto">
            <div className="w-full max-w-none">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
