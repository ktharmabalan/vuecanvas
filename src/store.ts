import Vue from "vue";
import Vuex, { StoreOptions } from "vuex";
import { CanvasScreen } from "@/libs/element";

interface ScreenState {
  screen: CanvasScreen | null;
}

Vue.use(Vuex);

const store: StoreOptions<ScreenState> = {
  state: {
    screen: null
  },
  getters: {
    screen: state => state.screen
  },
  mutations: {
    setScreen(state, screen) {
      state.screen = screen;
    }
  }
};

export default new Vuex.Store(store);
