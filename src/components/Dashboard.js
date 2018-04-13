import React, { Component } from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'
import { Input, Menu, Grid } from 'semantic-ui-react'
import ReactJson from 'react-json-view'
import { LOCAL_STRAGE_KEY } from '../utils/Settings'

// API
import * as MyAPI from '../utils/MyAPI'

class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.state = {
      searchItem: '',
      planets: null
    };
    this.handleGetPlanets = this.handleGetPlanets.bind(this)
  }

  logoutRequest = () => {

    const { user } = this.props

    const param = {
      login_token: user.login_token
    }

    MyAPI.logout(param)
      .then((results) => {
        localStorage.removeItem(LOCAL_STRAGE_KEY);
        this.props.history.push("/")
      })
      .catch((err) => {
        console.log("err: ", err)
        localStorage.removeItem(LOCAL_STRAGE_KEY);
        this.props.history.push("/")
      })
  }

  handleGetPlanets = (e) => {
    this.setState({ searchItem: e.target.value })
    console.log(e.target.value)

  }

  onSubmit = (e) => {
    if (e.charCode == 13) {
      e.preventDefault();
      e.stopPropagation();

      let param = {
        name: e.target.value
      }
      MyAPI.getSWAPIDATA(param)
        .then((results) => {
          MyAPI.savedata(results)
            .then((res) => {
              MyAPI.getplanets()
                .then((res_planets) => {
                  this.setState({
                    planets: res_planets.planets
                  })
                })
              // get comments
              MyAPI.getComments()
                .then(res => {
                  this.setState({ comments: res.comments });
                })

            })
        })
        .catch((err) => {
          console.log(err)
          // this.props.history.push("/")
        })
    }
  }

  getPlanetsTemplete(planets) {
    if (!planets.length) return null;
    const { comments } = this.state;
    console.log(comments)
    return planets.map((planet, key) => {
      return (
        <Grid.Row key={key} >
          <Grid.Column width={8}>
            <ReactJson src={planet} collapsed={1} theme="monokai" />
          </Grid.Column>
          <Grid.Column width={4}>
            <a className="ui primary button" planet_id={planet._id} onClick={this.selectPlanet.bind(this)}>Add Comment</a>
          </Grid.Column >
          <Grid.Column width={4}>
            <div>{
              comments ?
                comments.map((comment, key) => {
                  if (comment.planet_id === planet._id) {
                    return (

                      <div key={key}>{comment.comment}
                        <div>
                          {comment.comment}
                        </div>
                        <div>
                          <a className="ui red button" comment_id={comment._id} onClick={this.delComment.bind(this)}>Delete Comment</a>
                        </div>
                      </div>
                    );
                  }
                  else {
                    return null;
                  }
                })
                : null
            }</div>
          </Grid.Column >
        </Grid.Row>
      )

    })
  }

  selectPlanet(e) {
    this.setState({ selectedID: e.target.getAttribute("planet_id") })
  }
  delComment(e) {
    let comment_id = e.target.getAttribute("comment_id");
    MyAPI.delComment({ comment_id })
      .then(res => {
        MyAPI.getComments()
          .then(res => {
            this.setState({ comments: res.comments });
          })
      });
  }
  addComment(e) {
    this.setState({ comment: e.target.value });
  }

  saveComment() {
    const { selectedID, comment } = this.state;
    if (!selectedID || !comment) return;

    MyAPI.saveComment({ planet_id: selectedID, comment })
      .then((res) => {
        // get comments
        MyAPI.getComments()
          .then(res => {
            this.setState({ comments: res.comments });
          })
      })
  }

  render() {

    const { user } = this.props
    const activeItem = 'logout'
    const { searchItem, planets, selectedID, comments } = this.state

    return (
      <div className='dashboard' style={{ textAlign: 'center' }}>
        <div>
          <Menu pointing>
            <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick} />
            <Menu.Menu position='right'>
              <Menu.Item>
                <Input icon='search' placeholder='Search...' />
              </Menu.Item>
              <Menu.Item name='Logout' active={activeItem === 'logout'} onClick={() => this.logoutRequest()} />
            </Menu.Menu>
          </Menu>
        </div>

        <Grid celled>
          <Grid.Row>
            <Grid.Column width={3}>
                <Input
                icon={{ name: 'search', circular: true, link: true }}
                placeholder='Search...'
                onChange={this.handleGetPlanets}
                onKeyPress={this.onSubmit}
              />
            </Grid.Column>
            <Grid.Column width={7} style={{ textAlign: "left" }}>
              {
                planets ? this.getPlanetsTemplete(planets) : null
              }
            </Grid.Column>
            <Grid.Column width={6} style={{ textAlign: "left" }}>
              {
                selectedID ? (
                  <div className="ui comments">
                    <h3 className="ui dividing header">Comments</h3>
                    <form className="ui reply form">
                      <div className="field">
                        <textarea onChange={this.addComment.bind(this)}></textarea>
                      </div>
                      <div className="ui blue labeled submit icon button">
                        <a style={{ color: "#fff" }} onClick={this.saveComment.bind(this)}> <i className="icon edit"></i> Save Comment</a>
                      </div>
                    </form>
                  </div>
                ) : null
              }

            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    )
  }
}

// react-redux
function mapStateToProps({ user }) {
  return {
    user
  }
}

// export default withRouter(MainPage);
export default withRouter(connect(mapStateToProps)(Dashboard))
