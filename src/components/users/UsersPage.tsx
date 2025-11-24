'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { IUserListItem, IUserFilters } from '@/lib';
import { getUsersAction } from '@/actions/user.actions';
import { UsersTable } from './UsersTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Plus, Search, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface UsersPageProps {
  initialUsers: IUserListItem[];
  isAdmin: boolean;
}

export function UsersPage({ initialUsers, isAdmin }: UsersPageProps) {
  const router = useRouter();
  const [users, setUsers] = useState<IUserListItem[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<IUserFilters>({
    search: '',
    isActive: undefined,
    role: undefined,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUsersAction(filters);

      if ('error' in response) {
        toast.error(response.error);
        return;
      }

      setUsers(response.data);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchUsers]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      isActive: value === 'all' ? undefined : value === 'active',
    }));
  };

  const handleRoleFilter = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      role: value === 'all' ? undefined : value,
    }));
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestiona los usuarios del sistema
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => router.push('/dashboard/users/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Usuario
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o username..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={
              filters.isActive === undefined
                ? 'all'
                : filters.isActive
                  ? 'active'
                  : 'inactive'
            }
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.role || 'all'}
            onValueChange={handleRoleFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="user">Usuario</SelectItem>
              <SelectItem value="FARMACIA">Farmacia</SelectItem>
              <SelectItem value="BODEGA">Bodega</SelectItem>
              <SelectItem value="MEDICO">Médico</SelectItem>
              <SelectItem value="ENFERMERO">Enfermero</SelectItem>
              <SelectItem value="AUDITOR">Auditor</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <UsersTable users={users} isAdmin={isAdmin} />
      )}

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {users.length} usuario{users.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
