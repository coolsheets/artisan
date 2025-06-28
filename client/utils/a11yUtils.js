// Keyboard navigation utils
export const handleKeyboardNavigation = (e, elements, callback) => {
  // Only process key events if modifier keys aren't held down
  if (e.ctrlKey || e.altKey || e.metaKey) return;
  
  const key = e.key;
  const currentFocus = document.activeElement;
  const currentIndex = Array.from(elements).indexOf(currentFocus);
  
  switch (key) {
    case 'ArrowDown':
    case 'ArrowRight':
      e.preventDefault();
      if (currentIndex < elements.length - 1) {
        elements[currentIndex + 1].focus();
      } else {
        elements[0].focus();
      }
      break;
    case 'ArrowUp':
    case 'ArrowLeft':
      e.preventDefault();
      if (currentIndex > 0) {
        elements[currentIndex - 1].focus();
      } else {
        elements[elements.length - 1].focus();
      }
      break;
    case 'Home':
      e.preventDefault();
      elements[0].focus();
      break;
    case 'End':
      e.preventDefault();
      elements[elements.length - 1].focus();
      break;
    case 'Enter':
    case ' ': // Space
      if (callback && currentFocus !== document.body) {
        e.preventDefault();
        callback(currentFocus);
      }
      break;
    default:
      break;
  }
};

// Provide better focus visible styles for accessibility
export const addFocusStyles = (element, colors) => {
  element.addEventListener('focus', () => {
    element.style.outline = `2px solid ${colors.primary}`;
    element.style.outlineOffset = '2px';
  });
  
  element.addEventListener('blur', () => {
    element.style.outline = 'none';
  });
};

// Screen reader announcements
export const announceToScreenReader = (message) => {
  const announcer = document.getElementById('sr-announcer') || createAnnouncer();
  announcer.textContent = message;
};

// Create screen reader announcer element
const createAnnouncer = () => {
  const announcer = document.createElement('div');
  announcer.id = 'sr-announcer';
  announcer.setAttribute('aria-live', 'polite');
  announcer.setAttribute('aria-atomic', 'true');
  announcer.style.position = 'absolute';
  announcer.style.width = '1px';
  announcer.style.height = '1px';
  announcer.style.padding = '0';
  announcer.style.margin = '-1px';
  announcer.style.overflow = 'hidden';
  announcer.style.clip = 'rect(0, 0, 0, 0)';
  announcer.style.whiteSpace = 'nowrap';
  announcer.style.border = '0';
  document.body.appendChild(announcer);
  return announcer;
};
