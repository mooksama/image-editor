const API_BASE_URL = 'http://pooding.mujinsoft.co.kr/api';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  result: 'ok' | 'error';
  message: string;
  content?: {
    token?: string;
    user?: User;
    id?: string;
    email?: string;
    name?: string;
  };
}

export const authService = {
  // 회원가입
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.result !== 'ok') {
      throw new Error(result.message || '회원가입 실패');
    }

    return result;
  },

  // 로그인
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.result !== 'ok') {
      throw new Error(result.message || '로그인 실패');
    }

    // localStorage에 저장
    if (result.content?.token) {
      localStorage.setItem('auth_token', result.content.token);
    }
    if (result.content?.user) {
      localStorage.setItem('auth_user', JSON.stringify(result.content.user));
    }

    return result;
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  // 현재 사용자 정보
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('auth_user');
    return userJson ? JSON.parse(userJson) : null;
  },

  // 토큰 가져오기
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  // 로그인 여부 확인
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem('auth_token') && !!localStorage.getItem('auth_user');
  },
};