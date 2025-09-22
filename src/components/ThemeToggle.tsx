import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
    className?: string;
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'outline' | 'ghost' | 'link';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
    className = '', 
    size = 'default',
    variant = 'ghost'
}) => {
    const { theme, toggleTheme } = useTheme();

  return (
    <Button
        variant={variant}
        size={size}
        onClick={toggleTheme}
        className={`relative ${className}`}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
        <Sun className={`h-4 w-4 transition-all ${theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
        <Moon className={`absolute h-4 w-4 transition-all ${theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
        <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
