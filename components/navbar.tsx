"use client"

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, BookOpen, BarChart3, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ui/themeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const categories = [
  {
    name: "Web Development",
    icon: <BookOpen className="h-4 w-4" />,
    href: "/courses?category=web-dev",
  },
  {
    name: "Data Science",
    icon: <BarChart3 className="h-4 w-4" />,
    href: "/courses?category=data-science",
  },
  {
    name: "Business",
    icon: <Briefcase className="h-4 w-4" />,
    href: "/courses?category=business",
  },
];

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <nav
      className="border-b border-border/10 bg-background/80 backdrop-blur-md sticky top-0 z-40"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-xl text-foreground/80"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-xs shadow-sm">
              R
            </div>
            <span className="hidden sm:inline tracking-tighter">RIIDL</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-border/20 text-foreground/80 font-bold px-5 rounded-xl h-10 shadow-sm hover:bg-muted">
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-56"
              >
                {categories.map((category) => (
                  <DropdownMenuItem key={category.name} asChild>
                    <Link
                      href={category.href}
                      className="flex items-center gap-2 cursor-pointer py-2"
                    >
                      {category.icon}
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Bar */}
            <div className="relative w-64">
              <Input
                type="search"
                placeholder="Search courses..."
                className="pl-10 pr-4 bg-muted/30 border-border/10 rounded-xl h-10 focus:ring-2 focus:ring-primary/20 font-medium text-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Categories</h3>
                    {categories.map((category) => (
                      <Link
                        key={category.name}
                        href={category.href}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary text-foreground"
                      >
                        {category.icon}
                        {category.name}
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Search</h3>
                    <Input placeholder="Search courses..." />
                  </div>

                  <div className="space-y-2">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
