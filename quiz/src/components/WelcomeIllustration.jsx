export default function WelcomeIllustration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 320 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circles */}
      <circle cx="160" cy="100" r="50" fill="#4D49D2" opacity="0.15" />
      <circle cx="70" cy="110" r="40" fill="#E6348C" opacity="0.15" />
      <circle cx="250" cy="110" r="40" fill="#FF9900" opacity="0.15" />

      {/* Carrot (left) */}
      <g transform="translate(45, 50)">
        {/* Body */}
        <path
          d="M25 30 L35 120 C35 125 15 125 15 120 L25 30"
          fill="#FF7F32"
        />
        {/* Leaves */}
        <path
          d="M20 35 Q10 15 25 20 Q20 5 30 15 Q40 5 35 20 Q45 15 35 35"
          fill="#4CAF50"
        />
        {/* Face */}
        <circle cx="25" cy="65" r="18" fill="#FFA64D" />
        {/* Glasses */}
        <circle cx="19" cy="62" r="7" fill="none" stroke="#4D49D2" strokeWidth="2" />
        <circle cx="31" cy="62" r="7" fill="none" stroke="#4D49D2" strokeWidth="2" />
        <line x1="26" y1="62" x2="24" y2="62" stroke="#4D49D2" strokeWidth="2" />
        {/* Eyes */}
        <circle cx="19" cy="62" r="2" fill="#2C2C2C" />
        <circle cx="31" cy="62" r="2" fill="#2C2C2C" />
        {/* Smile */}
        <path
          d="M20 72 Q25 78 30 72"
          fill="none"
          stroke="#2C2C2C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Waving hand */}
        <ellipse cx="48" cy="45" rx="8" ry="6" fill="#FFA64D" />
        <path
          d="M45 80 Q55 60 48 45"
          fill="none"
          stroke="#FF7F32"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>

      {/* Broccoli (center) */}
      <g transform="translate(120, 30)">
        {/* Stem */}
        <rect x="35" y="90" width="12" height="50" rx="4" fill="#7CB342" />
        {/* Florets */}
        <circle cx="25" cy="55" r="18" fill="#4CAF50" />
        <circle cx="41" cy="45" r="20" fill="#66BB6A" />
        <circle cx="58" cy="55" r="18" fill="#4CAF50" />
        <circle cx="33" cy="35" r="15" fill="#81C784" />
        <circle cx="50" cy="35" r="15" fill="#81C784" />
        <circle cx="41" cy="25" r="12" fill="#A5D6A7" />
        {/* Face */}
        <circle cx="41" cy="60" r="20" fill="#81C784" />
        {/* Eyes */}
        <circle cx="34" cy="55" r="3" fill="#2C2C2C" />
        <circle cx="48" cy="55" r="3" fill="#2C2C2C" />
        <circle cx="35" cy="54" r="1" fill="white" />
        <circle cx="49" cy="54" r="1" fill="white" />
        {/* Big smile */}
        <path
          d="M32 68 Q41 78 50 68"
          fill="none"
          stroke="#2C2C2C"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Tablet/clipboard */}
        <g transform="translate(55, 75)">
          <rect x="0" y="0" width="30" height="40" rx="4" fill="#4D49D2" />
          <rect x="3" y="3" width="24" height="34" rx="2" fill="white" />
          {/* Checklist lines */}
          <rect x="6" y="8" width="4" height="4" rx="1" fill="#CCFF33" />
          <rect x="12" y="9" width="12" height="2" rx="1" fill="#E0E0E0" />
          <rect x="6" y="16" width="4" height="4" rx="1" fill="#CCFF33" />
          <rect x="12" y="17" width="12" height="2" rx="1" fill="#E0E0E0" />
          <rect x="6" y="24" width="4" height="4" rx="1" fill="#4D49D2" opacity="0.3" />
          <rect x="12" y="25" width="12" height="2" rx="1" fill="#E0E0E0" />
        </g>
        {/* Arm holding tablet */}
        <path
          d="M55 90 Q65 85 60 80"
          fill="none"
          stroke="#7CB342"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </g>

      {/* Banana (right) */}
      <g transform="translate(220, 55)">
        {/* Body */}
        <path
          d="M30 20 Q55 30 55 70 Q55 110 35 115 Q20 115 20 100 Q10 60 30 20"
          fill="#FFD54F"
        />
        <path
          d="M28 25 Q50 35 50 70 Q50 100 35 105"
          fill="none"
          stroke="#FFECB3"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Stem */}
        <rect x="25" y="10" width="10" height="15" rx="3" fill="#8D6E63" />
        {/* Face */}
        <circle cx="38" cy="60" r="18" fill="#FFE082" />
        {/* Eyes */}
        <circle cx="32" cy="55" r="2.5" fill="#2C2C2C" />
        <circle cx="44" cy="55" r="2.5" fill="#2C2C2C" />
        {/* Happy closed eyes (welcoming) */}
        <path
          d="M29 55 Q32 52 35 55"
          fill="none"
          stroke="#2C2C2C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M41 55 Q44 52 47 55"
          fill="none"
          stroke="#2C2C2C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Smile */}
        <path
          d="M32 68 Q38 75 44 68"
          fill="none"
          stroke="#2C2C2C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Welcoming hand */}
        <ellipse cx="12" cy="50" rx="7" ry="5" fill="#FFE082" />
        <path
          d="M20 85 Q5 70 12 50"
          fill="none"
          stroke="#FFD54F"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
