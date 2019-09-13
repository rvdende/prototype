import React from "react";
import { api } from "../api";
import { CorePacket } from "../../../server/shared/interfaces";
import { JSONviewer } from "./jsonviewer";

import { ProtoEditor } from "./editor"
import { Dashboard } from "./dashboard/dashboard"
import { colors } from "../theme";
import { Menu } from "./menu";


interface MyProps {
  username?: string;
  id?: string;
  publickey?: string;
}

interface MyState {
  [index: string]: any;
}

export class DeviceView extends React.Component<MyProps, MyState> {
  state = {
    state: undefined,
    message: undefined,
    showEditor: false
  };

  wrapper;

  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    if (this.props.username && this.props.id) {
      this.loadfromusernameid(this.props.username, this.props.id)
    }

    if (this.props.publickey) {
      this.loadfrompublickey(this.props.publickey);
    }
  };

  loadfromusernameid = (username, id) => {
    api.view({ username: this.props.username, id: this.props.id },
      (err, state) => {
        if (err) {
          console.log(err);
          this.setState({ message: err });
        }

        if (state) {
          this.setState({ state });

          api.subscribe({ publickey: state.publickey }, (state) => {
            this.setState({ state })
          });

        }
      }
    );
  }

  loadfrompublickey = (publickey) => {
    if (publickey) {
      api.view({ publickey: publickey }, (err, state) => {
        if (err) { this.setState({ message: err }) }
        if (state) {
          if (state.publickey) this.setState({ state })
        }
      })

      api.subscribe({ publickey: publickey }, (state) => {
        this.setState({ state })
      });
    }
  }

  componentWillUnmount = () => {
    api.removeListener("states", this.stateUpdater);
  };

  stateUpdater = (states: CorePacket[]) => {
    console.log(states);
    // // if this device updated let's update state
    // if (!this.state.state) { return; }
    // if (!this.state.state.key) { return; }

    // for (var s in states) {
    //   if (states[s].key == this.state.state.key) {
    //     if (states[s]["_last_seen"] != this.state.state["_last_seen"]) {
    //       // must be new?
    //       this.setState({ state: states[s] });
    //     }
    //   }
    // }
  };

  render() {
    if (this.state.state == undefined) {
      return <div style={{ padding: 20 }}></div>;
    }

    if (this.state.state) {
      return (
        <div style={{ padding: colors.padding * 2 }}>

          <div style={{ textAlign: "right" }}>
            <Menu align="right" active={"dashboard"} config={{
              menuitems: [
                { responsive: true, link: "/docs/apikey", icon: "digital-tachograph", text: "Dashboard", onClick: () => { } },
                { responsive: true, link: "/docs/websocket", icon: "server", text: "Data", onClick: () => { } },
                {
                  responsive: true, icon: "code", text: "Code", onClick: () => {
                    this.setState({ showEditor: !this.state.showEditor })
                  }
                },
                { responsive: true, link: "/docs/websocket", icon: "share-alt", text: "Sharing", onClick: () => { } },
                { responsive: true, link: "/docs/websocket", icon: "eraser", text: "Clear", onClick: () => { } },
                { responsive: true, link: "/docs/mqtt", icon: "trash", text: "Delete", onClick: () => { } }]
            }} />
          </div>

          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ flex: "0", width: "400px" }}>

              <div style={{ overflowY: "scroll" }}>
                <JSONviewer object={this.state.state} />
              </div>

            </div>

            <div style={{ flex: "5" }}>
              <div>
                {(this.state.showEditor) && <ProtoEditor state={this.state.state} />}

              </div>
              <div>
                <Dashboard state={this.state.state} />
              </div>
            </div>


            {/* <div style={{ padding: colors.padding }}>
                USERNAME: {this.state.state.username}<br />
                ID: {this.state.state.id}
              </div> */}



          </div>

        </div>
      );
    }
  }
}
