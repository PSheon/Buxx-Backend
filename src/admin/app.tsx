// ** Assets
import AuthLogo from "./extensions/auth-logo.png";
import MenuLogo from "./extensions/auth-logo.png";
import favicon from "./extensions/favicon.ico";

export default {
  config: {
    auth: {
      logo: AuthLogo,
    },
    head: {
      favicon: favicon,
    },
    menu: {
      logo: MenuLogo,
    },
    translations: {
      en: {
        "Auth.form.welcome.title": "Welcome to Buxx!",
        "Auth.form.welcome.subtitle": "Log in to your account",
        "app.components.LeftMenu.navbrand.title": "Buxx",
      },
    },
    tutorials: false,
    notifications: { releases: false },
  },
};
