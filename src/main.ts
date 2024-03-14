import { CollectibleType, ModCallback } from "isaac-typescript-definitions";
import { getPlayers } from "isaacscript-common";
import { name } from "../package.json";

const HEARTS = 5;
const TEXT_SECONDS = 3;
let printText = false;
let reset = true;
let endingFrames = -1;
const font = Font();
font.Load("font/pftempestasevencondensed.fnt");
const audioNames = ["Lu Bestemmia", "Lu Limoni", "Lu Urlo"];

export function main(): void {
  const mod = RegisterMod(name, 1);

  mod.AddCallback(ModCallback.POST_USE_ITEM, usedIVbag, CollectibleType.IV_BAG);
  mod.AddCallback(ModCallback.POST_RENDER, renderWarning);

  Isaac.DebugString(`${name} initialized.`);
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
