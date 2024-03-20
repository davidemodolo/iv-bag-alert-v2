import {
  CardType,
  CollectibleType,
  ModCallback,
} from "isaac-typescript-definitions";
import { getPlayers, hasCard } from "isaacscript-common";
import { name } from "../package.json";

const HEARTS = 5;
const TEXT_SECONDS = 3;
const { SUICIDE_KING } = CardType;
let printText = false;
let reset = true;
let endingFrames = -1;
const font = Font();
font.Load("font/pftempestasevencondensed.fnt");
const audioNames = ["Lu Bestemmia", "Lu Limoni", "Lu Urlo"];

const colorShades: Array<{ r: number; g: number; b: number; a: number }> = [];

function HSLToRGB(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  let r: number;
  let g: number;
  let b: number;

  if (s === 0) {
    r = l;
    g = l;
    b = l;
  } else {
    const hueToRGB = (p: number, q: number, t: number): number => {
      if (t < 0) {
        t++;
      }
      if (t > 1) {
        t--;
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRGB(p, q, h + 1 / 3);
    g = hueToRGB(p, q, h);
    b = hueToRGB(p, q, h - 1 / 3);
  }

  return [r, g, b];
}

for (let i = 1; i <= 100; i++) {
  const hue = i * (360 / 100);
  const [r, g, b] = HSLToRGB(hue, 1, 0.5);
  colorShades.push({ r, g, b, a: 1 }); // Assuming KColor is a color object with r, g, b, a properties
}

function getColor(extra = 0): unknown {
  const frames = Game().GetFrameCount() + extra;
  const index = frames % 100;
  return KColor(
    colorShades[index]?.r ?? 0,
    colorShades[index]?.g ?? 0,
    colorShades[index]?.b ?? 0,
    colorShades[index]?.a ?? 0,
  );
}

export function main(): void {
  const mod = RegisterMod(name, 1);

  mod.AddCallback(ModCallback.POST_USE_ITEM, usedIVbag, CollectibleType.IV_BAG);
  mod.AddCallback(ModCallback.POST_RENDER, renderWarning);
  mod.AddCallback(ModCallback.POST_RENDER, checkSuicideKing);

  Isaac.DebugString(`${name} initialized.`);
}

function checkSuicideKing() {
  const player = Isaac.GetPlayer(0);
  const hasSuicideKingCard = hasCard(player, SUICIDE_KING);
  if (hasSuicideKingCard) {
    font.DrawStringScaled(
      "OCCHIOOOOOO",
      43,
      25,
      1,
      1,
      getColor() as KColor,
      0,
      true,
    );
  }
}

function renderWarning() {
  if (printText && !reset) {
    font.DrawStringScaled(
      "You are going to die!",
      43,
      25,
      1,
      1,
      KColor(255 / 255, 0 / 255, 0 / 255, 1),
      0,
      true,
    );
  }
  if (endingFrames < Isaac.GetFrameCount()) {
    printText = false;
    reset = true;
  }
  for (const player of getPlayers()) {
    const hearts = player.GetHearts() + player.GetSoulHearts();
    if (hearts >= HEARTS) {
      reset = false;
    }
  }
}

function usedIVbag(): boolean {
  for (const player of getPlayers()) {
    const hearts = player.GetHearts() + player.GetSoulHearts();
    if (hearts < HEARTS && !reset) {
      printText = true;
      const randomAudio =
        audioNames[Math.floor(Math.random() * audioNames.length)] ?? ""; // Ensure randomAudio is always a string
      SFXManager().Play(Isaac.GetSoundIdByName(randomAudio), 1, 0, false, 1);
      endingFrames = Isaac.GetFrameCount() + TEXT_SECONDS * 60;
    }
  }
  return true;
}
