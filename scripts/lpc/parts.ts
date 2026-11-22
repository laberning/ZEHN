// Auswahl der LPC-Teile. `def` = Datei unter sheet_definitions/ im LPC-Generator.
// Teile mit Palette werden im Browser umgefärbt; Teile ohne Palette brauchen eine feste `variant`.

export type BodyType = 'teen' | 'female' | 'male';
export type Anim = 'idle' | 'walk';

export const BODY_TYPES: readonly BodyType[] = ['teen', 'female', 'male'];

/** Pro Animation: Anzahl Bilder je Blickrichtung */
export const ANIMS: Record<Anim, { frames: number }> = { idle: { frames: 2 }, walk: { frames: 9 } };

export interface PartSpec {
  /** Datei unter sheet_definitions/ im LPC-Generator */
  def: string;
  /** feste Farbvariante (für Teile ohne Palette) */
  variant?: string;
  /** Palette-Materialien, wenn die Definition keine nennt: die Variante `white` des Teils trägt dieselben Töne wie die Basis der Palette, es lässt sich also umfärben */
  materials?: string[];
  /** nur für diese Körpertypen; ohne Angabe für alle */
  bodyTypes?: BodyType[];
}

export const PARTS: Record<string, PartSpec> = {
  // Körper und Köpfe
  body: { def: 'body/body.json' },
  'head-female': { def: 'head/heads/human/heads_human_female.json' },
  'head-male': { def: 'head/heads/human/heads_human_male.json' },
  'head-elderly': { def: 'head/heads/human/heads_human_female_elderly.json', bodyTypes: ['female'] },

  // Haare
  'hair-long': { def: 'hair/long/hair_long.json', bodyTypes: ['teen'] },
  'hair-bob': { def: 'hair/bob/hair_bob.json', bodyTypes: ['teen'] },
  'hair-plain': { def: 'hair/short/hair_plain.json', bodyTypes: ['teen', 'male'] },
  'hair-messy': { def: 'hair/short/hair_messy1.json', bodyTypes: ['teen'] },
  'hair-bun': { def: 'hair/braids/hair_bangs_bun.json', bodyTypes: ['female'] },
  mustache: { def: 'hair/mustaches/beards_handlebar.json', bodyTypes: ['male'] },

  // Oberteile (Palette "cloth")
  'shirt-tshirt': { def: 'torso/shirts/shortsleeve/torso_clothes_tshirt.json', bodyTypes: ['teen'] },
  'shirt-polo': { def: 'torso/shirts/shortsleeve/torso_clothes_shortsleeve_polo.json', bodyTypes: ['teen'] },
  'shirt-cardigan': { def: 'torso/shirts/longsleeve/torso_clothes_longsleeve2_cardigan.json', bodyTypes: ['teen'] },
  'shirt-longsleeve': { def: 'torso/shirts/longsleeve/torso_clothes_longsleeve.json' },
  necktie: { def: 'headwear/neck/neck_necktie.json', bodyTypes: ['teen'] },
  bowtie: { def: 'headwear/neck/neck_bowtie.json', bodyTypes: ['male', 'teen'] },
  belt: { def: 'torso/waist/belt_leather.json', variant: 'white', materials: ['cloth'], bodyTypes: ['teen'] },
  suspenders: { def: 'torso/aprons/torso_aprons_suspenders.json', variant: 'white', materials: ['cloth'], bodyTypes: ['teen'] },
  // Akt 6: Zubehör mit eigener Palette "cloth" (ohne Umweg über `variant`)
  epaulets: { def: 'arms/shoulders/shoulders_epaulets.json', bodyTypes: ['teen'] },
  cuffs: { def: 'arms/wrists/wrists_cuffs.json', bodyTypes: ['teen'] },

  // Beine und Füße
  pants: { def: 'legs/pants/legs_pants.json' },
  'pants-formal': { def: 'legs/pants/legs_formal.json', bodyTypes: ['male'] },
  shoes: { def: 'feet/shoes/feet_shoes_basic.json' },

  // Garderobe: Hosen und Schuhe (Teen-Körper)
  'pants-shorts': { def: 'legs/shorts/legs_shorts.json', bodyTypes: ['teen'] },
  skirt: { def: 'legs/skirts/legs_skirt_straight.json', bodyTypes: ['teen'] },
  'pants-cuffed': { def: 'legs/pants/legs_cuffed.json', bodyTypes: ['teen'] },
  leggings: { def: 'legs/leggings/legs_leggings.json', bodyTypes: ['teen'] },
  'pants-striped': { def: 'legs/pants/legs_formal_striped.json', bodyTypes: ['teen'] },
  'shoes-revised': { def: 'feet/shoes/feet_shoes_revised.json', bodyTypes: ['teen'] },
  sandals: { def: 'feet/feet_sandals.json', bodyTypes: ['teen'] },
  // Akt 6: Hohe Socken (Zubehör; liegen unter den Schuhen)
  'socks-high': { def: 'feet/socks/feet_socks_high.json', bodyTypes: ['teen'] },
  'boots-fold': { def: 'feet/boots/feet_boots_fold.json', bodyTypes: ['teen'] },
  'boots-rim': { def: 'feet/boots/feet_boots_rim.json', bodyTypes: ['teen'] },
  'boots-basic': { def: 'feet/boots/feet_boots_basic.json', bodyTypes: ['teen'] },

  // Ada
  apron: { def: 'torso/aprons/torso_aprons_apron.json', variant: 'white', bodyTypes: ['female'] },
  'glasses-round': { def: 'headwear/accessories/glasses/facial_glasses_round.json', variant: 'gray' },

  // Baron von Backspace
  // Der Umhang (Akt 7) ist derselbe Eintrag wie der des Barons; Palette "cloth", also färbbar
  cape: { def: 'torso/cape/cape_solid.json', bodyTypes: ['male', 'teen'] },
  vest: { def: 'torso/vest/torso_clothes_vest.json', variant: 'maroon', bodyTypes: ['male'] },
  tophat: { def: 'headwear/hats/formal/hat_formal_tophat.json', variant: 'black', bodyTypes: ['male'] },
  monocle: { def: 'headwear/accessories/monocle/facial_monocle_right.json', variant: 'gold', bodyTypes: ['male'] },

  // Ausrüstung, die über Abzeichen freigeschaltet wird
  'glasses-nerd': { def: 'headwear/accessories/glasses/facial_glasses_nerd.json', variant: 'black', bodyTypes: ['teen'] },
  'glasses-sun': { def: 'headwear/accessories/glasses/facial_glasses_sunglasses.json', variant: 'sunglasses', bodyTypes: ['teen'] },
  'glasses-shades': { def: 'headwear/accessories/glasses/facial_glasses_shades.json', variant: 'black', bodyTypes: ['teen'] },

  // Frisuren für jeden Haartyp (frei) und Stil-Frisuren (freispielbar)
  'hair-afro': { def: 'hair/afro/hair_afro.json', bodyTypes: ['teen'] },
  'hair-natural': { def: 'hair/afro/hair_natural.json', bodyTypes: ['teen'] },
  'hair-cornrows': { def: 'hair/afro/hair_cornrows.json', bodyTypes: ['teen'] },
  'hair-twists': { def: 'hair/afro/hair_twists_straight.json', bodyTypes: ['teen'] },
  'hair-dreads': { def: 'hair/afro/hair_dreadlocks_long.json', bodyTypes: ['teen'] },
  'hair-curly': { def: 'hair/curly/hair_curly_short.json', bodyTypes: ['teen'] },
  'hair-curly-long': { def: 'hair/curly/hair_curly_long.json', bodyTypes: ['teen'] },
  'hair-braid': { def: 'hair/braids/hair_braid.json', bodyTypes: ['teen'] },
  'hair-ponytail': { def: 'hair/braids/hair_ponytail.json', bodyTypes: ['teen'] },
  'hair-spiked': { def: 'hair/spiky/hair_spiked.json', bodyTypes: ['teen'] },

  // Weste über dem Langarmshirt, Kopfbedeckungen, Zubehör
  'vest-buttoned': { def: 'torso/shirts/sleeveless/torso_clothes_sleeveless2_buttoned.json', bodyTypes: ['teen'] },
  bandana: { def: 'headwear/coverings/bandana/hat_bandana.json', bodyTypes: ['teen'] },
  headband: { def: 'headwear/coverings/headbands/hat_headband_thick.json', bodyTypes: ['teen'] },
  scarf: { def: 'headwear/neck/neck_scarf.json', bodyTypes: ['teen'] },
  'cap-leather': { def: 'headwear/hats/caps/hat_cap_leather.json', bodyTypes: ['teen'] },
  bowler: { def: 'headwear/hats/formal/hat_formal_bowler.json', variant: 'charcoal', bodyTypes: ['teen'] },
  // Akt 7: Dreispitz (Kopfbedeckung) und Augenklappe (zählt als Brille), beide mit fester Variante
  tricorne: { def: 'headwear/hats/tricorne/hat_tricorne.json', variant: 'black', bodyTypes: ['teen'] },
  eyepatch: { def: 'headwear/accessories/eyepatch/facial_eyepatch_right.json', variant: 'black', bodyTypes: ['teen'] },
};
