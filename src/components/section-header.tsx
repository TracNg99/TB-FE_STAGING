import { cn } from '@/utils/class';

type SectionHeaderProps = {
  className?: string;
  classNames?: {
    root?: string;
    title?: string;
    subtitle?: string;
  };
  title: React.ReactNode;
  icon?: React.ReactNode;
  subtitle?: React.ReactNode;
};

const SectionHeader = ({
  title,
  icon,
  subtitle,
  className,
  classNames,
}: SectionHeaderProps) => {
  return (
    <div className={cn('flex flex-col gap-2', className, classNames?.root)}>
      <div className="flex gap-2 items-start">
        {icon}
        <h2
          className={cn(
            'text-base-black font-semibold text-display-sm lg:text-display-md',
            classNames?.title,
          )}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p
          className={cn(
            'text-base-black/75 text-sm lg:text-md',
            classNames?.subtitle,
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
