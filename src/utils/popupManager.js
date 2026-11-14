// Global popup coordinator to ensure only ONE popup is open across the website at any time
export const openPopup = (popupId) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:open-popup', { detail: popupId }));
  }
};

export const closeAllPopups = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('app:open-popup', { detail: null }));
  }
};
