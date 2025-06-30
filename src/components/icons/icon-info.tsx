type IconInfoProps = React.ComponentProps<'svg'>;

const IconInfo: React.FC<IconInfoProps> = (props) => {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Outer purple ring */}
      <circle
        cx="28"
        cy="28"
        r="22"
        stroke="#A033FF"
        strokeWidth="4"
        fill="none"
      />

      {/* Top-left red rectangle */}
      <rect
        x="11"
        y="11"
        width="6"
        height="6"
        transform="rotate(45 11 11)"
        fill="#FF4411"
      />

      {/* Dot of the i */}
      <circle cx="28" cy="16" r="3" fill="#FF4411" />

      {/* Horizontal stroke (serif under the dot) */}
      <rect x="22" y="21" width="8" height="4" rx="2" fill="#FF4411" />

      {/* Stem of the i */}
      <rect x="26" y="22" width="4" height="18" rx="2" fill="#FF4411" />

      {/* Rounded base */}
      <rect x="22" y="37" width="12" height="4" rx="2" fill="#FF4411" />
    </svg>
  );
};

export default IconInfo;
