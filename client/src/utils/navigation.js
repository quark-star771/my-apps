// src/utils/navigation.js
import { history } from './history';

export const navigateTo = (path) => {
  history.push(path);
};