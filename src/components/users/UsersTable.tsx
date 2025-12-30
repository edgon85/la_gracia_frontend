'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { IUserListItem } from '@/lib';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pencil,
  Shield,
  KeyRound,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { resetUserPasswordAction } from '@/actions/user.actions';
import { toast } from 'sonner';

interface UsersTableProps {
  users: IUserListItem[];
  isAdmin: boolean;
}

export function UsersTable({ users, isAdmin }: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    open: boolean;
    user: IUserListItem | null;
    step: 'input' | 'confirm';
  }>({ open: false, user: null, step: 'input' });
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/users/${id}/edit`);
  };

  const handleOpenResetModal = (user: IUserListItem) => {
    setResetPasswordModal({ open: true, user, step: 'input' });
    setTemporaryPassword('');
    setShowPassword(false);
  };

  const handleCloseResetModal = () => {
    setResetPasswordModal({ open: false, user: null, step: 'input' });
    setTemporaryPassword('');
    setShowPassword(false);
  };

  const handleGoToConfirm = () => {
    if (!temporaryPassword) return;

    if (temporaryPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setResetPasswordModal((prev) => ({ ...prev, step: 'confirm' }));
  };

  const handleBackToInput = () => {
    setResetPasswordModal((prev) => ({ ...prev, step: 'input' }));
  };

  const handleResetPassword = () => {
    if (!resetPasswordModal.user || !temporaryPassword) return;

    startTransition(async () => {
      const result = await resetUserPasswordAction(
        resetPasswordModal.user!.id,
        temporaryPassword
      );

      if ('error' in result) {
        toast.error(result.error);
      } else {
        toast.success(
          `Contraseña reseteada para ${resetPasswordModal.user!.fullName}. El usuario deberá cambiarla en su próximo inicio de sesión.`
        );
        handleCloseResetModal();
      }
    });
  };

  const generateRandomPassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = uppercase + lowercase + numbers;

    // Garantizar al menos una mayúscula, una minúscula y un número
    let password =
      uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
      lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
      numbers.charAt(Math.floor(Math.random() * numbers.length));

    // Completar hasta 10 caracteres con caracteres aleatorios
    for (let i = 0; i < 7; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Mezclar los caracteres para que no siempre empiece igual
    password = password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    setTemporaryPassword(password);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-500';
      case 'farmacia':
        return 'bg-blue-500';
      case 'bodega':
        return 'bg-orange-500';
      case 'medico':
        return 'bg-green-500';
      case 'enfermero':
        return 'bg-cyan-500';
      case 'auditor':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Administrador';
      case 'farmacia':
        return 'Farmacia';
      case 'bodega':
        return 'Bodega';
      case 'medico':
        return 'Médico';
      case 'enfermero':
        return 'Enfermero';
      case 'auditor':
        return 'Auditor';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>Estado</TableHead>
            {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
                No se encontraron usuarios.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {user.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <span>{user.username}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <Badge
                        key={role}
                        className={`${getRoleBadgeColor(role)} text-white`}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {getRoleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <Badge className="bg-green-500">Activo</Badge>
                  ) : (
                    <Badge variant="destructive">Inactivo</Badge>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenResetModal(user)}
                        title="Resetear contraseña"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user.id)}
                        title="Editar usuario"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Modal de resetear contraseña */}
      <Dialog open={resetPasswordModal.open} onOpenChange={handleCloseResetModal}>
        <DialogContent>
          {resetPasswordModal.step === 'input' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5" />
                  Resetear Contraseña
                </DialogTitle>
                <DialogDescription>
                  Establece una contraseña temporal para{' '}
                  <strong>{resetPasswordModal.user?.fullName}</strong>.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="temporaryPassword">Contraseña Temporal</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="temporaryPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={temporaryPassword}
                        onChange={(e) => setTemporaryPassword(e.target.value)}
                        placeholder="Ingresa una contraseña temporal"
                        disabled={isPending}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateRandomPassword}
                      disabled={isPending}
                    >
                      Generar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mínimo 6 caracteres. Comparte esta contraseña con el usuario
                    de forma segura.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCloseResetModal}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGoToConfirm}
                  disabled={!temporaryPassword || temporaryPassword.length < 6}
                >
                  Continuar
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Confirmar Reseteo de Contraseña
                </DialogTitle>
                <DialogDescription className="pt-2 space-y-3">
                  <p>
                    Estás a punto de resetear la contraseña de{' '}
                    <strong>{resetPasswordModal.user?.fullName}</strong> (
                    {resetPasswordModal.user?.username}).
                  </p>
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 space-y-2">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Al confirmar:
                    </p>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
                      <li>La contraseña actual del usuario será reemplazada</li>
                      <li>
                        Si el usuario tiene una sesión activa, seguirá
                        funcionando hasta que cierre sesión
                      </li>
                      <li>
                        El usuario deberá cambiar esta contraseña temporal en su
                        próximo inicio de sesión
                      </li>
                    </ul>
                  </div>
                  <p className="text-sm">
                    Asegúrate de comunicar la nueva contraseña al usuario de
                    forma segura.
                  </p>
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={handleBackToInput}
                  disabled={isPending}
                >
                  Volver
                </Button>
                <Button onClick={handleResetPassword} disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reseteando...
                    </>
                  ) : (
                    'Confirmar Reseteo'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
