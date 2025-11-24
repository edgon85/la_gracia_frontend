import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components';
import { User, Shield } from 'lucide-react';
import { getValidatedUser } from '@/actions/auth.actions';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getValidatedUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Sistema de Inventario Hospitalario
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Usuario
          </CardTitle>
          <CardDescription>Detalles de tu cuenta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Nombre
              </p>
              <p className="text-lg font-semibold">{user.fullName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Roles</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    <Shield className="mr-1 h-3 w-3" />
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Estado
              </p>
              <Badge
                variant={user.isActive ? 'default' : 'destructive'}
                className="mt-1"
              >
                {user.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle>¡Bienvenido al Sistema!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Has iniciado sesión exitosamente. Desde aquí podrás gestionar el
            inventario del hospital.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  Productos registrados
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Categorías
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  Categorías activas
                </p>
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Proveedores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  Proveedores activos
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
