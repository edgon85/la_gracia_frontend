'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  ArrowLeftRight,
  FlaskConical,
  FileText,
  Truck,
  ShoppingCart,
  Users,
  BarChart3,
  BellRing,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { LogoutButton } from '../buttons';

interface SubMenuItem {
  label: string;
  href: string;
  badge?: number;
}

interface MenuItem {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href?: string;
  badge?: number;
  subItems?: SubMenuItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
  },
  {
    label: 'Catalogo',
    icon: Package,
    subItems: [
      { label: 'Productos', href: '/dashboard/products' },
      { label: 'Categorías', href: '/dashboard/categories' },
      {
        label: 'Próximos a vencer',
        href: '/dashboard/productos/vencimiento',
        badge: 12,
      },
    ],
  },
  {
    label: 'Inventario',
    icon: ArrowLeftRight,
    subItems: [
      { label: 'Movimientos', href: '/dashboard/inventario/movimientos' },
      { label: 'Ajustes', href: '/dashboard/inventario/ajustes' },
      { label: 'Transferencias', href: '/dashboard/inventario/transferencias' },
    ],
  },
  {
    label: 'Farmacia',
    icon: FlaskConical,
    subItems: [
      { label: 'Despachos', href: '/dashboard/farmacia/despachos' },
      { label: 'Recetas', href: '/dashboard/farmacia/recetas', badge: 5 },
      { label: 'Stock', href: '/dashboard/farmacia/stock' },
    ],
  },
  {
    label: 'Solicitudes',
    icon: FileText,
    badge: 8,
    subItems: [
      {
        label: 'Pendientes',
        href: '/dashboard/solicitudes/pendientes',
        badge: 8,
      },
      { label: 'Aprobadas', href: '/dashboard/solicitudes/aprobadas' },
      { label: 'Historial', href: '/dashboard/solicitudes/historial' },
    ],
  },
  {
    label: 'Proveedores',
    icon: Truck,
    href: '/dashboard/providers',
  },
  {
    label: 'Compras',
    icon: ShoppingCart,
    href: '/dashboard/compras',
  },
  {
    label: 'Usuarios',
    icon: Users,
    href: '/dashboard/users',
  },
  {
    label: 'Reportes',
    icon: BarChart3,
    href: '/dashboard/reportes',
  },
  {
    label: 'Alertas',
    icon: BellRing,
    href: '/dashboard/alertas',
    badge: 3,
  },
];

export const Sidebar = (props: SidebarProps) => {
  const { isOpen, onClose } = props;
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href?: string, subItems?: SubMenuItem[]) => {
    if (href) {
      return pathname === href;
    }
    if (subItems) {
      return subItems.some((item) => pathname === item.href);
    }
    return false;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out z-50
          w-64
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">HM</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-white">
                  La Gracia
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hospital
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.label);
              const itemIsActive = isActive(item.href, item.subItems);

              return (
                <div key={item.label}>
                  {hasSubItems ? (
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 rounded-lg
                        transition-colors text-sm font-medium
                        ${
                          itemIsActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className={`
                        flex items-center justify-between px-3 py-2 rounded-lg
                        transition-colors text-sm font-medium
                        ${
                          itemIsActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}

                  {hasSubItems && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems?.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`
                            flex items-center justify-between px-3 py-2 rounded-lg
                            transition-colors text-sm
                            ${
                              pathname === subItem.href
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }
                          `}
                        >
                          <span>{subItem.label}</span>
                          {subItem.badge && subItem.badge > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <LogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
};
