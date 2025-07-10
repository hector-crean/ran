const GreyscaleMask = () => {
  return (
    <svg width="0" height="0">
      <filter id="greyscale-mask">
        <feColorMatrix
          type="matrix"
          values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"
        />
      </filter>
    </svg>
  );
};

export default GreyscaleMask;
