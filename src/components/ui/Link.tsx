import NextLink from 'next/link';
import clsx from 'clsx';
import { ComponentProps } from 'react';

interface LinkProps extends ComponentProps<typeof NextLink> {
  variant?: 'primary' | 'secondary';
}

export function Link({ className, variant = 'primary', ...props }: LinkProps) {
  return (
    <NextLink
      className={clsx(
        'font-medium transition-colors',
        {
          'text-[#F907A7] hover:text-[#F907A7]/80': variant === 'primary',
          'text-gray-600 hover:text-gray-800': variant === 'secondary',
        },
        className
      )}
      {...props}
    />
  );
} 