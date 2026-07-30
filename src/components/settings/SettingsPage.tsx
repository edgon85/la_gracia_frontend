'use client';

import Link from 'next/link';
import { DatabaseBackup, History, ChevronRight } from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const sections = [
  {
    title: 'Respaldos',
    description: 'Crea, descarga y administra los respaldos de la base de datos',
    href: '/dashboard/settings/backups',
    icon: DatabaseBackup,
  },
  {
    title: 'Movimientos',
    description: 'Historial de todos los movimientos de inventario del sistema',
    href: '/dashboard/settings/movements',
    icon: History,
  },
];

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Administra la configuración del sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <CardTitle className="mt-2">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
