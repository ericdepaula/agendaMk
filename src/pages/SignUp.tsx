import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2, AlertCircle, Check} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
}

interface Errors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  agreeToPrivacy?: string;
}

interface SubmitStatus {
  type: 'success' | 'error';
  message: string;
}

const SignUp = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let feedback = '';

    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        feedback = 'Very Weak';
        break;
      case 2:
        feedback = 'Weak';
        break;
      case 3:
        feedback = 'Fair';
        break;
      case 4:
        feedback = 'Good';
        break;
      case 5:
        feedback = 'Strong';
        break;
      default:
        feedback = 'Weak';
    }

    return { score, feedback };
  };

  // Real-time validation
  const validateField = (name: keyof FormData, value: string | boolean) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'fullName':
        if (typeof value === 'string' && !value.trim()) {
          newErrors.fullName = 'Nome é obrigatório';
        } else if (typeof value === 'string' && value.trim().length < 2) {
          newErrors.fullName = 'Nome deve ter pelo menos 2 caracteres';
        } else {
          delete newErrors.fullName;
        }
        break;
      case 'email':
        if (typeof value === 'string' && !value) {
          newErrors.email = 'Email é obrigatório';
        } else if (typeof value === 'string' && !validateEmail(value)) {
          newErrors.email = 'Por favor, insira um email válido'; // value is string here
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (typeof value === 'string' && !value) {
          newErrors.password = 'Senha é obrigatória';
        } else if (typeof value === 'string' && value.length < 5) {
          newErrors.password = 'Senha deve ter pelo menos 5 caracteres';
        } else if (typeof value === 'string' && !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)) {
          newErrors.password = 'Senha deve conter letras maiúsculas, minúsculas e números';
        } else {
          delete newErrors.password;
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Por favor, confirme sua senha';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Senhas não correspondem';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      case 'agreeToTerms':
        if (!value) {
          newErrors.agreeToTerms = 'Voce deve concordar com os termos de serviço';
        } else {
          delete newErrors.agreeToTerms;
        }
        break;
      case 'agreeToPrivacy':
        if (!value) {
          newErrors.agreeToPrivacy = 'Voce deve concordar com a política de privacidade';
        } else {
          delete newErrors.agreeToPrivacy;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;    
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear submit status when user starts typing
    if (submitStatus) {
      setSubmitStatus(null);
    }

    // Update password strength for password field
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value as string));
    }

    // Validate field in real-time
    validateField(name as keyof FormData, newValue);

    // Re-validate confirm password when password changes
    if (name === 'password' && formData.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus(null);

    // --- Refatoração da Validação ---
    // Valida todos os campos de uma vez para garantir que o estado de erro seja consistente.
    const newErrors: Errors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!validateEmail(formData.email)) newErrors.email = 'Por favor, insira um email válido';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 8) newErrors.password = 'Senha deve ter pelo menos 5 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'As senhas não correspondem';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'Você deve concordar com os termos de serviço';
    if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = 'Você deve concordar com a política de privacidade';

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/cadastro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.fullName,
          email: formData.email,
          senha: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Assumes the API returns a message property on error
        throw new Error(data.message || 'Ocorreu um erro ao criar a conta.');
      }
      
      console.log('Account created successfully:', data);
      setSubmitStatus({ 
        type: 'success', 
        message: 'Conta criada com sucesso! Redirecionando para o login...' 
      });
      
      // Redirect to sign-in page after a short delay
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message :'Ocorreu um erro. Por favor, tente novamente.'
      setSubmitStatus({ type: 'error', message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength color and width
  const getPasswordStrengthColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthWidth = (score: number) => {
    return `${(score / 5) * 100}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar conta</h1>
          <p className="text-gray-600">Se cadastre e aproveite nossos serviços</p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-white backdrop-blur-sm bg-opacity-95 rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Input */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your full name"
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
              </div>
              {errors.fullName && (
                <p id="fullName-error" className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Endereço de Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Create a password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Password strength:</span>
                    <span className={`text-sm font-medium ${
                      passwordStrength.score <= 1 ? 'text-red-600' :
                      passwordStrength.score <= 2 ? 'text-orange-600' :
                      passwordStrength.score <= 3 ? 'text-yellow-600' :
                      passwordStrength.score <= 4 ? 'text-blue-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.feedback}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength.score)}`}
                      style={{ width: getPasswordStrengthWidth(passwordStrength.score) }}
                    />
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirme sua Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 
                    formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500 bg-green-50' :
                    'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Confirm your password"
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <Check className="absolute right-10 top-3 h-5 w-5 text-green-500" />
                )}
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms and Privacy Checkboxes */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-700">
                  Eu concordo com os{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Termos de Serviço
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-600 flex items-center ml-7">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.agreeToTerms}
                </p>
              )}

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToPrivacy"
                  name="agreeToPrivacy"
                  checked={formData.agreeToPrivacy}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeToPrivacy" className="ml-3 text-sm text-gray-700">
                  Eu concordo com a{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Politica de Privacidade
                  </Link>
                </label>
              </div>
              {errors.agreeToPrivacy && (
                <p className="text-sm text-red-600 flex items-center ml-7">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.agreeToPrivacy}
                </p>
              )}
            </div>

            {/* Submit Status */}
            {submitStatus && (
              <div className={`p-4 rounded-xl ${
                submitStatus.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {submitStatus.message}
              </div>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Criando conta...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já possui uma conta?{' '}
              <Link
                to="/signin"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;