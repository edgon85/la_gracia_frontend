'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { updateProfileAction } from '@/actions/auth.actions';
import { useAuthStore } from '@/stores';
import { IUser } from '@/lib';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileInfoFormProps {
  user: Omit<IUser, 'token'>;
}

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
  const router = useRouter();
  const { updateUser } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    startTransition(async () => {
      const result = await updateProfileAction(data);

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Perfil actualizado correctamente');
        // Actualizar el store directamente con los nuevos datos
        updateUser({ fullName: data.fullName, email: data.email });
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Usuario</Label>
        <Input
          id="username"
          value={user.username}
          disabled
          className="bg-gray-100 dark:bg-gray-800"
        />
        <p className="text-xs text-gray-500">
          El nombre de usuario no puede ser modificado
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nombre Completo</Label>
        <Input
          id="fullName"
          {...form.register('fullName')}
          disabled={isPending}
        />
        {form.formState.errors.fullName && (
          <p className="text-sm text-red-500">
            {form.formState.errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...form.register('email')}
          disabled={isPending}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Guardando...
          </>
        ) : (
          'Guardar Cambios'
        )}
      </Button>
    </form>
  );
}
