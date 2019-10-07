import React from "react";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";
import "../prototype.scss";
import { User } from "../../../server/shared/interfaces";
import { theme, colors } from "../theme";
import { api } from "../api";
import { SearchBox } from "./searchbox";

interface MyProps {
  //account: User;
}

interface MyState {
  [index: string]: any;
}

export class NavBar extends React.Component<MyProps, MyState> {
  state = {
    mobileMenuActive: false
  };

  mobileMenuPress = () => {
    this.setState({ mobileMenuActive: !this.state.mobileMenuActive });
  };

  render() {
    var size = "large";
    if (window.innerWidth < 800) {
      size = "small";
    }

    // LOGGED IN USERS:
    if (api.data.account) {
      const menuitemsLogged = [
        { text: "Notifications", path: "/notifications", icon: "bell" },
        { text: "Settings", path: "/settings", icon: "cog" },
        {
          text: api.data.account.username,
          path: "/settings/account",
          icon: "user-circle"
        }
      ];

      return (
        <div style={{ background: colors.panels, padding: colors.padding, zIndex: 100 }}>
          <NavLink id="topnavhome" exact activeClassName="active" to="/">
            <div style={{ float: "left", padding: theme.paddings.default }}>
              <img
                src="/icon.png"
                alt=""
                width="23"
                height="23"
                style={{ float: "left" }}
              />

              <div style={{ paddingLeft: 5, paddingTop: 2, float: "left" }}>
                <span className="navHeading">PR0T0TYP3</span>
              </div>
            </div>
          </NavLink>

          <SearchBox />

          {menuitemsLogged.map((menuitem, i, arr) => {
            if (size == "small") {
              return (
                <NavLink
                  key={i}
                  activeClassName="active"
                  to={menuitem.path}
                  style={theme.global.navlinksmall}
                >
                  <i className={"fa fa-" + menuitem.icon}></i>
                </NavLink>
              );
            } else {
              return (
                <NavLink
                  key={i}
                  activeClassName="active"
                  to={menuitem.path}
                  style={theme.global.navlinklarge}
                >
                  <i className={"fa fa-" + menuitem.icon}></i> {menuitem.text}
                </NavLink>
              );
            }
          })}

          <div style={{ clear: "both" }}></div>
        </div>
      );
    }

    //////////////////////////////////////////////////////////////////

    //VISTORS:
    if (api.data.account == undefined) {
      var menuitemsVisitor = [
        { text: "Company", path: "/company", icon: "" },
        { text: "Code", path: "/code", icon: "" },
        { text: "Pricing", path: "/pricing", icon: "" },
        { text: "Sign in", path: "/signin", icon: "" },
        {
          text: "Sign up",
          path: "/signup",
          icon: "",
          style: { background: colors.spotA }
        }
      ];

      menuitemsVisitor = menuitemsVisitor.reverse();

      return (
        <div
          style={{ zIndex: 10 }}
          id="myTopnav"
          className={
            "topnav " + (this.state.mobileMenuActive ? "responsive" : "")
          }
        >
          <NavLink id="topnavhome" exact activeClassName="active" to="/">
            <div style={{ float: "left" }}>
              <img
                src="/icon.png"
                alt=""
                width="23"
                height="23"
                style={{ float: "left" }}
              />

              <div style={{ paddingLeft: 5, paddingTop: 2, float: "left" }}>
                <span className="navHeading">PR0T0TYP3</span>
              </div>
            </div>
          </NavLink>

          {menuitemsVisitor.map((menuitem, i, arr) => {
            if (size == "small") {
              return (
                <NavLink key={i} activeClassName="active" to={menuitem.path}>
                  <i className={"fa fa-" + menuitem.icon}></i>
                </NavLink>
              );
            } else {
              return (
                <NavLink key={i} activeClassName="active" to={menuitem.path}>
                  <i className={"fa fa-" + menuitem.icon}></i>
                  {menuitem.text}
                </NavLink>
              );
            }
          })}

          <a className="icon" onClick={this.mobileMenuPress}>
            <i className="fa fa-bars" />
          </a>
        </div>
      );
    }
  }
}