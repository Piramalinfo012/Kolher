import React, { useMemo } from 'react';
import { Finish, Handle } from '../types';

export interface VisualizerFinishInput {
  finish_code?: string;
  finish_name?: string;
  color_hex?: string;
}

export interface VisualizerHandleInput {
  handle_name?: string;
  handle_model?: string;
  material?: string;
  texture_image_url?: string;
}

export interface FinishThemeProps {
  id: string;
  base1: string;
  base2: string;
  base3: string;
  dark: string;
  highlight: string;
  sheen: string;
  capFilter: string;
}

export function getFinishThemeProps(
  finish?: Finish | VisualizerFinishInput | string | null
): FinishThemeProps {
  const code = typeof finish === 'string' 
    ? finish.toUpperCase() 
    : (finish?.finish_code || '').toUpperCase();
  const name = typeof finish === 'string'
    ? finish.toUpperCase()
    : (finish?.finish_name || '').toUpperCase();

  // 1. ORO (OR) - Polished 24k Mirror Gold
  if (code === 'OR' || name === 'ORO' || name === 'POLISHED GOLD') {
    return {
      id: 'gold_polished',
      base1: '#FFF0AA',
      base2: '#E5B824',
      base3: '#A8810E',
      dark: '#6E5205',
      highlight: '#FFFFFF',
      sheen: '#FEE066',
      capFilter: 'sepia(0.85) saturate(2.4) brightness(1.1)'
    };
  }

  // 2. ORO SPAZZOLATO (OS) - Brushed Gold
  if (
    code === 'OS' || 
    code.includes('GOLD') || 
    code.includes('ORO') || 
    name.includes('ORO') || 
    name.includes('GOLD') || 
    name.includes('BRASS') || 
    code === '2MB' || 
    code === 'AF'
  ) {
    return {
      id: 'gold',
      base1: '#F6E294',
      base2: '#D4AF37',
      base3: '#A37E19',
      dark: '#7A5B0D',
      highlight: '#FFF4C8',
      sheen: '#E8C757',
      capFilter: 'sepia(0.8) hue-rotate(5deg) saturate(2)'
    };
  }

  // 3. BRONZO AMBRATO (BA) - Amber Bronze
  if (code === 'BA' || code.includes('AMBR') || name.includes('AMBRATO') || name.includes('AMBER')) {
    return {
      id: 'bronzo_ambrato',
      base1: '#E6A265',
      base2: '#B86F28',
      base3: '#854612',
      dark: '#542805',
      highlight: '#FCE0C5',
      sheen: '#D4863E',
      capFilter: 'sepia(0.85) hue-rotate(-15deg) saturate(2)'
    };
  }

  // 4. BRONZO SPAZZOLATO (BS) - Brushed Copper-Bronze
  if (
    code === 'BS' || 
    code === 'BV' || 
    code.includes('BRONZ') || 
    name.includes('BRONZO') || 
    name.includes('BRONZE')
  ) {
    return {
      id: 'bronze',
      base1: '#C89360',
      base2: '#9E6B39',
      base3: '#734A21',
      dark: '#4D3012',
      highlight: '#EFCBB0',
      sheen: '#B57E47',
      capFilter: 'sepia(0.9) hue-rotate(-10deg) saturate(1.8)'
    };
  }

  // 5. BRONZO MOKA (BM / KS) - Mocha Bronze
  if (
    code === 'KS' || 
    code === 'BM' || 
    code.includes('MOKA') || 
    name.includes('MOKA') || 
    name.includes('MOCHA')
  ) {
    return {
      id: 'moka',
      base1: '#A88E7B',
      base2: '#7E6655',
      base3: '#5C483B',
      dark: '#3D2F26',
      highlight: '#D6C5B8',
      sheen: '#8C725F',
      capFilter: 'sepia(0.6) hue-rotate(-15deg) saturate(0.9) brightness(0.9)'
    };
  }

  // 6. CROMO NERO (CN) - Polished Black Chrome (Gloss)
  if (code === 'CN' || (name.includes('CROMO NERO') && !name.includes('SPAZZOLATO'))) {
    return {
      id: 'black_chrome_gloss',
      base1: '#84878E',
      base2: '#3D3E42',
      base3: '#18191B',
      dark: '#0C0D0E',
      highlight: '#D4D6DC',
      sheen: '#52545A',
      capFilter: 'grayscale(1) brightness(0.35)'
    };
  }

  // 7. CROMO NERO SPAZZOLATO (CNS) / TITANIUM
  if (
    code === 'CNS' || 
    code === 'TT' || 
    name.includes('CROMO NERO SPAZZOLATO') || 
    name.includes('TITANIUM')
  ) {
    return {
      id: 'black_chrome',
      base1: '#6E7075',
      base2: '#3D3E42',
      base3: '#222326',
      dark: '#141517',
      highlight: '#A0A2A8',
      sheen: '#4B4D52',
      capFilter: 'grayscale(1) brightness(0.4)'
    };
  }

  // 8. NERO OPACO (NO / BL) - Matte Black
  if (
    code === 'NO' || 
    code === 'BL' || 
    name.includes('NERO OPACO') || 
    name.includes('MATTE BLACK')
  ) {
    return {
      id: 'nero_opaco',
      base1: '#3D3E42',
      base2: '#242528',
      base3: '#161719',
      dark: '#0A0A0C',
      highlight: '#6A6B70',
      sheen: '#2E3034',
      capFilter: 'grayscale(1) brightness(0.2)'
    };
  }

  // 9. BIANCO OPACO (BO) - Matte White
  if (
    code === 'BO' || 
    code.includes('BIANCO') || 
    name.includes('BIANCO OPACO') || 
    name.includes('MATTE WHITE')
  ) {
    return {
      id: 'bianco_opaco',
      base1: '#FFFFFF',
      base2: '#EDEAE2',
      base3: '#D4D0C5',
      dark: '#A6A296',
      highlight: '#FFFFFF',
      sheen: '#F9F8F5',
      capFilter: 'grayscale(1) brightness(1.5)'
    };
  }

  // 10. NICKEL SPAZZOLATO (NS) - Brushed Nickel
  if (code === 'NS' || name.includes('NICKEL') || name.includes('BRUSHED NICKEL')) {
    return {
      id: 'nickel_spazzolato',
      base1: '#E8E5DC',
      base2: '#C0BBAE',
      base3: '#918B7D',
      dark: '#635D52',
      highlight: '#FAF9F5',
      sheen: '#D4CFBE',
      capFilter: 'sepia(0.25) saturate(0.8)'
    };
  }

  // 11. CHAMPAGNE LUCIDO (CL) - Polished Pale Champagne
  if (code === 'CL' || (name.includes('CHAMPAGNE') && name.includes('LUCIDO'))) {
    return {
      id: 'champagne_lucido',
      base1: '#F9F1E1',
      base2: '#DFC8A2',
      base3: '#A68E65',
      dark: '#735F3C',
      highlight: '#FFFFFF',
      sheen: '#ECDAB8',
      capFilter: 'sepia(0.4) saturate(1.4) brightness(1.1)'
    };
  }

  // 12. CHAMPAGNE SPAZZOLATO (CS) - Brushed Champagne
  if (
    code === 'CS' || 
    code.includes('CHAMP') || 
    name.includes('CHAMPAGNE')
  ) {
    return {
      id: 'champagne',
      base1: '#EAD9B8',
      base2: '#C9B58D',
      base3: '#99845B',
      dark: '#6E5C38',
      highlight: '#FAF4E6',
      sheen: '#D9C6A0',
      capFilter: 'sepia(0.4) saturate(1.2)'
    };
  }

  // 13. CROMO (CR / CP) - Polished Mirror Chrome
  if (code === 'CR' || code === 'CP' || name.includes('CROMO') || name.includes('CHROME')) {
    return {
      id: 'cromo',
      base1: '#FFFFFF',
      base2: '#D4D8DE',
      base3: '#989DA6',
      dark: '#5C6069',
      highlight: '#FFFFFF',
      sheen: '#E8ECF2',
      capFilter: 'grayscale(1) brightness(1.1)'
    };
  }

  // 14. ROSE GOLD / RGD
  if (
    code === 'RGD' || 
    code.includes('ROSE') || 
    name.includes('ROSE')
  ) {
    return {
      id: 'rose_gold',
      base1: '#E8B6A8',
      base2: '#C58F80',
      base3: '#9E6454',
      dark: '#734033',
      highlight: '#F9DDD6',
      sheen: '#D69E8F',
      capFilter: 'sepia(0.7) hue-rotate(-20deg) saturate(1.5)'
    };
  }

  // Default: INOX / Brushed Stainless Steel
  return {
    id: 'inox',
    base1: '#EDEDED',
    base2: '#C5C6C8',
    base3: '#9A9B9E',
    dark: '#68696B',
    highlight: '#FFFFFF',
    sheen: '#DBDCDE',
    capFilter: 'grayscale(1) brightness(1.05)'
  };
}

