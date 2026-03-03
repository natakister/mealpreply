export default function WelcomeHero({ className = "" }) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <div
        className="w-full h-48"
        style={{
          borderTopLeftRadius: '40px',
          borderTopRightRadius: '0px',
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '40px',
          overflow: 'hidden'
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}welcome-hero.png`}
          alt="Meal prep with family"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
