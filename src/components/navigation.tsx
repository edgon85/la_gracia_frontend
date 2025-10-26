'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ShoppingCart,
  Settings,
  FileText,
  Plus,
  Bell,
} from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Inventario',
      href: '/dashboard/inventario',
      icon: Package,
    },
    {
      title: 'Pedidos',
      href: '/dashboard/pedidos',
      icon: ShoppingCart,
    },
    {
      title: 'Reportes',
      href: '/dashboard/reportes',
      icon: BarChart3,
    },
    {
      title: 'Configuración',
      href: '/dashboard/configuración',
      icon: Settings,
    },
  ];

  return (
    <div className="pb-12">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Hospital La Gracia
          </h2>
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'transparent'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Acciones Rápidas
          </h2>
          <div className="space-y-1">
            <Link
              href="/dashboard/pedidos/nuevo"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Pedido
            </Link>
            <Link
              href="/dashboard/inventario/entrada"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Package className="mr-2 h-4 w-4" />
              Registrar Entrada
            </Link>
            <Link
              href="/dashboard/reportes/generar"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generar Reporte
            </Link>
            <Link
              href="/dashboard/alertas"
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Bell className="mr-2 h-4 w-4" />
              Ver Alertas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
