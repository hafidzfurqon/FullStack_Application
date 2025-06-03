"use client";
import { Inbox, LayoutDashboardIcon, Package } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { User } from "@/app/products/cart/page";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Product",
    url: "/dashboard/products",
    icon: Inbox,
  },
];

export function AppSidebar({ userData }: any) {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r">
      <SidebarContent>
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">StoreAdmin</h2>
              <p className="text-xs text-muted-foreground">
                Product Management
              </p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-3">
            <SidebarMenu className="gap-1">
              {items.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url !== "/dashboard" && pathname.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                          "hover:bg-accent hover:text-accent-foreground",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive && [
                            "bg-primary text-primary-foreground shadow-sm",
                            "hover:bg-primary/90",
                          ]
                        )}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
                        )}

                        {/* Icon */}
                        <item.icon
                          className={cn(
                            "w-5 h-5 transition-all duration-200",
                            isActive
                              ? "text-primary-foreground"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "font-medium truncate transition-colors duration-200",
                                isActive
                                  ? "text-primary-foreground"
                                  : "text-foreground"
                              )}
                            >
                              {item.title}
                            </span>
                          </div>

                          {/* Description - only show on hover for non-active items */}
                        </div>

                        {/* Hover indicator */}
                        {!isActive && (
                          <div className="absolute inset-0 rounded-lg bg-accent/0 group-hover:bg-accent/50 transition-all duration-200 pointer-events-none" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">AD </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userData?.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {userData?.email}
              </p>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
