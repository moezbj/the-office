import {
  ReactNode,
  useMemo,
  useState,
  createContext,
  memo,
  useContext,
} from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
interface Props {
  children: ReactNode;
}

export const ThemeModeContext = createContext({
  toggleColorMode: () => {},
});

const DarkModeProvider = ({ children }: Props) => {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const { i18n } = useTranslation();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        direction: i18n.language === "ar" ? "rtl" : "ltr",
        palette: {
          mode,
        },
      }),
    [mode, i18n.language]
  );
  const cacheRtl = createCache({
    key: "muirtl",
    stylisPlugins: [prefixer, rtlPlugin],
  });

  const emptyCache = createCache({
    key: "meaningless-key",
  });

  return (
    <ThemeModeContext.Provider value={colorMode}>
      <CacheProvider value={i18n.language === "ar" ? cacheRtl : emptyCache}>
        <ThemeProvider theme={theme}>
          <main style={{ width: "100%", height: "100%" }}>{children}</main>
        </ThemeProvider>
      </CacheProvider>
    </ThemeModeContext.Provider>
  );
};

export default memo(DarkModeProvider);
