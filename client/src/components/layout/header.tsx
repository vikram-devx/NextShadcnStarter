import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { 
  Menu, Dices, LayoutDashboard, Users, Wallet, 
  History, LogOut, User, Settings, LogIn, Home,
  Sun, Moon
} from "lucide-react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Navigation links based on user role
  const getNavLinks = () => {
    const links = [
      { href: "/", label: "Home", icon: <Home className="h-4 w-4 mr-2" /> }
    ];

    if (user) {
      links.push({ 
        href: "/dashboard", 
        label: "Dashboard", 
        icon: <LayoutDashboard className="h-4 w-4 mr-2" /> 
      });
      links.push({ 
        href: "/markets", 
        label: "Markets", 
        icon: <Dices className="h-4 w-4 mr-2" /> 
      });
      
      if (user.role === 'admin' || user.role === 'subadmin') {
        links.push({ 
          href: "/users", 
          label: "Users", 
          icon: <Users className="h-4 w-4 mr-2" /> 
        });
      }
      
      links.push({ 
        href: "/transactions", 
        label: "Transactions", 
        icon: <Wallet className="h-4 w-4 mr-2" /> 
      });
      
      links.push({ 
        href: "/betting-history", 
        label: "Betting History", 
        icon: <History className="h-4 w-4 mr-2" /> 
      });
    }

    return links;
  };

  const navLinks = getNavLinks();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "G";
    
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    
    return user.name.substring(0, 2).toUpperCase();
  };

  // Get role color for avatar
  const getRoleColor = () => {
    if (!user) return "bg-slate-500";
    
    switch (user.role) {
      case 'admin': return "bg-red-500";
      case 'subadmin': return "bg-purple-500";
      case 'player': return "bg-green-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto max-w-7xl px-4 flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Dices className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-xl">Sata Matka</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className={`h-9 w-9 ${getRoleColor()}`}>
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email} 
                      </p>
                      <p className="text-xs mt-1 font-semibold text-primary">
                        {user.role.toUpperCase()} | ₹{user.wallet_balance.toFixed(2)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/transactions">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Transactions</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logout()}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log in
                </Link>
              </Button>
            )}
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className={`flex items-center text-base font-medium ${
                        location === link.href ? 'text-primary' : 'text-foreground'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                  
                  {user && (
                    <>
                      <Link 
                        href="/profile" 
                        className="flex items-center text-base font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                      
                      <button
                        className="flex items-center text-base font-medium text-red-600"
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </button>
                    </>
                  )}
                  
                  {!user && (
                    <Link 
                      href="/login" 
                      className="flex items-center text-base font-medium text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Log in
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  );
}