export function getHandleMaterialType(
  handle?: Handle | VisualizerHandleInput | string | null
): string {
  const name = typeof handle === 'string'
    ? handle.toUpperCase()
    : (handle?.handle_name || '').toUpperCase();
  const mat = typeof handle === 'string'
    ? ''
    : (handle?.material || '').toUpperCase();

  if (name.includes('CALACATTA') || name.includes('WHITE') || name.includes('BIANCO')) {
    return 'CALACATTA';
  }
  if (name.includes('MARQUINA') || name.includes('NERO') || (name.includes('BLACK') && mat.includes('MARBLE'))) {
    return 'NERO_MARQUINA';
  }
  if (name.includes('LEPANTO') || name.includes('ROSSO') || name.includes('RED')) {
    return 'ROSSO_LEPANTO';
  }
  if (name.includes('GUATEMALA') || name.includes('VERDE') || name.includes('GREEN')) {
    return 'VERDE_GUATEMALA';
  }
  if (name.includes('LEGNO') || name.includes('WOOD') || name.includes('WALNUT')) {
    return 'LEGNO_SCURO';
  }
  if (name.includes('AVORIO') || name.includes('IVORY')) {
    return 'RESINA_AVORIO';
  }
  if (name.includes('TARTARUGA') || name.includes('TORTOISE')) {
    return 'RESINA_TARTARUGA';
  }
  if (name.includes('CORNO') || name.includes('HORN')) {
    return 'RESINA_CORNO';
  }
  if (mat === 'METAL' || name.includes('MATCH') || name.includes('INOX') || name.includes('OYL') || name.includes('TUBE')) {
    return 'METALLIC_MATCH';
  }
  return 'METALLIC_MATCH';
}

/**
 * Generate FLO Miscelatore lavabo (F3801ZS) Organic Architectural Faucet SVG
 */
