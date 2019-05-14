import React, { Component } from "react"
import { BrowserRouter as Router, Route } from "react-router-dom"
import { compose } from "recompose"
import styled from "@emotion/styled"
import { ThemeProvider } from "emotion-theming"

import { SIZES } from "./styles/constants"

import theme from "./styles/theme"
import Navbar from "./components/Navbar"
import Day from "./components/screens/Day"
import Month from "./components/screens/Month"
import Year from "./components/screens/Year"
import User from "./components/screens/User"
import Login from "./components/screens/Login"
import Search from "./components/screens/Search"
import Register from "./components/screens/Register"
import Start from "./components/screens/Start"
import Terms from "./components/screens/Terms"
import Privacy from "./components/screens/Privacy"
import PrivateRoute from "./components/PrivateRoute"

import { OnlineContext } from "./components/context/online"
import { withAuthentication } from "./components/session"
import { withFirebase } from "./components/firebase"

const FullscreenLayout = styled.div`
  background-color: ${props => props.theme.colors.bodyBackground};
`
const RouteLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
  padding: 0 10px;
  max-width: ${SIZES.maxWidth};
  min-height: calc(100vh - 60px);
  background-color: ${props => props.theme.colors.bodyBackground};
`

class App extends Component {
  state = {
    authUser: JSON.parse(localStorage.getItem("authUser")),
    selectedTheme:
      new Date().getHours() >= 7 && new Date().getHours() <= 21
        ? "LIGHT"
        : "DARK",
    online: navigator.onLine,
  }

  componentDidMount() {
    window.addEventListener("online", () => {
      this.setState({ online: true })
    })

    window.addEventListener("offline", () => {
      this.setState({ online: false })
    })
  }

  onChangeTheme = () => {
    const { selectedTheme } = this.state
    const body = document.body
    const newTheme = selectedTheme === "LIGHT" ? "DARK" : "LIGHT"
    body.style.setProperty(
      "background-color",
      theme[newTheme].colors.bodyBackground
    )
    this.setState({ selectedTheme: newTheme })
  }

  saveUserSettings = newTheme => {
    const { authUser, firebase } = this.props
    firebase.db
      .collection("users")
      .doc(authUser.uid)
      .update({
        theme: newTheme,
      })
      .then(function() {
        console.log("Updated theme settings")
      })
  }

  render() {
    const { selectedTheme, authUser, online } = this.state
    const { authUser: propAuthUser } = this.props
    const authed = !!propAuthUser || !!authUser

    const currentTheme = theme[selectedTheme]
    return (
      <ThemeProvider theme={currentTheme}>
        <OnlineContext.Provider value={online}>
          <Router>
            <FullscreenLayout>
              <Navbar toggleTheme={this.onChangeTheme} />
              <RouteLayout>
                <PrivateRoute
                  authed={authed}
                  path="/app/:year(\d+)"
                  component={Year}
                  exact
                />
                <PrivateRoute
                  authed={authed}
                  path="/app/:year(\d+)/:month(0[1-9]|1[0-2]+)"
                  component={Month}
                  exact
                />
                <PrivateRoute
                  authed={authed}
                  path="/app/:year(\d+)/:month(0[1-9]|1[0-2]+)/:day(\d+)"
                  component={Day}
                  exact
                />
                <PrivateRoute
                  authed={authed}
                  path="/app/search"
                  component={Search}
                  exact
                />
                <PrivateRoute
                  authed={authed}
                  path="/app/user"
                  component={User}
                  exact
                />
                <Route path="/app/login" component={Login} exact />
                <Route path="/app/register" component={Register} exact />
                <Route path="/app/terms" component={Terms} exact />
                <Route path="/app/privacy" component={Privacy} exact />
                <Route path="/app" component={Start} exact />
              </RouteLayout>
            </FullscreenLayout>
          </Router>
        </OnlineContext.Provider>
      </ThemeProvider>
    )
  }
}

export default compose(
  withAuthentication,
  withFirebase
)(App)
