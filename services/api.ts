import axios from 'axios';

const api = axios.create({
  // todo: 실제 백엔드 서버 주소로 변경
  // 로컬 테스트 시 PC의 IP 주소를 입력 권장 (예: 'http://192.122.0.10:3000')
  baseURL: 'https://api.example.com', 
  
  // 요청 타임아웃 설정 
  timeout: 5000,
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (로그인 토큰을 자동으로 헤더에 넣을 때 사용)
api.interceptors.request.use((config) => {
  // todo: auth.store에서 토큰을 가져와 넣는 로직 추가
  return config;
});

export default api;