'use client';

import { useState } from 'react';
import { IProvider, IProviderContact } from '@/lib';
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
  FlaskConical,
  Plus,
} from 'lucide-react';
import { AddLaboratoryModal } from './AddLaboratoryModal';

interface ProviderDetailModalProps {
  provider: IProvider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactAdded?: () => void;
}

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

  const laboratories = provider.contacts || [];
  const activeLaboratories = laboratories.filter((c) => c.isActive);

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
                    <span className="text-muted-foreground text-xs">
                      Persona de Contacto
                    </span>
                    <p className="font-medium">{provider.contactPerson}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Teléfono
                      </span>
                      <p className="font-medium">{provider.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">
                        Correo Electrónico
                      </span>
                      <p className="font-medium">{provider.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Laboratorios */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Laboratorios ({activeLaboratories.length})
                </h3>
                <Button size="sm" onClick={() => setIsAddContactOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {activeLaboratories.length > 0 ? (
                <div className="space-y-3">
                  {activeLaboratories.map((laboratory) => (
                    <LaboratoryCard
                      key={laboratory.id}
                      laboratory={laboratory}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm bg-muted/30 rounded-lg">
                  <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay laboratorios registrados</p>
                  <p className="text-xs mt-1">
                    Haz clic en "Agregar" para crear uno
                  </p>
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
                  <p className="font-medium">
                    {formatDate(provider.createdAt)}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <span className="text-muted-foreground text-xs">
                    Última Actualización
                  </span>
                  <p className="font-medium">
                    {formatDate(provider.updatedAt)}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      <AddLaboratoryModal
        providerId={provider.id}
        providerName={provider.name}
        open={isAddContactOpen}
        onOpenChange={setIsAddContactOpen}
        onSuccess={onContactAdded}
      />
    </>
  );
}

function LaboratoryCard({ laboratory }: { laboratory: IProviderContact }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 text-sm">
      <div className="font-medium mb-2">{laboratory.name}</div>

      {laboratory.phone && (
        <div className="flex items-center gap-1 text-xs mb-2">
          <Phone className="h-3 w-3 text-muted-foreground" />
          <span>{laboratory.phone}</span>
        </div>
      )}

      {laboratory.notes && (
        <p className="text-xs text-muted-foreground italic">
          {laboratory.notes}
        </p>
      )}
    </div>
  );
}
