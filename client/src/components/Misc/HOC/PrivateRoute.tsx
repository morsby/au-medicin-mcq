import React from 'react';
import { PropTypes } from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../../../actions';
import { urls } from '../../../utils/common';

import LoadingPage from '../Utility-pages/LoadingPage';

/**
 * Higher Order Component der blokerer visse URLS for brugere der ikke er logget ind
 * (fx profilen m.v.)
 */

class PrivateRoute extends React.Component {
  state = { loading: true };

  componentDidMount() {
    this.props.fetchUser().then(() => this.setState({ loading: false }));
  }
  render() {
    if (this.state.loading) return <LoadingPage />;
    if (!this.props.user) {
      return <Redirect to={urls.login} />;
    }
    return <Route {...this.props} />;
  }
}

PrivateRoute.propTypes = {
  // Tjekker brugeren
  fetchUser: PropTypes.func,

  // brugeren (fra redux)
  user: PropTypes.object
};

function mapStateToProps(state) {
  return { user: state.auth.user };
}

export default connect(
  mapStateToProps,
  actions
)(PrivateRoute);
