import { cn } from '@/utils/class';

type SectionProps = React.ComponentProps<'section'>;

const Section = ({ className, ...props }: SectionProps) => {
  return (
    <section className={cn('px-4 max-w-pc mx-auto', className)} {...props} />
  );
};

export default Section;
