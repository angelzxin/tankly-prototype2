export function MapBackground() {
  return (
    <svg className="map-art" viewBox="0 0 1000 650" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1000" height="650" fill="#ecebe6" />
      <g fill="#dfe5d8">
        <path d="M0 0h250l15 105-90 83L0 160Z" />
        <path d="m670 0 330 0v180l-135-12-73-90Z" />
        <path d="m0 480 160-50 102 57-34 163H0Z" />
        <path d="m705 445 122-45 173 37v213H670Z" />
      </g>
      <g stroke="#fff" strokeWidth="14" fill="none">
        <path d="M-20 150C170 180 285 250 445 245s302-122 585-85" />
        <path d="M170-30c5 115 66 206 58 346s-26 240 20 365" />
        <path d="M520-30c-35 170 18 268 7 390s-62 193-44 320" />
        <path d="M820-30c-32 130-7 239-43 342s-78 201-58 368" />
        <path d="M-30 400c156-38 244-44 377-16s290 108 684 32" />
        <path d="M-20 555c191-31 308-51 434-17s353 53 620-8" />
      </g>
      <g stroke="#cbc9c2" strokeWidth="2" fill="none">
        <path d="M-20 150C170 180 285 250 445 245s302-122 585-85" />
        <path d="M170-30c5 115 66 206 58 346s-26 240 20 365" />
        <path d="M520-30c-35 170 18 268 7 390s-62 193-44 320" />
        <path d="M820-30c-32 130-7 239-43 342s-78 201-58 368" />
        <path d="M-30 400c156-38 244-44 377-16s290 108 684 32" />
        <path d="M-20 555c191-31 308-51 434-17s353 53 620-8" />
      </g>
      <g stroke="#f0eee9" strokeWidth="7" fill="none">
        <path d="m20 300 900 15M330 0l-25 650M650 0l23 650M0 490l1000-250" />
      </g>
      <path
        d="M402 581c29-65 70-97 76-174s-34-115 30-162 126-21 184-68"
        fill="none"
        stroke="#252525"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="M402 581c29-65 70-97 76-174s-34-115 30-162 126-21 184-68"
        fill="none"
        stroke="#43b69e"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <circle cx="402" cy="581" r="10" fill="#fff" stroke="#242424" strokeWidth="5" />
      <circle cx="692" cy="177" r="10" fill="#43b69e" stroke="#fff" strokeWidth="5" />
      <g fill="#696963" fontSize="14" fontFamily="Inter, sans-serif">
        <text x="69" y="128">Silver Lake</text>
        <text x="690" y="90">Atwater Village</text>
        <text x="535" y="470">Glendale Blvd</text>
        <text x="120" y="522">Echo Park</text>
      </g>
    </svg>
  );
}
