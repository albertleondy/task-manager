import { useEffect, useRef, useId } from "react";

interface UseModalAccessibilityProps {
  isOpen: boolean;
  onClose: () => void;
}

export function useModalAccessibility<T extends HTMLElement>({
  isOpen,
  onClose,
}: UseModalAccessibilityProps) {
  const containerRef = useRef<T>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Focus trap / auto-focus
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }
  }, [isOpen]);

  return { containerRef, titleId };
}
