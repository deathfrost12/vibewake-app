import React from 'react';
import {
  TouchableOpacity,
  Text,
  type TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  // Base classes
  const baseClasses = 'items-center justify-center rounded-xl min-h-12';

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary shadow-lg',
    secondary: 'bg-secondary-100',
    outline: 'border-2 border-primary bg-transparent',
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  // Text variant classes
  const textVariantClasses = {
    primary: 'text-white font-semibold',
    secondary: 'text-secondary-700 font-medium',
    outline: 'text-primary font-semibold',
  };

  // Text size classes
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledClasses = isDisabled ? 'opacity-50' : '';

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabledClasses,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const textClasses = [textVariantClasses[variant], textSizeClasses[size]].join(
    ' '
  );

  return (
    <TouchableOpacity
      className={buttonClasses}
      disabled={isDisabled}
      {...props}
    >
      <Text className={textClasses}>{isLoading ? 'Loading...' : title}</Text>
    </TouchableOpacity>
  );
}
