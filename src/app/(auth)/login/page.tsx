import { loginAction } from '@/actions/auth.actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
// Schema de validación con Zod
const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { checkAuth, login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    startTransition(async () => {
      const result = await loginAction(data);

      if (result.error) {
        console.log(result.error);
        toast.error(result.error);
      } else {
        toast.success('Inicio de sesión exitoso');
        // Actualizar el store de autenticación
        await login();
        router.push('/dashboard');
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center">
            Sistema de Inventario Hospitalario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@hospital.com"
                {...form.register('email')}
                disabled={isPending}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...form.register('password')}
                  disabled={isPending}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-primary hover:underline">
              Registrarse
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
