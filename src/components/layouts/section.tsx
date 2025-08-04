import { cn } from '@/utils/class';

type SectionProps = React.ComponentProps<'section'>;

const Section = ({ className, ...props }: SectionProps) => {
  return (
    <section className={cn('flex flex-col gap-3', className)} {...props} />
  );
};

export default Section;
