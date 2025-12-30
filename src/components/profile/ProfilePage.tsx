'use client';

import { IUser } from '@/lib';
import { ProfileInfoForm } from './ProfileInfoForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield } from 'lucide-react';

interface ProfilePageProps {
  user: Omit<IUser, 'token'>;
}

export function ProfilePage({ user }: ProfilePageProps) {
  // Obtener el rol principal para mostrar
  const getPrimaryRole = (roles: string[]) => {
    if (roles.includes('admin')) return 'Administrador';
    if (roles.includes('FARMACIA')) return 'Farmacia';
    if (roles.includes('BODEGA')) return 'Bodega';
    if (roles.includes('MEDICO')) return 'Médico';
    if (roles.includes('ENFERMERO')) return 'Enfermero';
    if (roles.includes('AUDITOR')) return 'Auditor';
    return roles[0] || 'Usuario';
  };

  // Obtener iniciales del nombre
  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mi Perfil
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Administra tu información personal y seguridad
        </p>
      </div>

      {/* Card de información del usuario */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {getInitials(user.fullName)}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {user.fullName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  {getPrimaryRole(user.roles)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulario de información personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileInfoForm user={user} />
          </CardContent>
        </Card>

        {/* Formulario de cambio de contraseña */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Cambiar Contraseña
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
