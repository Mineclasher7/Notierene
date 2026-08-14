import axios from 'axios';

export function jwtInterceptor() {
    axios.interceptors.request.use((config) => {
      const jwtToken = sessionStorage.getItem('jwtToken');
      if (jwtToken) {
        config.headers.Authorization = `Bearer ${jwtToken}`;
      }
      return config;
    });
  }
