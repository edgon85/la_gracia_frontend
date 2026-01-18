'use client';

import { useState } from 'react';
import { IProvider, IProviderContact, ContactDepartment } from '@/lib';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
  Calendar,
  Hash,
  Users,
  Plus,
  Star,
  Briefcase,
} from 'lucide-react';
import { AddContactModal } from './AddContactModal';

interface ProviderDetailModalProps {
  provider: IProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactAdded?: () => void;
}

const departmentLabels: Record<ContactDepartment, string> = {
  farmacia: 'Farmacia',
  bodega: 'Bodega',
  general: 'General',
  ventas: 'Ventas',
  cobranza: 'Cobranza',
};

const departmentColors: Record<ContactDepartment, string> = {
  farmacia: 'bg-blue-500',
  bodega: 'bg-amber-500',
  general: 'bg-gray-500',
  ventas: 'bg-green-500',
  cobranza: 'bg-purple-500',
};

export function ProviderDetailModal({
  provider,
  open,
  onOpenChange,
  onContactAdded,
}: ProviderDetailModalProps) {
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);

  if (!provider) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const contacts = provider.contacts || [];
  const activeContacts = contacts.filter((c) => c.isActive);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5" />
              {provider.name}
            </DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              {provider.isActive ? (
                <Badge className="bg-green-500">Activo</Badge>
              ) : (
                <Badge variant="destructive">Inactivo</Badge>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información de Identificación */}
            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Identificación
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-muted-foreground text-xs">NIT</span>
                  <p className="font-medium text-lg">{provider.nit}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Información de Contacto Principal (Legacy) */}
            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Contacto Principal
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Persona de Contacto</span>
                    <p className="font-medium">{provider.contactPerson}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Teléfono</span>
                      <p className="font-medium">{provider.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Correo Electrónico</span>
                      <p className="font-medium">{provider.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Contactos Adicionales */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Contactos ({activeContacts.length})
                </h3>
                <Button size="sm" onClick={() => setIsAddContactOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {activeContacts.length > 0 ? (
                <div className="space-y-3">
                  {activeContacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm bg-muted/30 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay contactos adicionales registrados</p>
                  <p className="text-xs mt-1">Haz clic en "Agregar" para crear uno</p>
                </div>
              )}
            </section>

            <Separator />

            {/* Dirección */}
            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección
              </h3>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p>{provider.address}</p>
              </div>
            </section>

            {/* Notas */}
            {provider.notes && (
              <>
                <Separator />
                <section>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notas
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm">
                    <p className="whitespace-pre-wrap">{provider.notes}</p>
                  </div>
                </section>
              </>
            )}

            {/* Fechas */}
            <Separator />
            <section>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Información del Registro
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-muted-foreground text-xs">Creado</span>
                  <p className="font-medium">{formatDate(provider.createdAt)}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-muted-foreground text-xs">Última Actualización</span>
                  <p className="font-medium">{formatDate(provider.updatedAt)}</p>
                </div>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      <AddContactModal
        providerId={provider.id}
        providerName={provider.name}
        open={isAddContactOpen}
        onOpenChange={setIsAddContactOpen}
        onSuccess={onContactAdded}
      />
    </>
  );
}

function ContactCard({ contact }: { contact: IProviderContact }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 text-sm">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{contact.name}</span>
          {contact.isMain && (
            <Badge variant="outline" className="text-xs gap-1 border-yellow-500 text-yellow-600">
              <Star className="h-3 w-3" />
              Principal
            </Badge>
          )}
        </div>
        <Badge className={`${departmentColors[contact.department]} text-white text-xs`}>
          {departmentLabels[contact.department]}
        </Badge>
      </div>

      {contact.position && (
        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-2">
          <Briefcase className="h-3 w-3" />
          {contact.position}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        {contact.phone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
      </div>

      {contact.notes && (
        <p className="text-xs text-muted-foreground mt-2 italic">
          {contact.notes}
        </p>
      )}
    </div>
  );
}
