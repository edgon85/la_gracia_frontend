import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Users,
  Truck,
  FlaskConical,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
} from 'lucide-react';
import { getValidatedUser } from '@/actions/auth.actions';
import { getProductsAction } from '@/actions/product.actions';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getValidatedUser();

  if (!user) {
    redirect('/login');
  }

  // Obtener estadísticas de productos
  const productsResponse = await getProductsAction({ limit: 1000 });
  const products = 'error' in productsResponse ? [] : productsResponse.data;

  const totalProducts = products.length;
  const lowStockProducts = products.filter(
    (p) => p.totalStock <= p.minimumStock && p.totalStock > 0
  ).length;
  const outOfStockProducts = products.filter((p) => p.totalStock <= 0).length;

  // Accesos rápidos principales
  const quickActions = [
    {
      title: 'Dispensar Productos',
      description: 'Registrar salida de medicamentos',
      icon: FlaskConical,
      href: '/dashboard/farmacia/despachos',
      color: 'bg-blue-500',
      highlight: true,
    },
    {
      title: 'Ver Productos',
      description: 'Catálogo completo de productos',
      icon: Package,
      href: '/dashboard/products',
      color: 'bg-green-500',
    },
    {
      title: 'Nuevo Producto',
      description: 'Agregar al inventario',
      icon: Plus,
      href: '/dashboard/products/new',
      color: 'bg-purple-500',
    },
    {
      title: 'Proveedores',
      description: 'Gestionar proveedores',
      icon: Truck,
      href: '/dashboard/providers',
      color: 'bg-orange-500',
    },
  ];

  // Módulos del sistema
  const modules: {
    title: string;
    items: { label: string; href: string; count?: number; highlight?: boolean }[];
  }[] = [
    {
      title: 'Catálogo',
      items: [
        { label: 'Productos', href: '/dashboard/products', count: totalProducts },
        { label: 'Categorías', href: '/dashboard/categories' },
        { label: 'Próximos a vencer', href: '/dashboard/productos/vencimiento' },
      ],
    },
    {
      title: 'Farmacia',
      items: [
        { label: 'Dispensación', href: '/dashboard/farmacia/despachos', highlight: true },
        { label: 'Recetas', href: '/dashboard/farmacia/recetas' },
        { label: 'Stock', href: '/dashboard/farmacia/stock' },
      ],
    },
    {
      title: 'Administración',
      items: [
        { label: 'Usuarios', href: '/dashboard/users' },
        { label: 'Proveedores', href: '/dashboard/providers' },
        { label: 'Reportes', href: '/dashboard/reportes' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header con saludo */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¡Hola, {user.fullName.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Bienvenido al Sistema de Inventario - La Gracia
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/farmacia/despachos">
              <FlaskConical className="h-4 w-4 mr-2" />
              Ir a Dispensación
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProducts}</p>
                <p className="text-xs text-muted-foreground">Productos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalProducts - lowStockProducts - outOfStockProducts}
                </p>
                <p className="text-xs text-muted-foreground">Stock OK</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={lowStockProducts > 0 ? 'border-yellow-300 dark:border-yellow-700' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{lowStockProducts}</p>
                <p className="text-xs text-muted-foreground">Stock Bajo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={outOfStockProducts > 0 ? 'border-red-300 dark:border-red-700' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{outOfStockProducts}</p>
                <p className="text-xs text-muted-foreground">Sin Stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card
                className={`h-full transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer ${
                  action.highlight
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 ${action.color} rounded-lg`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Módulos del Sistema */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Módulos del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card key={module.title}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  {module.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {module.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between p-2 rounded-lg transition-colors hover:bg-muted ${
                      item.highlight ? 'bg-primary/5' : ''
                    }`}
                  >
                    <span className="text-sm">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.count !== undefined && (
                        <Badge variant="secondary" className="text-xs">
                          {item.count}
                        </Badge>
                      )}
                      {item.highlight && (
                        <Badge className="text-xs">Nuevo</Badge>
                      )}
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info del usuario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tu Cuenta
          </CardTitle>
          <CardDescription>Información de tu sesión actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Usuario</p>
              <p className="font-medium">{user.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Roles</p>
              <div className="flex gap-1 mt-1">
                {user.roles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
