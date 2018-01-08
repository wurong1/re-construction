export function createReducer(initialState, fnMap) {
  return (state = initialState, { type, payload }, ...rest) => {
    const handler = fnMap[type];
    return handler ? handler(state, payload, ...rest) : state;
  };
}
