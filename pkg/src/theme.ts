type VueAudioUITheme = {
  colors: ThemeColors;
};

type ThemeColors = {
  primary: string;
  secondary: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  light: string;
  dark: string;
  muted: string;
  white: string;
  black: string;
}

const vueAudioUITheme = {
  colors: {
    primary: '#70bfff',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    dark: '#343a40',
    muted: '#6c757d',
    white: '#ffffff',
    black: '#000000'
  },
} as VueAudioUITheme;

export default vueAudioUITheme;