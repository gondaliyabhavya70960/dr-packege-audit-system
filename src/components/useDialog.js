import { useEffect, useRef } from 'react';

// Accessible modal behaviour for the overlay components (player, back-confirm,
// tour): Esc to close, focus trap, and focus restore to the trigger on close.
// Purely additive — existing close buttons/behaviour are unchanged. Attach the
// returned ref to the dialog surface (also give it role="dialog"
// aria-modal="true" tabIndex={-1} and aria-labelledby).
export default function useDialog(onClose) {
  const ref = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const previouslyFocused = typeof document !== 'undefined' ? document.activeElement : null;
    const SELECTOR =
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const focusables = () => Array.from(node.querySelectorAll(SELECTOR)).filter((el) => el.offsetParent !== null);

    // move focus into the dialog
    const first = focusables()[0];
    (first || node).focus({ preventScroll: true });

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current && onCloseRef.current();
        return;
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (items.length === 0) {
          e.preventDefault();
          return;
        }
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, []);

  return ref;
}
