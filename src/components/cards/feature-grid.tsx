import CardGrid from './card-grid';
import FeatureCard from './feature-card';

interface FeatureGridProps {
  experiences: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    location: string;
  }[];
  handleCardClick: (id: string) => void;
  handleQrIconClick: (
    event: React.MouseEvent<HTMLButtonElement>,
    id: any,
    title: any,
  ) => void;
}

const FeatureGrid = ({
  experiences,
  handleCardClick,
  handleQrIconClick,
}: FeatureGridProps) => {
  return (
    <CardGrid>
      {experiences.map((experience) => (
        <FeatureCard
          key={experience.id}
          item={experience}
          handleCardClick={handleCardClick}
          handleQrIconClick={handleQrIconClick}
        />
      ))}
    </CardGrid>
  );
};

export default FeatureGrid;
