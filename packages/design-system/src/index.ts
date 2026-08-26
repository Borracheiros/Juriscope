export const tokens = {
  colorInk: "#1b2430",
  colorPaper: "#f4efe6",
  colorSidebar: "#ffffff",
  colorCanvas: "#ece6db",
  colorPrimary: "#9a4d14",
  colorDanger: "#8a1f1f",
  colorOk: "#1f5c45",
  fontSerif: '"Source Serif 4", Georgia, serif',
  fontSans: '"IBM Plex Sans", system-ui, sans-serif',
} as const;

export const cssVariables = `
:root {
  --color-ink: ${tokens.colorInk};
  --color-paper: ${tokens.colorPaper};
  --color-sidebar: ${tokens.colorSidebar};
  --color-canvas: ${tokens.colorCanvas};
  --color-primary: ${tokens.colorPrimary};
  --color-danger: ${tokens.colorDanger};
  --color-ok: ${tokens.colorOk};
  --color-sidebar-bg: var(--color-sidebar);
  --surface-canvas: var(--color-canvas);
  --surface-paper: var(--color-paper);
  --font-serif: ${tokens.fontSerif};
  --font-sans: ${tokens.fontSans};
}
`;
