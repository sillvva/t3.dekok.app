import { useState, createContext } from "react";
import type { PropsWithChildren } from "react";

export const menuItems = [
  { link: "/", label: "Intro" },
  { link: "/about", label: "About Me" },
  { link: "/experience", label: "Experience" },
  { link: "/skills", label: "Skills" },
  { link: "/projects", label: "Projects" },
  { link: "/blog", label: "Blog" }
];

type DrawerProps = {
  state: boolean;
  action: string;
  toggle: () => void;
};

type MainLayoutProps = {
  drawer: DrawerProps;
};

const initState = {
  drawer: {
    state: false,
    action: "",
    toggle: function () {}
  },
};

const MainLayoutContext = createContext<MainLayoutProps>(initState);

export default MainLayoutContext;

export const MainLayoutContextProvider = (props: PropsWithChildren<unknown>) => {
  const [context, setContext] = useState<MainLayoutProps>(initState);

  function drawerToggleHandler() {
    const drawer = context.drawer;
    if (drawer.action) return;

    if (drawer.state) {
      drawer.action = "closing";
      setTimeout(() => {
        drawer.state = false;
        drawer.action = "";
        setContext({ ...context, drawer: drawer });
      }, 500);
    } else {
      drawer.state = true;
      drawer.action = "opening";
      setTimeout(() => {
        drawer.action = "";
        setContext({ ...context, drawer: drawer });
      }, 500);
    }

    setContext({ ...context, drawer: drawer });
  }

  const ctx = {
    ...context,
    drawer: {
      ...context.drawer,
      toggle: drawerToggleHandler
    },
  };

  return <MainLayoutContext.Provider value={ctx}>{props.children}</MainLayoutContext.Provider>;
};