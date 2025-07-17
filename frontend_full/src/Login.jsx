import React, { useState } from 'react';
import axios from 'axios';
import { Lock, User } from 'lucide-react';

function Login({ setToken, setRole }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/login', {
        username: username.trim(),
        password: password.trim()
      });

      if (!res.data.token || !res.data.role) {
        alert('Resposta inválida do servidor');
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      setToken(res.data.token);
      setRole(res.data.role);
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      alert('Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-4">
      <form
        onSubmit={login}
        className="w-full max-w-md bg-[#1a1a1a] rounded-2xl p-8 shadow-xl border border-red-600 relative flex flex-col items-center"
      >
        <img
          src="/logo_glow.png"
          alt="Logo Pyro"
          className="w-48 h-48 object-cover drop-shadow-lg"
        />

        <div className="mb-6 w-full">
          <label className="text-sm text-gray-400">Username</label>
          <div className="flex items-center bg-[#2a2a2a] p-3 rounded-lg mt-1">
            <User className="text-gray-400 w-5 h-5 mr-2" />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-500"
              placeholder="Digite o username"
            />
          </div>
        </div>

        <div className="mb-6 w-full">
          <label className="text-sm text-gray-400">Password</label>
          <div className="flex items-center bg-[#2a2a2a] p-3 rounded-lg mt-1">
            <Lock className="text-gray-400 w-5 h-5 mr-2" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-transparent outline-none text-white w-full placeholder-gray-500"
              placeholder="Digite a password"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;
