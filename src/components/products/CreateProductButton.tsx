'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateProductButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function CreateProductButton({
  variant = 'default',
  size = 'default',
  className,
  showIcon = true,
  children,
}: CreateProductButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/dashboard/products/new');
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
    >
      {showIcon && <Plus className="mr-2 h-4 w-4" />}
      {children || 'Nuevo Producto'}
    </Button>
  );
}