function generateFloFaucetSvg(
  finishProps: FinishThemeProps,
  options: { width?: number; height?: number; transparentBg?: boolean } = {}
): string {
  const width = options.width || 800;
  const height = options.height || 900;
  const bgFill = options.transparentBg
    ? ''
    : '<rect width="800" height="900" rx="36" fill="#F8F8F9"/>';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="${width}" height="${height}">
  <defs>
    <!-- Soft Studio Ground Floor Shadow -->
    <radialGradient id="flo-floor-shadow-main" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#141518" stop-opacity="0.38" />
      <stop offset="35%" stop-color="#3b3d45" stop-opacity="0.22" />
      <stop offset="70%" stop-color="#7a7d88" stop-opacity="0.06" />
      <stop offset="100%" stop-color="#c0c2c8" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="flo-floor-shadow-spout" cx="30%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#141518" stop-opacity="0.28" />
      <stop offset="50%" stop-color="#4a4c55" stop-opacity="0.10" />
      <stop offset="100%" stop-color="#c0c2c8" stop-opacity="0" />
    </radialGradient>

    <!-- FLO Flared Body Vertical Metal Gradient -->
    <linearGradient id="flo-body-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${finishProps.dark}" />
      <stop offset="14%" stop-color="${finishProps.base3}" />
      <stop offset="28%" stop-color="${finishProps.highlight}" />
      <stop offset="42%" stop-color="${finishProps.sheen}" />
      <stop offset="68%" stop-color="${finishProps.base2}" />
      <stop offset="88%" stop-color="${finishProps.base3}" />
      <stop offset="100%" stop-color="${finishProps.dark}" />
    </linearGradient>

    <!-- FLO Flared Base Ellipse Gradient -->
    <linearGradient id="flo-base-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${finishProps.dark}" />
      <stop offset="20%" stop-color="${finishProps.base3}" />
      <stop offset="35%" stop-color="${finishProps.highlight}" />
      <stop offset="55%" stop-color="${finishProps.sheen}" />
      <stop offset="80%" stop-color="${finishProps.base2}" />
      <stop offset="100%" stop-color="${finishProps.dark}" />
    </linearGradient>

    <!-- FLO Spout Underside 3D Curve Gradient -->
    <linearGradient id="flo-spout-bottom" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${finishProps.base2}" />
      <stop offset="30%" stop-color="${finishProps.base3}" />
      <stop offset="70%" stop-color="${finishProps.dark}" />
      <stop offset="100%" stop-color="#141517" stop-opacity="0.9" />
    </linearGradient>

    <!-- FLO Spout Top Flat Slope -->
    <linearGradient id="flo-spout-top" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${finishProps.base3}" />
      <stop offset="22%" stop-color="${finishProps.highlight}" />
      <stop offset="55%" stop-color="${finishProps.base1}" />
      <stop offset="85%" stop-color="${finishProps.sheen}" />
      <stop offset="100%" stop-color="${finishProps.base2}" />
    </linearGradient>

    <!-- FLO Aerator Bevel Trim -->
    <linearGradient id="flo-aerator-trim" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${finishProps.highlight}" />
      <stop offset="50%" stop-color="${finishProps.base2}" />
      <stop offset="100%" stop-color="${finishProps.dark}" />
    </linearGradient>

    <!-- FLO Top Wing/Petal Lever Handle Top Gradient -->
    <linearGradient id="flo-lever-top" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${finishProps.base3}" />
      <stop offset="20%" stop-color="${finishProps.highlight}" />
      <stop offset="50%" stop-color="${finishProps.base1}" />
      <stop offset="78%" stop-color="${finishProps.sheen}" />
      <stop offset="100%" stop-color="${finishProps.base2}" />
    </linearGradient>

    <!-- FLO Top Wing/Petal Lever Side Underside -->
    <linearGradient id="flo-lever-side" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${finishProps.base2}" />
      <stop offset="50%" stop-color="${finishProps.dark}" />
      <stop offset="100%" stop-color="#121316" stop-opacity="0.9" />
    </linearGradient>
  </defs>

  ${bgFill}

  <!-- AMBIENT FLOOR SHADOWS -->
  <g id="flo-shadows">
    <ellipse cx="485" cy="805" rx="85" ry="18" fill="url(#flo-floor-shadow-main)" />
    <ellipse cx="330" cy="795" rx="75" ry="14" fill="url(#flo-floor-shadow-spout)" />
  </g>

  <!-- 1. FLARED COLUMN BODY -->
  <g id="flo-column-body">
    <!-- Flared Lower Base Footing (Sweeping organic curve) -->
    <!-- Base at y=795 width from 435 to 540 (width 105), curving into body at y=680 width 445 to 515 (width 70), then neck at y=485 width 452 to 510 (width 58) -->
    <path d="M435,795 
             C442,750 446,700 448,640 
             L454,485 
             L512,485 
             L518,640 
             C520,700 526,750 542,795 
             Z" 
          fill="url(#flo-body-gradient)" />

    <!-- Bottom Base Ring Chamfer -->
    <ellipse cx="488.5" cy="795" rx="53.5" ry="9" fill="${finishProps.dark}" opacity="0.6" />
    <path d="M435,795 C435,800 460,804 488.5,804 C517,804 542,800 542,795" fill="none" stroke="${finishProps.dark}" stroke-width="2" />
    
    <!-- Base Specular Highlight Rim -->
    <path d="M442,797 C455,801 475,802 495,801" fill="none" stroke="${finishProps.highlight}" stroke-width="1.8" opacity="0.8" />

    <!-- Column Specular Vertical Sheen Line -->
    <path d="M468,485 L464,640 C462,700 458,745 452,795" stroke="${finishProps.highlight}" stroke-width="2.8" opacity="0.75" />
    <path d="M472,485 L468,640 C466,700 462,745 456,795" stroke="#FFFFFF" stroke-width="1.2" opacity="0.85" />
  </g>

  <!-- 2. INTEGRATED LOW-PROFILE FORWARD SPOUT -->
  <g id="flo-spout-assembly">
    <!-- Spout Underside Body -->
    <path d="M280,578 
             L454,545 
             L454,595 
             C410,605 350,608 280,605 
             Z" 
          fill="url(#flo-spout-bottom)" />

    <!-- Spout Top Surface (Sleek flat slope) -->
    <path d="M280,548 
             L454,505 
             L512,485 
             L350,528 
             Z" 
          fill="url(#flo-spout-top)" />

    <!-- Spout Front Nose Bevel -->
    <path d="M280,548 
             L350,528 
             L350,585 
             L280,605 
             Z" 
          fill="url(#flo-aerator-trim)" />

    <!-- Underside Aerator Ring & Mesh -->
    <g id="flo-aerator">
      <ellipse cx="312" cy="592" rx="16" ry="6.5" fill="#18191B" />
      <ellipse cx="312" cy="592" rx="16" ry="6.5" fill="none" stroke="${finishProps.base3}" stroke-width="1.5" />
      <ellipse cx="312" cy="592" rx="12" ry="4.5" fill="#2C2E33" />
      <ellipse cx="312" cy="592" rx="7" ry="2.5" fill="#585B66" />
    </g>

    <!-- Spout Crisp Edge Highlight -->
    <path d="M280,578 L454,545" stroke="${finishProps.highlight}" stroke-width="2.2" stroke-linecap="round" opacity="0.95" />
    <path d="M280,548 L454,505" stroke="${finishProps.highlight}" stroke-width="1.2" opacity="0.75" />
  </g>

  <!-- 3. TOP COLLAR & DOME PIVOT -->
  <g id="flo-top-collar">
    <ellipse cx="483" cy="485" rx="29" ry="8" fill="url(#flo-body-gradient)" />
    <path d="M454,485 C454,465 470,455 483,455 C496,455 512,465 512,485 Z" fill="url(#flo-body-gradient)" />
    <ellipse cx="483" cy="485" rx="29" ry="8" fill="none" stroke="${finishProps.dark}" stroke-width="1.2" opacity="0.7" />
  </g>

  <!-- 4. FLO SIGNATURE WING / PETAL TOP LEVER HANDLE -->
  <g id="flo-petal-lever-handle">
    <!-- Underside Shadow of Lever on Collar -->
    <ellipse cx="478" cy="460" rx="35" ry="10" fill="#0A0B0D" opacity="0.45" />

    <!-- Lever Side / Bottom Thickness Profile -->
    <path d="M330,465 
             C370,448 420,442 475,446 
             C505,448 535,462 550,472 
             L545,482 
             C530,472 500,460 470,458 
             C415,455 365,465 325,480 
             Z" 
          fill="url(#flo-lever-side)" />

    <!-- Lever Top Fluid Petal Surface -->
    <path d="M325,468 
             C360,438 430,425 490,430 
             C525,433 555,448 570,460 
             C555,472 525,458 490,452 
             C430,444 365,450 325,468 
             Z" 
          fill="url(#flo-lever-top)" />

    <!-- Front Tip Bevel of Lever -->
    <path d="M325,468 
             C322,472 322,477 325,480 
             C345,475 365,468 395,462 
             C365,458 340,462 325,468 Z" 
          fill="url(#flo-aerator-trim)" />

    <!-- Lever Ridge Specular Highlight Line -->
    <path d="M328,467 C365,440 435,428 492,433 C525,436 552,448 566,458" 
          fill="none" 
          stroke="${finishProps.highlight}" 
          stroke-width="2.5" 
          stroke-linecap="round" 
          opacity="0.95" />

    <path d="M330,467 C365,440 435,428 492,433 C525,436 552,448 566,458" 
          fill="none" 
          stroke="#FFFFFF" 
          stroke-width="1.2" 
          stroke-linecap="round" 
          opacity="0.9" />
  </g>
</svg>`;
}

function generateExposedMixerSvg(
  finishProps: FinishThemeProps,
  handleType: string,
  options: { width?: number; height?: number; transparentBg?: boolean } = {}
): string {
  const width = options.width || 800;
  const height = options.height || 900;
  const bgFill = options.transparentBg
    ? ''
    : '<rect width="800" height="900" rx="36" fill="#F8F8F9"/>';

  let knobFillId = 'url(#body-cylinder-metal)';
  let knobTopFillId = 'url(#body-cylinder-metal)';

  if (handleType === 'CALACATTA') { knobFillId = 'url(#pat-calacatta)'; knobTopFillId = 'url(#pat-calacatta)'; }
  else if (handleType === 'NERO_MARQUINA') { knobFillId = 'url(#pat-marquina)'; knobTopFillId = 'url(#pat-marquina)'; }
  else if (handleType === 'RESINA_CORNO') { knobFillId = 'url(#pat-corno)'; knobTopFillId = 'url(#pat-corno)'; }
  else if (handleType === 'ROSSO_LEPANTO') { knobFillId = 'url(#pat-lepanto)'; knobTopFillId = 'url(#pat-lepanto)'; }
  else if (handleType === 'VERDE_GUATEMALA') { knobFillId = 'url(#pat-guatemala)'; knobTopFillId = 'url(#pat-guatemala)'; }
  else if (handleType === 'LEGNO_SCURO') { knobFillId = 'url(#pat-legno)'; knobTopFillId = 'url(#pat-legno)'; }
  else if (handleType === 'RESINA_AVORIO') { knobFillId = 'url(#pat-avorio)'; knobTopFillId = 'url(#pat-avorio)'; }
  else if (handleType === 'RESINA_TARTARUGA') { knobFillId = 'url(#pat-tartaruga)'; knobTopFillId = 'url(#pat-tartaruga)'; }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="${width}" height="${height}">
  <defs>
    <!-- Basic Shadows -->
    <radialGradient id="floor-shadow-main" cx="45%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a1c20" stop-opacity="0.32" />
      <stop offset="40%" stop-color="#40434a" stop-opacity="0.18" />
      <stop offset="75%" stop-color="#8a8d94" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#c0c2c8" stop-opacity="0" />
    </radialGradient>

    <!-- Metal Gradients -->
    <linearGradient id="body-cylinder-metal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${finishProps.dark}" />
      <stop offset="12%" stop-color="${finishProps.base3}" />
      <stop offset="28%" stop-color="${finishProps.highlight}" />
      <stop offset="38%" stop-color="${finishProps.sheen}" />
      <stop offset="65%" stop-color="${finishProps.base2}" />
      <stop offset="85%" stop-color="${finishProps.base3}" />
      <stop offset="100%" stop-color="${finishProps.dark}" />
    </linearGradient>

    <!-- Handle Metal -->
    <linearGradient id="handle-cylinder-metal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${finishProps.dark}" />
      <stop offset="25%" stop-color="${finishProps.highlight}" />
      <stop offset="50%" stop-color="${finishProps.base2}" />
      <stop offset="80%" stop-color="${finishProps.base3}" />
      <stop offset="100%" stop-color="${finishProps.dark}" />
    </linearGradient>

    <!-- Patterns (Extracted from main) -->
    <pattern id="pat-calacatta" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#F8F6F2" />
      <path d="M0,0 Q90,70 140,160 T300,220 L300,0 Z" fill="#ECE7DD" opacity="0.6" />
      <path d="M50,300 Q150,210 180,110 T300,40 L300,300 Z" fill="#E6DFD2" opacity="0.4" />
      <path d="M-20,40 Q60,110 110,130 T200,210 T320,260" fill="none" stroke="#B39366" stroke-width="5" opacity="0.65" stroke-linecap="round" />
    </pattern>
    <pattern id="pat-marquina" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#141416" />
      <path d="M0,0 Q120,60 160,180 T300,280 L300,0 Z" fill="#1E1E22" opacity="0.7" />
      <path d="M-10,30 Q80,95 130,120 T220,180 T310,270" fill="none" stroke="#FFFFFF" stroke-width="3.5" opacity="0.9" stroke-linecap="round" />
    </pattern>
    <pattern id="pat-corno" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#8C6E52" />
      <path d="M0,0 L300,0 L300,300 L0,300 Z" fill="#7A583B" opacity="0.5" />
      <path d="M-50,0 Q80,100 150,120 T350,300" fill="none" stroke="#D8C3A5" stroke-width="18" opacity="0.7" stroke-linecap="round" />
    </pattern>
    <pattern id="pat-lepanto" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#581822" />
      <path d="M0,0 Q100,80 160,150 T300,260 L300,0 Z" fill="#3D0E16" opacity="0.8" />
      <path d="M-20,40 Q70,90 120,130 T220,200 T320,280" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.8" />
    </pattern>
    <pattern id="pat-guatemala" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#1B3B2B" />
      <path d="M0,0 Q120,60 180,170 T300,290 L300,0 Z" fill="#0E2319" opacity="0.8" />
      <path d="M-10,30 Q90,100 140,120 T240,190 T320,280" fill="none" stroke="#95D5B2" stroke-width="2.5" opacity="0.75" />
    </pattern>
    <pattern id="pat-legno" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#3E2723" />
      <path d="M-20,0 L320,0 L320,300 L-20,300 Z" fill="#2E1C18" opacity="0.4" />
      <path d="M-10,20 Q150,30 310,20" fill="none" stroke="#5D4037" stroke-width="4" opacity="0.7" />
    </pattern>
    <pattern id="pat-avorio" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#FDFBF7" />
      <path d="M0,0 Q100,70 150,160 T300,240 L300,0 Z" fill="#F4EFE6" opacity="0.75" />
    </pattern>
    <pattern id="pat-tartaruga" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#D47A22" />
      <ellipse cx="60" cy="50" rx="35" ry="25" fill="#3D1A06" opacity="0.85" />
      <ellipse cx="180" cy="90" rx="45" ry="30" fill="#240D02" opacity="0.9" />
    </pattern>

    <radialGradient id="handle-highlight" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4" />
      <stop offset="60%" stop-color="#000000" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.5" />
    </radialGradient>
  </defs>

  ${bgFill}

  <!-- Shadow -->
  <path d="M260,500 C300,750 550,850 630,550" fill="none" stroke="url(#floor-shadow-main)" stroke-width="25" filter="blur(8px)" opacity="0.6" />
  <ellipse cx="400" cy="520" rx="130" ry="15" fill="url(#floor-shadow-main)" opacity="0.5" />

  <!-- Hand Shower & Hose (Background part of hose) -->
  <path d="M380,440 C350,850 650,850 635,500" fill="none" stroke="#999999" stroke-width="12" stroke-linecap="round" />
  <path d="M380,440 C350,850 650,850 635,500" fill="none" stroke="url(#body-cylinder-metal)" stroke-width="10" stroke-linecap="round" />

  <!-- Wall Escutcheons (Flanges) -->
  <g id="escutcheons">
    <ellipse cx="300" cy="380" rx="28" ry="32" fill="url(#body-cylinder-metal)" />
    <ellipse cx="300" cy="380" rx="22" ry="26" fill="none" stroke="${finishProps.dark}" stroke-width="2" />
    
    <ellipse cx="470" cy="380" rx="28" ry="32" fill="url(#body-cylinder-metal)" />
    <ellipse cx="470" cy="380" rx="22" ry="26" fill="none" stroke="${finishProps.dark}" stroke-width="2" />
  </g>

  <!-- Horizontal Cylinder Main Body -->
  <g id="main-body">
    <!-- Offset cylinders connecting to wall -->
    <rect x="285" y="380" width="30" height="25" fill="url(#body-cylinder-metal)" />
    <rect x="455" y="380" width="30" height="25" fill="url(#body-cylinder-metal)" />
    
    <!-- Main horizontal pipe -->
    <rect x="250" y="390" width="270" height="40" rx="3" fill="url(#body-cylinder-metal)" />
    <line x1="250" y1="400" x2="520" y2="400" stroke="${finishProps.highlight}" stroke-width="3" opacity="0.7" />
    <line x1="250" y1="420" x2="520" y2="420" stroke="${finishProps.dark}" stroke-width="2" opacity="0.5" />
  </g>

  <!-- Flat Spout & Diverter -->
  <g id="spout">
    <!-- Spout base sticking forward -->
    <path d="M300,410 L370,410 L385,450 L315,450 Z" fill="url(#body-cylinder-metal)" />
    <!-- Spout top highlight -->
    <path d="M300,410 L370,410 L375,420 L305,420 Z" fill="${finishProps.highlight}" opacity="0.6" />
    
    <!-- Diverter knob on top of spout -->
    <rect x="330" y="385" width="10" height="15" rx="2" fill="url(#body-cylinder-metal)" />
    
    <!-- Hose connector under spout -->
    <rect x="370" y="440" width="20" height="15" fill="url(#body-cylinder-metal)" />
  </g>

  <!-- Right Knob & Lever -->
  <g id="right-knob">
    <!-- Separator line -->
    <line x1="520" y1="390" x2="520" y2="430" stroke="${finishProps.dark}" stroke-width="2" opacity="0.8" />
    <!-- Knob body -->
    <rect x="522" y="390" width="30" height="40" rx="3" fill="url(#body-cylinder-metal)" />
    <line x1="522" y1="400" x2="552" y2="400" stroke="${finishProps.highlight}" stroke-width="2" opacity="0.7" />
    
    <!-- Lever extension pointing down and slightly forward -->
    <path d="M530,425 L545,425 L540,465 L535,465 Z" fill="url(#body-cylinder-metal)" />
  </g>
  
  <!-- Left Knob -->
  <g id="left-knob">
    <line x1="250" y1="390" x2="250" y2="430" stroke="${finishProps.dark}" stroke-width="2" opacity="0.8" />
    <rect x="235" y="390" width="15" height="40" rx="3" fill="url(#body-cylinder-metal)" />
    <line x1="235" y1="400" x2="250" y2="400" stroke="${finishProps.highlight}" stroke-width="2" opacity="0.7" />
  </g>

  <!-- Hand Shower & Mount (Right side) -->
  <g id="hand-shower">
    <!-- Wall bracket base -->
    <ellipse cx="640" cy="380" rx="15" ry="25" fill="url(#body-cylinder-metal)" />
    <rect x="635" y="380" width="10" height="20" fill="url(#body-cylinder-metal)" />
    
    <!-- Hand shower stick (tall thin cylinder) -->
    <rect x="625" y="200" width="20" height="260" rx="8" fill="url(#body-cylinder-metal)" />
    <line x1="628" y1="210" x2="628" y2="450" stroke="${finishProps.highlight}" stroke-width="2" opacity="0.8" />
    
    <!-- Shower head face nozzles (grey area) -->
    <rect x="627" y="210" width="16" height="100" rx="5" fill="#444444" opacity="0.6" />
    <circle cx="635" cy="220" r="1.5" fill="#222" />
    <circle cx="635" cy="230" r="1.5" fill="#222" />
    <circle cx="635" cy="240" r="1.5" fill="#222" />
    <circle cx="635" cy="250" r="1.5" fill="#222" />
    <circle cx="635" cy="260" r="1.5" fill="#222" />
    <circle cx="635" cy="270" r="1.5" fill="#222" />
    <circle cx="635" cy="280" r="1.5" fill="#222" />
    <circle cx="635" cy="290" r="1.5" fill="#222" />
    <circle cx="635" cy="300" r="1.5" fill="#222" />
  </g>
</svg>`;
}

