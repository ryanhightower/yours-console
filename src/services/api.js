import axios from "axios";
// import moment from 'moment';
// import _ from 'lodash';
import firebase from "../firebase";

const baseUrl = `https://us-central1-${
  process.env.VUE_APP_FIREBASE_PROJECT_ID
}.cloudfunctions.net`;

// const tokenEndpoint = "/api/token";

const api = axios.create({
  baseURL: baseUrl
});

export function headers(token) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

export function getToken() {
  return firebase.auth().currentUser.getIdToken();
}

export function post(path, payload) {
  return getToken().then(token => api.post(path, payload, headers(token)));
}

export function put(path, payload) {
  return getToken().then(token => api.put(path, payload, headers(token)));
}

export function get(path) {
  return getToken().then(token => api.get(path, headers(token)));
}

export function del(path) {
  return getToken().then(token => api.delete(path, headers(token)));
}

export default {
  get,
  post,
  put,
  del
}