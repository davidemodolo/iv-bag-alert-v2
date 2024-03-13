import {
  CollectibleType,
  ModCallback,
  SoundEffect,
} from "isaac-typescript-definitions";
import { getPlayerHealth, getPlayers } from "isaacscript-common";
import { name } from "../package.json";

const HEARTS = 5;
const TEXT_SECONDS = 3;
const IVBAG = CollectibleType.IV_BAG;
let printText = false;
let endingFrames = -1;
const font = Font();
font.Load("font/pftempestasevencondensed.fnt");
// This function is run when your mod first initializes.
export function main(): void {
  // Instantiate a new mod object, which grants the ability to add callback functions that
  // correspond to in-game events.
  const mod = RegisterMod(name, 1);

  mod.AddCallback(ModCallback.POST_USE_ITEM, usataIV, IVBAG);
  mod.AddCallback(ModCallback.POST_RENDER, renderWarning);
  // Print a message to the "log.txt" file.
  Isaac.DebugString(`${name} initialized.`);
}

function renderWarning() {
  if (printText) {
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
  }
}

function usataIV(): boolean {
  // if player health is less than 2, print a message to the console
  for (const player of getPlayers()) {
    if (getPlayerHealth(player).hearts < HEARTS) {
      printText = true;
      SFXManager().Play(SoundEffect.MOM_VOX_DEATH, 1, 0, false, 1);
      endingFrames = Isaac.GetFrameCount() + TEXT_SECONDS * 60;
    }
  }
  return true;
}
