import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

const store = {
  state: {
    screen: null,
  },
  getters: {
    screen: state => state.screen
  },
  mutations: {
    setScreen(state, screen) {
      state.screen = screen;
    }
  },
};

export default new Vuex.Store(store);
