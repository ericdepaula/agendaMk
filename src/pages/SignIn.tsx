import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import TimedSnackbar from '../components/TimedSnackbar'; // Garanta que este caminho está correto

// --- Interfaces (sem alterações) ---
interface FormData {
  email: string;
  password: string;
}
interface Errors {
  email?: string;
  password?: string;
}
interface SubmitStatus {
  type: 'success' | 'error';
  message: string;
}

// --- Funções Helper (sem alterações) ---
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const SignIn = () => {
  // --- Estados do Componente (sem alterações) ---
  const [formData, setFormData] = useState<FormData>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const navigate = useNavigate();

  // --- Lógica de Validação (sem alterações) ---
  const validate = useCallback((data: FormData) => {
    const newErrors: Errors = {};
    if (data.email && !validateEmail(data.email)) {
      newErrors.email = 'Por favor, insira um email válido';
    }
    if (data.password && data.password.length < 5) {
      newErrors.password = 'Senha deve ter pelo menos 5 caracteres';
    }
    return newErrors;
  }, []);

  useEffect(() => {
    const validationErrors = validate(formData);
    setErrors(validationErrors);
  }, [formData, validate]);

  // --- Funções de Manipulação (Handlers) (sem alterações) ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (submitStatus) setSubmitStatus(null);
  };

  // --- Função de Envio (com a correção) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const finalErrors = validate(formData);
    if (!formData.email) finalErrors.email = 'Email é obrigatório';
    if (!formData.password) finalErrors.password = 'Senha é obrigatória';

    setErrors(finalErrors);

    if (Object.keys(finalErrors).length > 0) {
      setSubmitStatus({ type: 'error', message: 'Por favor, corrija os campos em vermelho.' });
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);

    try {
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/usuarios/login`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, senha: formData.password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Credenciais inválidas.');
      }

      // --- A CORREÇÃO ESTÁ AQUI ---
      // Padronizamos o nome da chave para 'authToken'
      localStorage.setItem('authToken', data.token);

      if (data.usuario) {
        localStorage.setItem('userInfo', JSON.stringify(data.usuario));
      }
      setSubmitStatus({ type: 'success', message: 'Login realizado com sucesso! Redirecionando...' });
      navigate('/dashboard');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro inesperado.';
      setSubmitStatus({ type: 'error', message: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header (sem alterações) */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem vindo de volta!</h1>
          <p className="text-gray-600">Entre com sua conta para continuar</p>
        </div>

        {/* Formulário (sem alterações) */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email" id="email" name="email"
                  value={formData.email} onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  placeholder="Informe seu email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'} id="password" name="password"
                  value={formData.password} onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  placeholder="Informe sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isLoading ? (<><Loader2 className="animate-spin h-5 w-5 mr-2" /></>) : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Snackbar (sem alterações) */}
      <TimedSnackbar
        status={submitStatus}
        onClose={() => setSubmitStatus(null)}
      />
    </div>
  );
};

export default SignIn;