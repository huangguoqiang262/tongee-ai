// import Cookies from 'js-cookie'

const TokenKey = 'token'

export function getToken() {
  // return Cookies.get(TokenKey)
  return JSON.parse(localStorage.getItem(TokenKey))
}

export function setToken(token) {
  localStorage.setItem(TokenKey, JSON.stringify(token))
  // return Cookies.set(TokenKey, token)
}

export function removeToken() {
  // return Cookies.remove(TokenKey)
  return localStorage.removeItem('TokenKey')
}
