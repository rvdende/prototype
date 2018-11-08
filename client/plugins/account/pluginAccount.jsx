import React, { Component } from "react";

import { gridstyle, cellstyle, gridHeadingStyle, blockstyle, formRowStyle, formLabelStyle, formInputStyle} from "../../styles.jsx"
export const name = "Account"

export class SettingsPanel extends React.Component {
  state = {
    account:{}
  }
  componentDidMount() {
    fetch("/api/v3/account", { method: "GET" }).then(resp => resp.json()).then( (data)=> {
      //console.log(data);
      this.setState({account:data})
    })
  }

  render() {   
    return (
      <div style={blockstyle}>
      <h4>ACCOUNT</h4>
        email: {this.state.account.email}<br />
        level: {this.state.account.level}
      </div>
    )
  }
}

