import { useContext } from 'react';
import { ThemeContext } from '../pages/index';

// Custom hook to easily access the theme context
export function useTheme() {
  return useContext(ThemeContext);
}

// Theme styles for consistent UI
export function getThemeStyles(theme) {
  const themes = {
    light: {
      background: '#ffffff',
      text: '#343a40',
      secondaryText: '#6c757d',
      border: '#dee2e6',
      cardBg: '#f8f9fa',
      primary: '#0d6efd',
      primaryHover: '#0b5ed7',
      success: '#198754',
      info: '#0dcaf0', 
      accent: '#6f42c1',
      warning: '#ffc107',
      danger: '#dc3545',
      buttonText: '#ffffff',
      inputBg: '#ffffff',
      shadowColor: 'rgba(0, 0, 0, 0.1)'
    },
    dark: {
      background: '#212529',
      text: '#f8f9fa',
      secondaryText: '#adb5bd',
      border: '#495057',
      cardBg: '#343a40',
      primary: '#0d6efd',
      primaryHover: '#0b5ed7',
      success: '#198754',
      info: '#0dcaf0',
      accent: '#6f42c1',
      warning: '#ffc107',
      danger: '#dc3545',
      buttonText: '#ffffff',
      inputBg: '#2b3035',
      shadowColor: 'rgba(0, 0, 0, 0.25)'
    }
  };
  
  return themes[theme] || themes.light;
}
