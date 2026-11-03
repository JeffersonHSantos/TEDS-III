import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';
import { apiMessage } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldError } from '@/components/ui/field';
import { Toaster } from '@/components/ui/sonner';

export default function Login() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    if (!email || !senha) {
      setError('Informe e-mail e senha.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await login({ email, senha });
      setSession(data.token);
      toast.success('Login realizado.');
      navigate('/');
    } catch (err) {
      setError(apiMessage(err, 'E-mail ou senha inválidos.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Toaster position="top-right" theme="dark" richColors />
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clock />
          </div>
          <div>
            <CardTitle>Entrar no MegaPonto</CardTitle>
            <CardDescription>Use as credenciais do colaborador cadastrado na API.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <FieldGroup>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                />
              </Field>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="login-senha">Senha</FieldLabel>
                <Input
                  id="login-senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha"
                />
                {error && <FieldError>{error}</FieldError>}
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 data-icon="inline-start" className="animate-spin" />}
              Entrar
            </Button>
            <p className="text-xs text-muted-foreground">
              Seed: admin@empresa.com / Admin@123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
