import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const shortcuts: ShortcutConfig[] = [
      // Navigation shortcuts
      { key: "d", altKey: true, action: () => navigate("/dashboard") },
      { key: "a", altKey: true, action: () => navigate("/analysis") },
      { key: "s", altKey: true, action: () => navigate("/sectors") },
      { key: "w", altKey: true, action: () => navigate("/watchlist") },
      { key: "h", altKey: true, action: () => navigate("/history") },
      { key: "n", altKey: true, action: () => navigate("/notifications") },
      
      // Quick actions
      { key: "/", ctrlKey: true, action: () => {
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }},
    ];

    const handleKeyDown = (event: KeyboardEvent) => {
      const matchedShortcut = shortcuts.find(
        (shortcut) =>
          shortcut.key === event.key &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.shiftKey === event.shiftKey
      );

      if (matchedShortcut) {
        event.preventDefault();
        matchedShortcut.action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);
};