/**
 * Generate a standalone, photorealistic SVG representation of the faucet with specified finish and handle
 */
export function getVisualizerSvgString(
  finish?: Finish | VisualizerFinishInput | string | null,
  handle?: Handle | VisualizerHandleInput | string | null,
  options: { model?: string; productName?: string; width?: number; height?: number; transparentBg?: boolean } = {}
): string {
  const finishProps = getFinishThemeProps(finish);
  const modelUpper = (options.model || options.productName || '').toUpperCase();
  const handleType = getHandleMaterialType(handle);

  // If model is an Exposed Bath Mixer
  if (modelUpper.includes('EXP') || modelUpper.includes('EXPOSED') || modelUpper.includes('F3804') || modelUpper.includes('3804')) {
    return generateExposedMixerSvg(finishProps, handleType, options);
  }

  // If model is FLO / F3801 / F3801ZS, render the dedicated FLO organic flared faucet geometry
  if (modelUpper.includes('FLO') || modelUpper.includes('F3801') || modelUpper.includes('3801')) {
    return generateFloFaucetSvg(finishProps, options);
  }

  // Otherwise, render SLIDE / Components modular faucet geometry
  const width = options.width || 800;
  const height = options.height || 900;
  const bgFill = options.transparentBg
    ? ''
    : '<rect width="800" height="900" rx="36" fill="#F8F8F9"/>';

  let knobFillId = 'url(#body-cylinder-metal)';
  let knobTopFillId = 'url(#body-cylinder-metal)';

  if (handleType === 'CALACATTA') {
    knobFillId = 'url(#pat-calacatta)';
    knobTopFillId = 'url(#pat-calacatta)';
  } else if (handleType === 'NERO_MARQUINA') {
    knobFillId = 'url(#pat-marquina)';
    knobTopFillId = 'url(#pat-marquina)';
  } else if (handleType === 'RESINA_CORNO') {
    knobFillId = 'url(#pat-corno)';
    knobTopFillId = 'url(#pat-corno)';
  } else if (handleType === 'ROSSO_LEPANTO') {
    knobFillId = 'url(#pat-lepanto)';
    knobTopFillId = 'url(#pat-lepanto)';
  } else if (handleType === 'VERDE_GUATEMALA') {
    knobFillId = 'url(#pat-guatemala)';
    knobTopFillId = 'url(#pat-guatemala)';
  } else if (handleType === 'LEGNO_SCURO') {
    knobFillId = 'url(#pat-legno)';
    knobTopFillId = 'url(#pat-legno)';
  } else if (handleType === 'RESINA_AVORIO') {
    knobFillId = 'url(#pat-avorio)';
    knobTopFillId = 'url(#pat-avorio)';
  } else if (handleType === 'RESINA_TARTARUGA') {
    knobFillId = 'url(#pat-tartaruga)';
    knobTopFillId = 'url(#pat-tartaruga)';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 900" width="${width}" height="${height}">
  <defs>
    <radialGradient id="floor-shadow-main" cx="45%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a1c20" stop-opacity="0.32" />
      <stop offset="40%" stop-color="#40434a" stop-opacity="0.18" />
      <stop offset="75%" stop-color="#8a8d94" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#c0c2c8" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="floor-shadow-spout" cx="30%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1a1c20" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#50535a" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#c0c2c8" stop-opacity="0" />
    </radialGradient>

    <linearGradient id="body-cylinder-metal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${finishProps.dark}" stop-opacity="1" />
      <stop offset="12%" stop-color="${finishProps.base3}" />
      <stop offset="28%" stop-color="${finishProps.highlight}" />
      <stop offset="38%" stop-color="${finishProps.sheen}" />
      <stop offset="65%" stop-color="${finishProps.base2}" />
      <stop offset="85%" stop-color="${finishProps.base3}" />
      <stop offset="100%" stop-color="${finishProps.dark}" />
    </linearGradient>

    <linearGradient id="spout-top-metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${finishProps.base3}" />
      <stop offset="25%" stop-color="${finishProps.highlight}" />
      <stop offset="60%" stop-color="${finishProps.base1}" />
      <stop offset="85%" stop-color="${finishProps.sheen}" />
      <stop offset="100%" stop-color="${finishProps.base2}" />
    </linearGradient>

    <linearGradient id="spout-bottom-metal" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${finishProps.base3}" />
      <stop offset="30%" stop-color="${finishProps.dark}" />
      <stop offset="85%" stop-color="#141416" stop-opacity="0.85" />
      <stop offset="100%" stop-color="${finishProps.dark}" />
    </linearGradient>

    <linearGradient id="spout-nose-curve" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${finishProps.highlight}" />
      <stop offset="40%" stop-color="${finishProps.base2}" />
      <stop offset="100%" stop-color="${finishProps.dark}" />
    </linearGradient>

    <linearGradient id="knob-ring-metal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${finishProps.dark}" />
      <stop offset="25%" stop-color="${finishProps.highlight}" />
      <stop offset="50%" stop-color="${finishProps.base2}" />
      <stop offset="80%" stop-color="${finishProps.base3}" />
      <stop offset="100%" stop-color="${finishProps.dark}" />
    </linearGradient>

    <linearGradient id="knob-3d-lighting" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.55" />
      <stop offset="15%" stop-color="#000000" stop-opacity="0.25" />
      <stop offset="32%" stop-color="#FFFFFF" stop-opacity="0.45" />
      <stop offset="48%" stop-color="#FFFFFF" stop-opacity="0.15" />
      <stop offset="75%" stop-color="#000000" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.65" />
    </linearGradient>

    <radialGradient id="knob-top-ellipse-lighting" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.4" />
      <stop offset="60%" stop-color="#000000" stop-opacity="0.1" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.5" />
    </radialGradient>

    <!-- CALACATTA MARBLE PATTERN -->
    <pattern id="pat-calacatta" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#F8F6F2" />
      <path d="M0,0 Q90,70 140,160 T300,220 L300,0 Z" fill="#ECE7DD" opacity="0.6" />
      <path d="M50,300 Q150,210 180,110 T300,40 L300,300 Z" fill="#E6DFD2" opacity="0.4" />
      <path d="M-20,40 Q60,110 110,130 T200,210 T320,260" fill="none" stroke="#B39366" stroke-width="5" opacity="0.65" stroke-linecap="round" />
      <path d="M-20,40 Q60,110 110,130 T200,210 T320,260" fill="none" stroke="#7D6A56" stroke-width="2.5" opacity="0.75" />
      <path d="M110,130 Q160,80 230,60" fill="none" stroke="#A88B60" stroke-width="3" opacity="0.6" />
      <path d="M40,250 Q120,200 170,240 T290,290" fill="none" stroke="#8C8884" stroke-width="2" opacity="0.5" />
      <path d="M170,240 Q190,170 250,140" fill="none" stroke="#BFA47B" stroke-width="2" opacity="0.55" />
    </pattern>

    <!-- NERO MARQUINA MARBLE PATTERN -->
    <pattern id="pat-marquina" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#141416" />
      <path d="M0,0 Q120,60 160,180 T300,280 L300,0 Z" fill="#1E1E22" opacity="0.7" />
      <path d="M-10,30 Q80,95 130,120 T220,180 T310,270" fill="none" stroke="#FFFFFF" stroke-width="3.5" opacity="0.9" stroke-linecap="round" />
      <path d="M-10,30 Q80,95 130,120 T220,180 T310,270" fill="none" stroke="#E2E2E8" stroke-width="1.5" opacity="0.95" />
      <path d="M130,120 Q150,60 210,40" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.8" />
      <path d="M30,220 Q140,170 190,210 T290,260" fill="none" stroke="#D1D1D6" stroke-width="2" opacity="0.75" />
      <path d="M190,210 Q210,140 260,120" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.85" />
    </pattern>

    <!-- RESINA CORNO PATTERN -->
    <pattern id="pat-corno" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#8C6E52" />
      <path d="M0,0 L300,0 L300,300 L0,300 Z" fill="#7A583B" opacity="0.5" />
      <path d="M-50,0 Q80,100 150,120 T350,300" fill="none" stroke="#D8C3A5" stroke-width="18" opacity="0.7" stroke-linecap="round" />
      <path d="M-20,60 Q120,140 180,170 T350,340" fill="none" stroke="#EAE0D5" stroke-width="9" opacity="0.85" />
      <path d="M0,150 Q160,200 220,240 T350,360" fill="none" stroke="#5E432D" stroke-width="14" opacity="0.75" />
      <path d="M-30,220 Q100,260 200,280 T350,380" fill="none" stroke="#D8C3A5" stroke-width="8" opacity="0.65" />
    </pattern>

    <!-- ROSSO LEPANTO PATTERN -->
    <pattern id="pat-lepanto" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#581822" />
      <path d="M0,0 Q100,80 160,150 T300,260 L300,0 Z" fill="#3D0E16" opacity="0.8" />
      <path d="M-20,40 Q70,90 120,130 T220,200 T320,280" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.8" />
      <path d="M120,130 Q170,70 240,50" fill="none" stroke="#F4DCDA" stroke-width="2" opacity="0.75" />
      <path d="M20,230 Q130,190 180,230 T300,270" fill="none" stroke="#E5989B" stroke-width="2.5" opacity="0.7" />
    </pattern>

    <!-- VERDE GUATEMALA PATTERN -->
    <pattern id="pat-guatemala" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#1B3B2B" />
      <path d="M0,0 Q120,60 180,170 T300,290 L300,0 Z" fill="#0E2319" opacity="0.8" />
      <path d="M-10,30 Q90,100 140,120 T240,190 T320,280" fill="none" stroke="#95D5B2" stroke-width="2.5" opacity="0.75" />
      <path d="M140,120 Q160,60 220,40" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.85" />
      <path d="M40,240 Q150,180 200,220 T300,270" fill="none" stroke="#52B788" stroke-width="2" opacity="0.7" />
    </pattern>

    <!-- LEGNO SCURO SMOKED WOOD PATTERN -->
    <pattern id="pat-legno" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#3E2723" />
      <path d="M-20,0 L320,0 L320,300 L-20,300 Z" fill="#2E1C18" opacity="0.4" />
      <path d="M-10,20 Q150,30 310,20" fill="none" stroke="#5D4037" stroke-width="4" opacity="0.7" />
      <path d="M-10,50 Q150,60 310,50" fill="none" stroke="#251613" stroke-width="5" opacity="0.8" />
      <path d="M-10,90 Q150,100 310,90" fill="none" stroke="#6D4C41" stroke-width="3" opacity="0.6" />
      <path d="M-10,130 Q150,140 310,130" fill="none" stroke="#251613" stroke-width="6" opacity="0.8" />
      <path d="M-10,170 Q150,180 310,170" fill="none" stroke="#5D4037" stroke-width="4" opacity="0.7" />
      <path d="M-10,210 Q150,220 310,210" fill="none" stroke="#795548" stroke-width="3.5" opacity="0.6" />
      <path d="M-10,250 Q150,260 310,250" fill="none" stroke="#251613" stroke-width="5" opacity="0.8" />
    </pattern>

    <!-- RESINA AVORIO IVORY PATTERN -->
    <pattern id="pat-avorio" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#FDFBF7" />
      <path d="M0,0 Q100,70 150,160 T300,240 L300,0 Z" fill="#F4EFE6" opacity="0.75" />
      <path d="M-20,50 Q90,120 140,140 T230,220 T320,270" fill="none" stroke="#E8DFD1" stroke-width="6" opacity="0.6" />
      <path d="M30,260 Q130,210 180,250 T300,300" fill="none" stroke="#EDE5DA" stroke-width="4" opacity="0.5" />
    </pattern>

    <!-- RESINA TARTARUGA TORTOISE PATTERN -->
    <pattern id="pat-tartaruga" patternUnits="userSpaceOnUse" width="300" height="300">
      <rect width="300" height="300" fill="#D47A22" />
      <ellipse cx="60" cy="50" rx="35" ry="25" fill="#3D1A06" opacity="0.85" />
      <ellipse cx="180" cy="90" rx="45" ry="30" fill="#240D02" opacity="0.9" />
      <ellipse cx="110" cy="180" rx="50" ry="35" fill="#3D1A06" opacity="0.85" />
      <ellipse cx="240" cy="220" rx="40" ry="28" fill="#240D02" opacity="0.9" />
      <ellipse cx="50" cy="260" rx="30" ry="20" fill="#4E2308" opacity="0.8" />
      <path d="M0,0 L300,300" stroke="#FCA311" stroke-width="8" opacity="0.4" />
    </pattern>
  </defs>

  ${bgFill}

  <!-- AMBIENT GROUND CONTACT SHADOWS -->
  <g id="contact-shadows">
    <ellipse cx="445" cy="800" rx="75" ry="16" fill="url(#floor-shadow-main)" />
    <ellipse cx="300" cy="790" rx="65" ry="12" fill="url(#floor-shadow-spout)" />
  </g>

  <!-- FAUCET VERTICAL BODY -->
  <g id="faucet-main-body">
    <ellipse cx="445" cy="790" rx="30" ry="6" fill="${finishProps.dark}" />
    <rect x="415" y="480" width="60" height="310" fill="url(#body-cylinder-metal)" />
    <ellipse cx="445" cy="790" rx="30" ry="4" fill="none" stroke="${finishProps.dark}" stroke-width="1.5" opacity="0.9" />
    <path d="M432,480 L432,790" stroke="${finishProps.highlight}" stroke-width="2.5" opacity="0.65" />
  </g>

  <!-- HORIZONTAL SPOUT ARM -->
  <g id="horizontal-spout-assembly">
    <!-- Spout Underside Body -->
    <path d="M285,578 L415,536 L415,575 L285,605 Z" fill="url(#spout-bottom-metal)" />

    <!-- Spout Top Surface -->
    <path d="M285,548 L415,506 L475,486 L345,528 Z" fill="url(#spout-top-metal)" />

    <!-- Spout Front Nose Cap -->
    <path d="M285,548 L345,528 L345,585 L285,605 Z" fill="url(#spout-nose-curve)" />

    <!-- Aerator Rim & Nozzle Cutout -->
    <g id="aerator-assembly">
      <ellipse cx="315" cy="590" rx="14" ry="5.5" fill="#1A1A1D" />
      <ellipse cx="315" cy="590" rx="14" ry="5.5" fill="none" stroke="${finishProps.base3}" stroke-width="1.2" />
      <ellipse cx="315" cy="590" rx="10" ry="3.5" fill="#2E3035" />
      <ellipse cx="315" cy="590" rx="5" ry="2" fill="#5C5E66" />
    </g>

    <!-- Spout Specular Highlight Edge -->
    <path d="M285,578 L420,536" stroke="${finishProps.highlight}" stroke-width="1.8" stroke-linecap="round" opacity="0.9" />
  </g>

  <!-- DIAGONAL ROTARY MIXER SEAM -->
  <g id="rotary-split-transition">
    <path d="M415,480 C435,465 455,460 475,445" fill="none" stroke="${finishProps.dark}" stroke-width="2.2" opacity="0.9" />
    <path d="M415,481 C435,466 455,461 475,446" fill="none" stroke="${finishProps.highlight}" stroke-width="1" opacity="0.8" />
  </g>

  <!-- TOP KNOB / HANDLE (MANOPOLA F1420) -->
  <g id="faucet-knob-manopola">
    <!-- Sub-Bevel Metal Seat Ring -->
    <path d="M415,445 C415,445 440,432 475,432 L475,445 C455,460 435,465 415,480 Z" fill="url(#body-cylinder-metal)" />

    <!-- Main Rotary Cylinder Cap -->
    <g id="knob-cap-render">
      <rect x="415" y="360" width="60" height="85" fill="${knobFillId}" />
      <rect x="415" y="360" width="60" height="85" fill="url(#knob-3d-lighting)" opacity="0.85" />

      <!-- Top Elliptical Crown Cap -->
      <ellipse cx="445" cy="360" rx="30" ry="7" fill="${knobTopFillId}" />
      <ellipse cx="445" cy="360" rx="30" ry="7" fill="url(#knob-top-ellipse-lighting)" />
      <ellipse cx="445" cy="360" rx="30" ry="7" fill="none" stroke="#FFFFFF" stroke-width="0.8" opacity="0.6" />
    </g>

    <!-- Lower Bevel Cut Curve -->
    <path d="M415,445 C435,432 455,432 475,445" fill="none" stroke="${finishProps.dark}" stroke-width="1.5" opacity="0.9" />
  </g>
</svg>`;
}

/**
 * Returns a data URI string (data:image/svg+xml;...) ready for use in any <img> src or PDF generator
 */
export function getVisualizerDataUrl(
  finish?: Finish | VisualizerFinishInput | string | null,
  handle?: Handle | VisualizerHandleInput | string | null,
  options: { model?: string; productName?: string; width?: number; height?: number; transparentBg?: boolean } = {}
): string {
  const svg = getVisualizerSvgString(finish, handle, options);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * ProductVisualThumbnail Component
 * Render the 3D visualizer SVG directly or via image src with full responsiveness and crispness
 */
export const ProductVisualThumbnail: React.FC<{
  finish?: Finish | VisualizerFinishInput | string | null;
  handle?: Handle | VisualizerHandleInput | string | null;
  modelNumber?: string;
  productName?: string;
  fallbackImageUrl?: string;
  className?: string;
  alt?: string;
  onClick?: () => void;
}> = ({
  finish,
  handle,
  modelNumber,
  productName,
  fallbackImageUrl,
  className = 'w-12 h-12',
  alt = 'Configured Product',
  onClick
}) => {
  const svgDataUrl = useMemo(() => {
    if (finish || handle || modelNumber || productName) {
      return getVisualizerDataUrl(finish, handle, { model: modelNumber, productName });
    }
    if (fallbackImageUrl && fallbackImageUrl.startsWith('data:image/svg')) {
      return fallbackImageUrl;
    }
    return fallbackImageUrl || getVisualizerDataUrl('INOX', 'MATCH', { model: modelNumber, productName });
  }, [finish, handle, modelNumber, productName, fallbackImageUrl]);

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-neutral-200 bg-white p-0.5 flex items-center justify-center overflow-hidden shadow-2xs ${className}`}
    >
      <img
        src={svgDataUrl}
        alt={alt}
        className="w-full h-full object-contain"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

interface InteractiveVisualizerProps {
  finish: Finish | null;
  handle: Handle | null;
  productName?: string;
  modelNumber?: string;
  className?: string;
}

export const InteractiveVisualizer: React.FC<InteractiveVisualizerProps> = ({
  finish,
  handle,
  productName = '',
  modelNumber = '',
  className = ''
}) => {
  const isFloModel = useMemo(() => {
    const combined = `${productName} ${modelNumber}`.toUpperCase();
    return combined.includes('FLO') || combined.includes('F3801') || combined.includes('3801');
  }, [productName, modelNumber]);

  const isExposedMixer = useMemo(() => {
    const combined = `${productName} ${modelNumber}`.toUpperCase();
    return combined.includes('EXP') || combined.includes('EXPOSED') || combined.includes('3804');
  }, [productName, modelNumber]);

  const dynamicSvgDataUrl = useMemo(() => {
    if (isFloModel) {
      return getVisualizerDataUrl(finish, handle, { model: 'F3801ZS', productName: 'FLO' });
    }
    if (isExposedMixer) {
      return getVisualizerDataUrl(finish, handle, { model: modelNumber, productName: productName });
    }
    return '';
  }, [isFloModel, isExposedMixer, finish, handle, modelNumber, productName]);

  const finishProps = useMemo(() => getFinishThemeProps(finish), [finish]);
  const handleType = useMemo(() => getHandleMaterialType(handle), [handle]);

  if (isFloModel || isExposedMixer) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
        {/* Studio Lighting Radial Backing */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f9f9fa] via-[#f4f4f6] to-[#eaebee] pointer-events-none rounded-2xl" />
        <img
          src={dynamicSvgDataUrl}
          alt={`${productName} 3D Render`}
          className="relative w-full h-full max-h-[580px] drop-shadow-2xl object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      {/* Studio Lighting Radial Backing */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f9f9fa] via-[#f4f4f6] to-[#eaebee] pointer-events-none rounded-2xl" />

      {/* SVG Canvas for Photorealistic 2D Architectural Faucet */}
      <svg
        viewBox="0 0 800 900"
        className="relative w-full h-full max-h-[580px] drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Ambient Floor Shadow Gradients */}
          <radialGradient id="floor-shadow-main" cx="45%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1c20" stopOpacity="0.32" />
            <stop offset="40%" stopColor="#40434a" stopOpacity="0.18" />
            <stop offset="75%" stopColor="#8a8d94" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#c0c2c8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="floor-shadow-spout" cx="30%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1c20" stopOpacity="0.22" />
            <stop offset="50%" stopColor="#50535a" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#c0c2c8" stopOpacity="0" />
          </radialGradient>

          {/* Body Metallic Brushed Gradient */}
          <linearGradient id="body-cylinder-metal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={finishProps.dark} stopOpacity="1" />
            <stop offset="12%" stopColor={finishProps.base3} />
            <stop offset="28%" stopColor={finishProps.highlight} />
            <stop offset="38%" stopColor={finishProps.sheen} />
            <stop offset="65%" stopColor={finishProps.base2} />
            <stop offset="85%" stopColor={finishProps.base3} />
            <stop offset="100%" stopColor={finishProps.dark} />
          </linearGradient>

          {/* Body Horizontal Specular Sheen (Spout Top Face) */}
          <linearGradient id="spout-top-metal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={finishProps.base3} />
            <stop offset="25%" stopColor={finishProps.highlight} />
            <stop offset="60%" stopColor={finishProps.base1} />
            <stop offset="85%" stopColor={finishProps.sheen} />
            <stop offset="100%" stopColor={finishProps.base2} />
          </linearGradient>

          {/* Spout Underside Shadow & Metallic Edge */}
          <linearGradient id="spout-bottom-metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={finishProps.base3} />
            <stop offset="30%" stopColor={finishProps.dark} />
            <stop offset="85%" stopColor="#141416" stopOpacity="0.85" />
            <stop offset="100%" stopColor={finishProps.dark} />
          </linearGradient>

          {/* Spout Front Nose Curve */}
          <linearGradient id="spout-nose-curve" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={finishProps.highlight} />
            <stop offset="40%" stopColor={finishProps.base2} />
            <stop offset="100%" stopColor={finishProps.dark} />
          </linearGradient>

          {/* Knob Bevel Trim Ring Metal */}
          <linearGradient id="knob-ring-metal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={finishProps.dark} />
            <stop offset="25%" stopColor={finishProps.highlight} />
            <stop offset="50%" stopColor={finishProps.base2} />
            <stop offset="80%" stopColor={finishProps.base3} />
            <stop offset="100%" stopColor={finishProps.dark} />
          </linearGradient>

          {/* Cylindrical 3D Lighting Overlay */}
          <linearGradient id="knob-3d-lighting" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
            <stop offset="15%" stopColor="#000000" stopOpacity="0.25" />
            <stop offset="32%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="75%" stopColor="#000000" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.65" />
          </linearGradient>

          {/* Top Knob Top Ellipse Lighting */}
          <radialGradient id="knob-top-ellipse-lighting" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#000000" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </radialGradient>

          {/* 1. MARMO BIANCO CALACATTA PATTERN */}
          <pattern id="pat-calacatta" patternUnits="userSpaceOnUse" width="300" height="300">
            <rect width="300" height="300" fill="#F8F6F2" />
            <path d="M0,0 Q90,70 140,160 T300,220 L300,0 Z" fill="#ECE7DD" opacity="0.6" />
            <path d="M50,300 Q150,210 180,110 T300,40 L300,300 Z" fill="#E6DFD2" opacity="0.4" />
            <path d="M-20,40 Q60,110 110,130 T200,210 T320,260" fill="none" stroke="#B39366" strokeWidth="5" opacity="0.65" strokeLinecap="round" />
            <path d="M-20,40 Q60,110 110,130 T200,210 T320,260" fill="none" stroke="#7D6A56" strokeWidth="2.5" opacity="0.75" />
            <path d="M110,130 Q160,80 230,60" fill="none" stroke="#A88B60" strokeWidth="3" opacity="0.6" />
            <path d="M40,250 Q120,200 170,240 T290,290" fill="none" stroke="#8C8884" strokeWidth="2" opacity="0.5" />
            <path d="M170,240 Q190,170 250,140" fill="none" stroke="#BFA47B" strokeWidth="2" opacity="0.55" />
          </pattern>

          {/* 2. MARMO NERO MARQUINA PATTERN */}
          <pattern id="pat-marquina" patternUnits="userSpaceOnUse" width="300" height="300">
            <rect width="300" height="300" fill="#141416" />
            <path d="M0,0 Q120,60 160,180 T300,280 L300,0 Z" fill="#1E1E22" opacity="0.7" />
            <path d="M-10,30 Q80,95 130,120 T220,180 T310,270" fill="none" stroke="#FFFFFF" strokeWidth="3.5" opacity="0.9" strokeLinecap="round" />
            <path d="M-10,30 Q80,95 130,120 T220,180 T310,270" fill="none" stroke="#E2E2E8" strokeWidth="1.5" opacity="0.95" />
            <path d="M130,120 Q150,60 210,40" fill="none" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8" />
            <path d="M30,220 Q140,170 190,210 T290,260" fill="none" stroke="#D1D1D6" strokeWidth="2" opacity="0.75" />
            <path d="M190,210 Q210,140 260,120" fill="none" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.85" />
          </pattern>

          {/* 3. RESINA CORNO PATTERN */}
          <pattern id="pat-corno" patternUnits="userSpaceOnUse" width="300" height="300">
            <rect width="300" height="300" fill="#8C6E52" />
            <path d="M0,0 L300,0 L300,300 L0,300 Z" fill="#7A583B" opacity="0.5" />
            <path d="M-50,0 Q80,100 150,120 T350,300" fill="none" stroke="#D8C3A5" strokeWidth="18" opacity="0.7" strokeLinecap="round" />
            <path d="M-20,60 Q120,140 180,170 T350,340" fill="none" stroke="#EAE0D5" strokeWidth="9" opacity="0.85" />
            <path d="M0,150 Q160,200 220,240 T350,360" fill="none" stroke="#5E432D" strokeWidth="14" opacity="0.75" />
            <path d="M-30,220 Q100,260 200,280 T350,380" fill="none" stroke="#D8C3A5" strokeWidth="8" opacity="0.65" />
          </pattern>

          {/* 4. ROSSO LEPANTO PATTERN */}
          <pattern id="pat-lepanto" patternUnits="userSpaceOnUse" width="300" height="300">
            <rect width="300" height="300" fill="#581822" />
            <path d="M0,0 Q100,80 160,150 T300,260 L300,0 Z" fill="#3D0E16" opacity="0.8" />
            <path d="M-20,40 Q70,90 120,130 T220,200 T320,280" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.8" />
            <path d="M120,130 Q170,70 240,50" fill="none" stroke="#F4DCDA" strokeWidth="2" opacity="0.75" />
            <path d="M20,230 Q130,190 180,230 T300,270" fill="none" stroke="#E5989B" strokeWidth="2.5" opacity="0.7" />
          </pattern>

          {/* 5. VERDE GUATEMALA PATTERN */}
          <pattern id="pat-guatemala" patternUnits="userSpaceOnUse" width="300" height="300">
            <rect width="300" height="300" fill="#1B3B2B" />
            <path d="M0,0 Q120,60 180,170 T300,290 L300,0 Z" fill="#0E2319" opacity="0.8" />
            <path d="M-10,30 Q90,100 140,120 T240,190 T320,280" fill="none" stroke="#95D5B2" strokeWidth="2.5" opacity="0.75" />
            <path d="M140,120 Q160,60 220,40" fill="none" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.85" />
            <path d="M40,240 Q150,180 200,220 T300,270" fill="none" stroke="#52B788" strokeWidth="2" opacity="0.7" />
          </pattern>

          {/* 6. LEGNO SCURO PATTERN */}
          <pattern id="pat-legno" patternUnits="userSpaceOnUse" width="300" height="300">
            <rect width="300" height="300" fill="#3E2723" />
            <path d="M-20,0 L320,0 L320,300 L-20,300 Z" fill="#2E1C18" opacity="0.4" />
            <path d="M-10,20 Q150,30 310,20" fill="none" stroke="#5D4037" strokeWidth="4" opacity="0.7" />
            <path d="M-10,50 Q150,60 310,50" fill="none" stroke="#251613" strokeWidth="5" opacity="0.8" />
            <path d="M-10,90 Q150,100 310,90" fill="none" stroke="#6D4C41" strokeWidth="3" opacity="0.6" />
            <path d="M-10,130 Q150,140 310,130" fill="none" stroke="#251613" strokeWidth="6" opacity="0.8" />
            <path d="M-10,170 Q150,180 310,170" fill="none" stroke="#5D4037" strokeWidth="4" opacity="0.7" />
            <path d="M-10,210 Q150,220 310,210" fill="none" stroke="#795548" strokeWidth="3.5" opacity="0.6" />
            <path d="M-10,250 Q150,260 310,250" fill="none" stroke="#251613" strokeWidth="5" opacity="0.8" />
          </pattern>

          {/* 7. RESINA AVORIO PATTERN */}
          <pattern id="pat-avorio" patternUnits="userSpaceOnUse" width="300" height="300">
            <rect width="300" height="300" fill="#FDFBF7" />
            <path d="M0,0 Q100,70 150,160 T300,240 L300,0 Z" fill="#F4EFE6" opacity="0.75" />
            <path d="M-20,50 Q90,120 140,140 T230,220 T320,270" fill="none" stroke="#E8DFD1" strokeWidth="6" opacity="0.6" />
            <path d="M30,260 Q130,210 180,250 T300,300" fill="none" stroke="#EDE5DA" strokeWidth="4" opacity="0.5" />
          </pattern>

          {/* 8. RESINA TARTARUGA PATTERN */}
          <pattern id="pat-tartaruga" patternUnits="userSpaceOnUse" width="300" height="300">
            <rect width="300" height="300" fill="#D47A22" />
            <ellipse cx="60" cy="50" rx="35" ry="25" fill="#3D1A06" opacity="0.85" />
            <ellipse cx="180" cy="90" rx="45" ry="30" fill="#240D02" opacity="0.9" />
            <ellipse cx="110" cy="180" rx="50" ry="35" fill="#3D1A06" opacity="0.85" />
            <ellipse cx="240" cy="220" rx="40" ry="28" fill="#240D02" opacity="0.9" />
            <ellipse cx="50" cy="260" rx="30" ry="20" fill="#4E2308" opacity="0.8" />
            <path d="M0,0 L300,300" stroke="#FCA311" strokeWidth="8" opacity="0.4" />
          </pattern>
        </defs>

        {/* ----------------- 1. AMBIENT GROUND CONTACT SHADOWS ----------------- */}
        <g id="contact-shadows">
          <ellipse cx="445" cy="800" rx="75" ry="16" fill="url(#floor-shadow-main)" />
          <ellipse cx="300" cy="790" rx="65" ry="12" fill="url(#floor-shadow-spout)" />
        </g>

        {/* ----------------- 2. VERTICAL FAUCET BODY (MAIN CYLINDER) ----------------- */}
        <g id="faucet-main-body">
          <ellipse cx="445" cy="790" rx="30" ry="6" fill={finishProps.dark} />
          <rect x="415" y="480" width="60" height="310" fill="url(#body-cylinder-metal)" />
          <ellipse
            cx="445"
            cy="790"
            rx="30"
            ry="4"
            fill="none"
            stroke={finishProps.dark}
            strokeWidth="1.5"
            opacity="0.9"
          />
          <path
            d="M432,480 L432,790"
            stroke={finishProps.highlight}
            strokeWidth="2.5"
            opacity="0.65"
          />
        </g>

        {/* ----------------- 3. HORIZONTAL SPOUT ARM ASSEMBLY ----------------- */}
        <g id="horizontal-spout-assembly">
          <path
            d="M285,578 L415,536 L415,575 L285,605 Z"
            fill="url(#spout-bottom-metal)"
          />
          <path
            d="M285,548 L415,506 L475,486 L345,528 Z"
            fill="url(#spout-top-metal)"
          />
          <path
            d="M285,548 L345,528 L345,585 L285,605 Z"
            fill="url(#spout-nose-curve)"
          />

          <g id="aerator-assembly">
            <ellipse cx="315" cy="590" rx="14" ry="5.5" fill="#1A1A1D" />
            <ellipse
              cx="315"
              cy="590"
              rx="14"
              ry="5.5"
              fill="none"
              stroke={finishProps.base3}
              strokeWidth="1.2"
            />
            <ellipse cx="315" cy="590" rx="10" ry="3.5" fill="#2E3035" />
            <ellipse cx="315" cy="590" rx="5" ry="2" fill="#5C5E66" />
          </g>

          <path
            d="M285,578 L420,536"
            stroke={finishProps.highlight}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>

        {/* ----------------- 4. DIAGONAL SEAM ROTARY MIXER SPLIT ----------------- */}
        <g id="rotary-split-transition">
          <path
            d="M415,480 C435,465 455,460 475,445"
            fill="none"
            stroke={finishProps.dark}
            strokeWidth="2.2"
            opacity="0.9"
          />
          <path
            d="M415,481 C435,466 455,461 475,446"
            fill="none"
            stroke={finishProps.highlight}
            strokeWidth="1"
            opacity="0.8"
          />
        </g>

        {/* ----------------- 5. TOP KNOB / HANDLE (MANOPOLA F1420) ----------------- */}
        <g id="faucet-knob-manopola">
          <path
            d="M415,445 
               C415,445 440,432 475,432 
               L475,445 
               C455,460 435,465 415,480 Z"
            fill="url(#body-cylinder-metal)"
          />

          <g id="knob-cap-render">
            {handleType === 'CALACATTA' && (
              <rect x="415" y="360" width="60" height="85" fill="url(#pat-calacatta)" />
            )}
            {handleType === 'NERO_MARQUINA' && (
              <rect x="415" y="360" width="60" height="85" fill="url(#pat-marquina)" />
            )}
            {handleType === 'RESINA_CORNO' && (
              <rect x="415" y="360" width="60" height="85" fill="url(#pat-corno)" />
            )}
            {handleType === 'ROSSO_LEPANTO' && (
              <rect x="415" y="360" width="60" height="85" fill="url(#pat-lepanto)" />
            )}
            {handleType === 'VERDE_GUATEMALA' && (
              <rect x="415" y="360" width="60" height="85" fill="url(#pat-guatemala)" />
            )}
            {handleType === 'LEGNO_SCURO' && (
              <rect x="415" y="360" width="60" height="85" fill="url(#pat-legno)" />
            )}
            {handleType === 'RESINA_AVORIO' && (
              <rect x="415" y="360" width="60" height="85" fill="url(#pat-avorio)" />
            )}
            {handleType === 'RESINA_TARTARUGA' && (
              <rect x="415" y="360" width="60" height="85" fill="url(#pat-tartaruga)" />
            )}
            {handleType === 'METALLIC_MATCH' && (
              <rect x="415" y="360" width="60" height="85" fill="url(#body-cylinder-metal)" />
            )}
            {handleType === 'CUSTOM_TEXTURE' && handle?.texture_image_url && (
              <image
                href={handle.texture_image_url}
                x="415"
                y="360"
                width="60"
                height="85"
                preserveAspectRatio="xMidYMid slice"
              />
            )}

            <rect
              x="415"
              y="360"
              width="60"
              height="85"
              fill="url(#knob-3d-lighting)"
              opacity="0.85"
            />

            {handleType === 'CALACATTA' ? (
              <ellipse cx="445" cy="360" rx="30" ry="7" fill="url(#pat-calacatta)" />
            ) : handleType === 'NERO_MARQUINA' ? (
              <ellipse cx="445" cy="360" rx="30" ry="7" fill="url(#pat-marquina)" />
            ) : handleType === 'RESINA_CORNO' ? (
              <ellipse cx="445" cy="360" rx="30" ry="7" fill="url(#pat-corno)" />
            ) : handleType === 'ROSSO_LEPANTO' ? (
              <ellipse cx="445" cy="360" rx="30" ry="7" fill="url(#pat-lepanto)" />
            ) : handleType === 'VERDE_GUATEMALA' ? (
              <ellipse cx="445" cy="360" rx="30" ry="7" fill="url(#pat-guatemala)" />
            ) : handleType === 'LEGNO_SCURO' ? (
              <ellipse cx="445" cy="360" rx="30" ry="7" fill="url(#pat-legno)" />
            ) : handleType === 'RESINA_AVORIO' ? (
              <ellipse cx="445" cy="360" rx="30" ry="7" fill="url(#pat-avorio)" />
            ) : handleType === 'RESINA_TARTARUGA' ? (
              <ellipse cx="445" cy="360" rx="30" ry="7" fill="url(#pat-tartaruga)" />
            ) : (
              <ellipse cx="445" cy="360" rx="30" ry="7" fill="url(#body-cylinder-metal)" />
            )}

            <ellipse
              cx="445"
              cy="360"
              rx="30"
              ry="7"
              fill="url(#knob-top-ellipse-lighting)"
            />

            <ellipse
              cx="445"
              cy="360"
              rx="30"
              ry="7"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="0.8"
              opacity="0.6"
            />
          </g>

          <path
            d="M415,445 C435,432 455,432 475,445"
            fill="none"
            stroke={finishProps.dark}
            strokeWidth="1.5"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
};
