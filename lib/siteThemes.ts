export type SiteTheme = "crimson" | "ocean" | "forest" | "graphite";

export const SITE_THEMES: Record<SiteTheme, {
  label: string;
  description: string;
  primary: string;
  dark: string;
  light: string;
  accent: string;
  rgb: string;
}> = {
  crimson: {
    label: "Crimson & Gold",
    description: "The current foundation palette",
    primary: "#7b1e2b",
    dark: "#5d1621",
    light: "#a33b49",
    accent: "#d9822b",
    rgb: "123, 30, 43",
  },
  ocean: {
    label: "Ocean Blue",
    description: "Deep blue with a warm gold accent",
    primary: "#1d4e72",
    dark: "#153a55",
    light: "#447797",
    accent: "#d49a2d",
    rgb: "29, 78, 114",
  },
  forest: {
    label: "Forest Green",
    description: "Evergreen with a muted brass accent",
    primary: "#285c46",
    dark: "#1b4332",
    light: "#4f7e64",
    accent: "#c28b2c",
    rgb: "40, 92, 70",
  },
  graphite: {
    label: "Graphite & Teal",
    description: "Graphite with a clear teal accent",
    primary: "#404b55",
    dark: "#2d353c",
    light: "#667581",
    accent: "#148b82",
    rgb: "64, 75, 85",
  },
};
