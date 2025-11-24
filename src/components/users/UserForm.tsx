'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { IUserListItem, USER_ROLES } from '@/lib';
import {
  createUserAction,
  updateUserAction,
  updateUserRolesAction,
  toggleUserStatusAction,
  deleteUserAction,
} from '@/actions/user.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2, Power } from 'lucide-react';

// Schema unificado con password opcional
const userSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(3, 'El username debe tener al menos 3 caracteres')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Solo letras, números y guiones bajos permitidos'
    ),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  // Roles solo se pueden editar después de crear el usuario
  roles: z.array(z.string()).optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: IUserListItem;
  isEditing?: boolean;
}

export function UserForm({ user, isEditing = false }: UserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    user?.roles || []
  );

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: user?.email || '',
      username: user?.username || '',
      password: '',
      confirmPassword: '',
      fullName: user?.fullName || '',
      roles: user?.roles || [],
    },
  });

  const handleRoleChange = (role: string, checked: boolean) => {
    const newRoles = checked
      ? [...selectedRoles, role]
      : selectedRoles.filter((r) => r !== role);

    setSelectedRoles(newRoles);
    form.setValue('roles', newRoles, { shouldValidate: true });
  };

  const onSubmit = async (data: UserFormValues) => {
    // Validaciones adicionales para crear
    if (!isEditing) {
      if (!data.password || data.password.length < 6) {
        form.setError('password', {
          message: 'La contraseña debe tener al menos 6 caracteres',
        });
        return;
      }
      if (data.password !== data.confirmPassword) {
        form.setError('confirmPassword', {
          message: 'Las contraseñas no coinciden',
        });
        return;
      }
    } else {
      // Validación de roles al editar
      if (selectedRoles.length === 0) {
        toast.error('Debe seleccionar al menos un rol');
        return;
      }
    }

    startTransition(async () => {
      if (isEditing && user) {
        // Primero actualizamos los datos del usuario
        const userResult = await updateUserAction(user.id, {
          email: data.email,
          username: data.username,
          fullName: data.fullName,
        });

        if ('error' in userResult) {
          toast.error(userResult.error);
          return;
        }

        // Luego actualizamos los roles (endpoint separado)
        const rolesResult = await updateUserRolesAction(user.id, selectedRoles);

        if ('error' in rolesResult) {
          toast.error(rolesResult.error);
          return;
        }

        toast.success('Usuario actualizado correctamente');
        router.push('/dashboard/users');
        router.refresh();
      } else {
        // Al crear, no enviamos roles - el backend asigna 'user' por defecto
        const result = await createUserAction({
          email: data.email,
          username: data.username,
          password: data.password!,
          fullName: data.fullName,
        });

        if ('error' in result) {
          toast.error(result.error);
        } else {
          toast.success('Usuario creado correctamente');
          router.push('/dashboard/users');
          router.refresh();
        }
      }
    });
  };

  const handleToggleStatus = async () => {
    if (!user) return;

    startTransition(async () => {
      const result = await toggleUserStatusAction(user.id);

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success(
          `Usuario ${result.user.isActive ? 'activado' : 'desactivado'} correctamente`
        );
        router.refresh();
      }
    });
  };

  const handleDelete = async () => {
    if (!user) return;

    startTransition(async () => {
      const result = await deleteUserAction(user.id);

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success('Usuario eliminado correctamente');
        router.push('/dashboard/users');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
            <CardDescription>
              {isEditing
                ? 'Modifica los datos del usuario'
                : 'Ingresa los datos del nuevo usuario'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="nombre_usuario"
                  {...form.register('username')}
                  disabled={isPending}
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

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

              {/* Full Name */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  placeholder="Juan Pérez"
                  {...form.register('fullName')}
                  disabled={isPending}
                />
                {form.formState.errors.fullName && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              {/* Password (solo para crear) */}
              {!isEditing && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      {...form.register('password')}
                      disabled={isPending}
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      {...form.register('confirmPassword')}
                      disabled={isPending}
                    />
                    {form.formState.errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Roles - Solo visible al editar */}
        {isEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Roles y Permisos</CardTitle>
              <CardDescription>
                Selecciona los roles que tendrá el usuario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {USER_ROLES.map((role) => (
                  <div key={role.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={role.value}
                      checked={selectedRoles.includes(role.value)}
                      onCheckedChange={(checked) =>
                        handleRoleChange(role.value, checked as boolean)
                      }
                      disabled={isPending}
                    />
                    <Label
                      htmlFor={role.value}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {role.label}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedRoles.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  Debe seleccionar al menos un rol
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/users')}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Guardando...' : 'Creando...'}
              </>
            ) : isEditing ? (
              'Guardar Cambios'
            ) : (
              'Crear Usuario'
            )}
          </Button>
        </div>
      </form>

      {/* Zona de peligro (solo para editar) */}
      {isEditing && user && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
            <CardDescription>
              Acciones irreversibles para este usuario
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {/* Toggle Status */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={isPending}>
                  <Power className="mr-2 h-4 w-4" />
                  {user.isActive ? 'Desactivar' : 'Activar'} Usuario
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    ¿{user.isActive ? 'Desactivar' : 'Activar'} usuario?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {user.isActive
                      ? 'El usuario no podrá acceder al sistema hasta que sea reactivado.'
                      : 'El usuario podrá acceder al sistema nuevamente.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleToggleStatus}>
                    {user.isActive ? 'Desactivar' : 'Activar'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar Usuario
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminará permanentemente
                    el usuario y todos sus datos asociados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
