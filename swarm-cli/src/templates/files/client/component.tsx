import { twMerge } from 'tailwind-merge';

interface {{ComponentName}}Props {
  className?: string;
}

export const {{ComponentName}} = ({ className, ...props }: {{ComponentName}}Props) => {
  return (
    <div className={twMerge('', className)}>
      {/* Add component content */}
    </div>
  );
}; 