import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mic2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DownloadAppButton } from '@/components/DownloadAppButton';

const Navbar = forwardRef<HTMLElement>((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Songs', href: '/songs' },
    { name: 'Practice', href: '/practice' },
    { name: 'Leaderboard', href: '/leaderboard' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Mic2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">VoiceUp</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.href}>
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <DownloadAppButton />
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <NavLink to="/auth">Sign In</NavLink>
            </Button>
            <Button asChild className="gradient-primary text-primary-foreground font-semibold glow-primary">
              <NavLink to="/songs">Get Started</NavLink>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="text-foreground p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  className="py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <DownloadAppButton />
                <Button asChild variant="ghost" className="w-full justify-center">
                  <NavLink to="/auth" onClick={() => setIsOpen(false)}>
                    Sign In
                  </NavLink>
                </Button>
                <Button asChild className="w-full gradient-primary text-primary-foreground font-semibold">
                  <NavLink to="/songs" onClick={() => setIsOpen(false)}>
                    Get Started
                  </NavLink>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
