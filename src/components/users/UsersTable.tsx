'use client';

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
import { Pencil, Shield } from 'lucide-react';

interface UsersTableProps {
  users: IUserListItem[];
  isAdmin: boolean;
}

export function UsersTable({ users, isAdmin }: UsersTableProps) {
  const router = useRouter();

  const handleEdit = (id: string) => {
    router.push(`/dashboard/users/${id}/edit`);
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user.id)}
                      title="Editar usuario"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
