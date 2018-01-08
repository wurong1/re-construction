import { ACTIONS } from '../constants';
import { createReducer } from '../utils/createReducer';

const initialState = {
  loading: false
};

export default createReducer(initialState, {
  [ACTIONS.SHOW_BLOCK_LOADING]: () => {
    return {
      loading: true
    };
  },
  [ACTIONS.HIDE_BLOCK_LOADING]: () => {
    return {
      loading: false
    };
  }
});
